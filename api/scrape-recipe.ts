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

  const unitMappings: Record<string, string> = {
    'g': 'g', 'gr': 'g', 'gramme': 'g', 'grammes': 'g',
    'kg': 'kg', 'kilo': 'kg', 'kilos': 'kg', 'kilogramme': 'kg', 'kilogrammes': 'kg',
    'ml': 'ml', 'millilitre': 'ml', 'millilitres': 'ml',
    'cl': 'ml', 'centilitre': 'ml', 'centilitres': 'ml',
    'l': 'L', 'litre': 'L', 'litres': 'L',
    'dl': 'ml', 'décilitre': 'ml', 'décilitres': 'ml',
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

  let quantity = 1;
  let rest = cleaned;

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

  let unit = 'pièce(s)';
  let unitFound = false;

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
    const unitMatch = rest.match(/^([a-zA-Zéèêàùç.]+)\b\s*/i);
    if (unitMatch) {
      const potentialUnit = unitMatch[1].toLowerCase();
      if (unitMappings[potentialUnit] !== undefined) {
        unit = unitMappings[potentialUnit];
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

  let name = rest
    .replace(/^(de |d'|d\u2019|du |des |la |le |les |l'|l\u2019)/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (name) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (!name) {
    name = cleaned;
    quantity = 1;
    unit = 'pièce(s)';
  }

  return { name, quantity, unit, raw: cleaned };
}

// Try to find JSON-LD Recipe data in HTML
function extractJsonLd(html: string): any | null {
  // Try multiple regex patterns for JSON-LD extraction
  const patterns = [
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim();
        const parsed = JSON.parse(jsonContent);

        // Direct Recipe object
        if (parsed['@type'] === 'Recipe') return parsed;
        if (Array.isArray(parsed['@type']) && parsed['@type'].includes('Recipe')) return parsed;

        // Array of objects
        if (Array.isArray(parsed)) {
          const recipe = parsed.find((item: any) =>
            item['@type'] === 'Recipe' ||
            (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
          );
          if (recipe) return recipe;
        }

        // @graph array
        if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          const recipe = parsed['@graph'].find((item: any) =>
            item['@type'] === 'Recipe' ||
            (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
          );
          if (recipe) return recipe;
        }
      } catch {
        // Skip invalid JSON, continue trying
      }
    }
  }
  return null;
}

// Fallback: parse HTML directly for recipe data (works for Marmiton, etc.)
function extractFromHtml(html: string): any | null {
  // Try to extract recipe title
  const titleMatch =
    html.match(/<h1[^>]*class="[^"]*(?:recipe-title|SHRD__sc-)[^"]*"[^>]*>(.*?)<\/h1>/is) ||
    html.match(/<h1[^>]*>(.*?)<\/h1>/is) ||
    html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);

  if (!titleMatch) return null;

  const name = titleMatch[1].replace(/<[^>]+>/g, '').trim();
  if (!name) return null;

  // Extract ingredients from various HTML patterns
  const ingredientsList: string[] = [];

  // Pattern 1: Marmiton-style ingredient cards/spans
  const ingPatterns = [
    /<span[^>]*class="[^"]*ingredient-name[^"]*"[^>]*>(.*?)<\/span>/gi,
    /<li[^>]*class="[^"]*ingredient[^"]*"[^>]*>(.*?)<\/li>/gi,
    /<div[^>]*class="[^"]*ingredient[^"]*"[^>]*>(.*?)<\/div>/gi,
    /itemprop="recipeIngredient"[^>]*>(.*?)</gi,
    /itemprop="ingredients"[^>]*>(.*?)</gi,
  ];

  for (const pattern of ingPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const text = match[1].replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 1 && text.length < 200) {
        ingredientsList.push(text);
      }
    }
    if (ingredientsList.length > 0) break;
  }

  // Extract prep/cook time from meta tags or HTML
  let prepTime = '';
  let cookTime = '';

  const prepMatch = html.match(/itemprop="prepTime"[^>]*content="([^"]*)"[^>]*/i) ||
    html.match(/itemprop="prepTime"[^>]*>(.*?)</i);
  if (prepMatch) prepTime = prepMatch[1];

  const cookMatch = html.match(/itemprop="cookTime"[^>]*content="([^"]*)"[^>]*/i) ||
    html.match(/itemprop="cookTime"[^>]*>(.*?)</i) ||
    html.match(/itemprop="totalTime"[^>]*content="([^"]*)"[^>]*/i);
  if (cookMatch) cookTime = cookMatch[1];

  // Extract servings
  let recipeYield = '';
  const yieldMatch = html.match(/itemprop="recipeYield"[^>]*content="([^"]*)"[^>]*/i) ||
    html.match(/itemprop="recipeYield"[^>]*>(.*?)</i);
  if (yieldMatch) recipeYield = yieldMatch[1].replace(/<[^>]+>/g, '').trim();

  // Extract instructions
  const instructionsList: string[] = [];
  const instrPatterns = [
    /itemprop="recipeInstructions"[^>]*>(.*?)<\/(?:div|ol|section)/gis,
    /<div[^>]*class="[^"]*instruction[^"]*"[^>]*>(.*?)<\/div>/gi,
    /<li[^>]*class="[^"]*step[^"]*"[^>]*>(.*?)<\/li>/gi,
  ];

  for (const pattern of instrPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      // Extract text from list items or paragraphs within
      const content = match[1];
      const steps = content.match(/<(?:li|p)[^>]*>(.*?)<\/(?:li|p)>/gi);
      if (steps) {
        for (const step of steps) {
          const text = step.replace(/<[^>]+>/g, '').trim();
          if (text) instructionsList.push(text);
        }
      } else {
        const text = content.replace(/<[^>]+>/g, '').trim();
        if (text) instructionsList.push(text);
      }
    }
    if (instructionsList.length > 0) break;
  }

  if (ingredientsList.length === 0) return null;

  return {
    name,
    prepTime: prepTime,
    cookTime: cookTime,
    recipeYield: recipeYield || '4',
    recipeIngredient: ingredientsList,
    recipeInstructions: instructionsList.map((text) => ({ text })),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    // Fetch with headers that bypass cookie consent walls
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        // Accept cookies to bypass consent
        'Cookie': 'euconsent-v2=CPzqEAAPzqEAAAHABBENDeCgAAAAAAAAACiQAAAAAAAA; didomi_token=eyJ1c2VyX2lkIjoiMThhNjA3ODktYWIwMi02YjFjLWI1YjgtYmUxZjJhMzgzYmM0IiwiY3JlYXRlZCI6IjIwMjMtMDktMDRUMTQ6NDg6MTAuNjMyWiIsInVwZGF0ZWQiOiIyMDIzLTA5LTA0VDE0OjQ4OjE5Ljc2NloiLCJ2ZW5kb3JzIjp7ImVuYWJsZWQiOlsiZ29vZ2xlIl19LCJwdXJwb3NlcyI6eyJlbmFibGVkIjpbXX19',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Impossible de charger la page (erreur ${response.status})` });
    }

    const html = await response.text();

    // Method 1: Try JSON-LD extraction
    let recipeData = extractJsonLd(html);

    // Method 2: Fallback to HTML parsing
    if (!recipeData) {
      recipeData = extractFromHtml(html);
    }

    if (!recipeData) {
      // Return debug info
      const hasJsonLd = html.includes('application/ld+json');
      const hasRecipeWord = html.includes('Recipe') || html.includes('recipe');
      const pageTitle = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || 'unknown';
      return res.status(400).json({
        error: `Impossible de trouver les données de recette sur cette page.`,
        debug: {
          pageTitle: pageTitle.substring(0, 100),
          hasJsonLd,
          hasRecipeWord,
          htmlLength: html.length,
        },
      });
    }

    // Parse the recipe data (works for both JSON-LD and HTML-extracted data)
    const name = recipeData.name || 'Recette importée';

    let prepTime = 0;
    if (recipeData.prepTime) {
      prepTime = typeof recipeData.prepTime === 'string' && recipeData.prepTime.startsWith('PT')
        ? parseDuration(recipeData.prepTime)
        : parseInt(String(recipeData.prepTime).replace(/\D/g, ''), 10) || 0;
    }

    let cookTime = 0;
    const cookField = recipeData.cookTime || recipeData.totalTime || '';
    if (cookField) {
      cookTime = typeof cookField === 'string' && cookField.startsWith('PT')
        ? parseDuration(cookField)
        : parseInt(String(cookField).replace(/\D/g, ''), 10) || 0;
    }

    let servings = 4;
    if (recipeData.recipeYield) {
      const yieldStr = Array.isArray(recipeData.recipeYield) ? recipeData.recipeYield[0] : recipeData.recipeYield;
      const yieldMatch = String(yieldStr).match(/(\d+)/);
      if (yieldMatch) {
        servings = parseInt(yieldMatch[1], 10);
      }
    }

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

    instructions = instructions
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();

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
    return res.status(500).json({ error: error.message || 'Une erreur est survenue lors de la récupération de la recette' });
  }
}
