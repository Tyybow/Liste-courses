import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ScrapedIngredient {
  name: string;
  quantity: number;
  unit: string;
  raw: string;
}

interface ScrapedRecipe {
  name: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  instructions: string;
  ingredients: ScrapedIngredient[];
  source: string;
}

// Parse ISO 8601 duration (PT15M, PT1H30M, etc.) to minutes
function parseDuration(iso: string): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

// Parse a French ingredient string like "200 g de farine" or "4 oeufs"
function parseIngredientString(raw: string): ScrapedIngredient {
  const cleaned = raw.trim().replace(/\s+/g, ' ');

  // Common unit mappings to normalize
  const unitMappings: Record<string, string> = {
    'g': 'g', 'gr': 'g', 'gramme': 'g', 'grammes': 'g',
    'kg': 'kg', 'kilo': 'kg', 'kilos': 'kg', 'kilogramme': 'kg', 'kilogrammes': 'kg',
    'ml': 'ml', 'millilitre': 'ml', 'millilitres': 'ml',
    'cl': 'ml', 'centilitre': 'ml', 'centilitres': 'ml', // will multiply by 10
    'l': 'L', 'litre': 'L', 'litres': 'L',
    'dl': 'ml', 'décilitre': 'ml', 'décilitres': 'ml', // will multiply by 100
    'c. à soupe': 'c. à soupe', 'cuillère à soupe': 'c. à soupe', 'cuillères à soupe': 'c. à soupe',
    'cas': 'c. à soupe', 'c.a.s': 'c. à soupe', 'c.à.s': 'c. à soupe',
    'c. à café': 'c. à café', 'cuillère à café': 'c. à café', 'cuillères à café': 'c. à café',
    'cac': 'c. à café', 'c.a.c': 'c. à café', 'c.à.c': 'c. à café',
    'sachet': 'sachet(s)', 'sachets': 'sachet(s)',
    'tranche': 'tranche(s)', 'tranches': 'tranche(s)',
    'gousse': 'gousse(s)', 'gousses': 'gousse(s)',
    'branche': 'branche(s)', 'branches': 'branche(s)',
    'pièce': 'pièce(s)', 'pièces': 'pièce(s)',
  };

  // Try pattern: "200 g de farine" or "4 oeufs" or "1/2 cuillère à café de sel"
  // Step 1: Extract quantity (number, fraction, or range)
  let quantity = 1;
  let rest = cleaned;

  // Match leading number (with possible fraction or decimal)
  const qtyMatch = rest.match(/^(\d+(?:[.,/]\d+)?)\s*/);
  if (qtyMatch) {
    const qtyStr = qtyMatch[1];
    if (qtyStr.includes('/')) {
      const parts = qtyStr.split('/');
      quantity = parseInt(parts[0], 10) / parseInt(parts[1], 10);
    } else {
      quantity = parseFloat(qtyStr.replace(',', '.'));
    }
    rest = rest.slice(qtyMatch[0].length);
  }

  // Step 2: Try to extract unit
  let unit = 'pièce(s)';
  let unitFound = false;

  // Try multi-word units first (cuillère à soupe, etc.)
  const multiWordUnits = [
    'cuillères à soupe', 'cuillère à soupe', 'c. à soupe', 'c.à.s', 'c.a.s',
    'cuillères à café', 'cuillère à café', 'c. à café', 'c.à.c', 'c.a.c',
  ];
  for (const mwu of multiWordUnits) {
    if (rest.toLowerCase().startsWith(mwu)) {
      unit = unitMappings[mwu] || mwu;
      rest = rest.slice(mwu.length).trim();
      unitFound = true;
      break;
    }
  }

  if (!unitFound) {
    // Try single-word unit
    const unitMatch = rest.match(/^([a-zA-Zéèêàùç.]+)\b\s*/i);
    if (unitMatch) {
      const potentialUnit = unitMatch[1].toLowerCase();
      if (unitMappings[potentialUnit] !== undefined) {
        unit = unitMappings[potentialUnit];

        // Handle cl -> ml conversion
        if (potentialUnit === 'cl' || potentialUnit === 'centilitre' || potentialUnit === 'centilitres') {
          quantity *= 10;
        } else if (potentialUnit === 'dl' || potentialUnit === 'décilitre' || potentialUnit === 'décilitres') {
          quantity *= 100;
        }

        rest = rest.slice(unitMatch[0].length);
        unitFound = true;
      }
    }
  }

  // Step 3: Clean up the ingredient name
  let name = rest
    .replace(/^(de |d'|d\u2019|du |des |la |le |les |l'|l\u2019)/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  if (name) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  // If name is empty, use the raw text
  if (!name) {
    name = cleaned;
    quantity = 1;
    unit = 'pièce(s)';
  }

  return { name, quantity, unit, raw: cleaned };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body as { url?: string };
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch the recipe page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Failed to fetch URL: ${response.status}` });
    }

    const html = await response.text();

    // Try to extract JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    let recipeData: any = null;

    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
          const parsed = JSON.parse(jsonContent);

          // Handle both single objects and arrays
          const items = Array.isArray(parsed) ? parsed : parsed['@graph'] ? parsed['@graph'] : [parsed];

          for (const item of items) {
            if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
              recipeData = item;
              break;
            }
          }
          if (recipeData) break;
        } catch {
          // Skip invalid JSON
        }
      }
    }

    if (!recipeData) {
      return res.status(400).json({ error: 'No recipe data found on this page. Make sure the URL points to a recipe page.' });
    }

    // Parse the recipe data
    const name = recipeData.name || 'Recette importée';
    const prepTime = parseDuration(recipeData.prepTime || '');
    const cookTime = parseDuration(recipeData.cookTime || recipeData.totalTime || '');

    // Parse servings
    let servings = 4;
    if (recipeData.recipeYield) {
      const yieldStr = Array.isArray(recipeData.recipeYield) ? recipeData.recipeYield[0] : recipeData.recipeYield;
      const yieldMatch = String(yieldStr).match(/(\d+)/);
      if (yieldMatch) {
        servings = parseInt(yieldMatch[1], 10);
      }
    }

    // Parse instructions
    let instructions = '';
    if (recipeData.recipeInstructions) {
      if (typeof recipeData.recipeInstructions === 'string') {
        instructions = recipeData.recipeInstructions;
      } else if (Array.isArray(recipeData.recipeInstructions)) {
        instructions = recipeData.recipeInstructions
          .map((step: any, i: number) => {
            const text = typeof step === 'string' ? step : step.text || step.name || '';
            return `${i + 1}. ${text}`;
          })
          .join('\n');
      }
    }

    // Clean up HTML from instructions
    instructions = instructions
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();

    // Parse ingredients
    const rawIngredients: string[] = recipeData.recipeIngredient || [];
    const ingredients: ScrapedIngredient[] = rawIngredients.map((raw: string) =>
      parseIngredientString(raw.replace(/<[^>]+>/g, '').trim())
    );

    const result: ScrapedRecipe = {
      name,
      prepTime,
      cookTime,
      servings,
      instructions,
      ingredients,
      source: url,
    };

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'An error occurred while scraping the recipe' });
  }
}
