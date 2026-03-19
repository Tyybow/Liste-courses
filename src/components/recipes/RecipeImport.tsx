import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Unit, RecipeIngredient } from '../../types';
import { UNITS } from '../../types';

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

interface MatchedIngredient {
  scraped: ScrapedIngredient;
  matchedId: string | null;
  matchedName: string;
  quantity: number;
  unit: Unit;
  include: boolean;
}

export default function RecipeImport({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const { ingredients, addIngredient, addRecipe } = useStore();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scraped, setScraped] = useState<ScrapedRecipe | null>(null);
  const [matched, setMatched] = useState<MatchedIngredient[]>([]);
  const [recipeName, setRecipeName] = useState('');

  const validUnits = new Set<string>(UNITS);

  const normalizeUnit = (unit: string): Unit => {
    if (validUnits.has(unit)) return unit as Unit;
    return 'pièce(s)';
  };

  const matchIngredientToExisting = (scraped: ScrapedIngredient): MatchedIngredient => {
    const searchName = scraped.name.toLowerCase().trim();

    // Try exact match first
    let match = ingredients.find((i) => i.name.toLowerCase() === searchName);

    // Try partial match (ingredient name contains search or vice versa)
    if (!match) {
      match = ingredients.find((i) =>
        i.name.toLowerCase().includes(searchName) ||
        searchName.includes(i.name.toLowerCase())
      );
    }

    // Try matching individual words (for compound ingredients)
    if (!match) {
      const words = searchName.split(/\s+/).filter((w) => w.length > 3);
      for (const word of words) {
        match = ingredients.find((i) => i.name.toLowerCase().includes(word));
        if (match) break;
      }
    }

    return {
      scraped,
      matchedId: match?.id ?? null,
      matchedName: match?.name ?? scraped.name,
      quantity: scraped.quantity,
      unit: match ? normalizeUnit(scraped.unit) || match.defaultUnit : normalizeUnit(scraped.unit),
      include: true,
    };
  };

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setScraped(null);

    try {
      const res = await fetch('/api/scrape-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const text = await res.text();
      if (!text) {
        throw new Error('Le serveur n\'a pas répondu. Assurez-vous que l\'app est déployée sur Vercel (cette fonctionnalité ne marche pas en local).');
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Réponse invalide du serveur. Vérifiez que l\'URL est correcte.');
      }

      if (!res.ok) {
        let msg = data.error || 'Erreur lors du scraping';
        if (data.debug) {
          msg += ` (page: "${data.debug.pageTitle}", JSON-LD: ${data.debug.hasJsonLd ? 'oui' : 'non'}, taille: ${data.debug.htmlLength})`;
        }
        throw new Error(msg);
      }

      const recipe = data as ScrapedRecipe;
      setScraped(recipe);
      setRecipeName(recipe.name);

      // Match ingredients
      const matchedIngredients = recipe.ingredients.map(matchIngredientToExisting);
      setMatched(matchedIngredients);
    } catch (err: any) {
      setError(err.message || 'Impossible de récupérer la recette');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (idx: number) => {
    setMatched((prev) => prev.map((m, i) => i === idx ? { ...m, include: !m.include } : m));
  };

  const updateMatchedUnit = (idx: number, unit: Unit) => {
    setMatched((prev) => prev.map((m, i) => i === idx ? { ...m, unit } : m));
  };

  const updateMatchedQty = (idx: number, qty: number) => {
    setMatched((prev) => prev.map((m, i) => i === idx ? { ...m, quantity: qty } : m));
  };

  const handleImport = () => {
    if (!scraped || !recipeName.trim()) return;

    const servingsRatio = 2 / (scraped.servings || 4);

    const recipeIngredients: RecipeIngredient[] = [];

    for (const m of matched) {
      if (!m.include) continue;

      let ingredientId: string;
      if (m.matchedId) {
        ingredientId = m.matchedId;
      } else {
        // Create new ingredient
        ingredientId = addIngredient({
          name: m.matchedName,
          category: 'Autre',
          defaultUnit: m.unit,
        });
      }

      // Adjust quantity for 2 persons
      const adjustedQty = Math.round(m.quantity * servingsRatio * 100) / 100;

      recipeIngredients.push({
        ingredientId,
        quantity: adjustedQty,
        unit: m.unit,
      });
    }

    addRecipe({
      name: recipeName.trim(),
      category: 'Autre',
      prepTime: scraped.prepTime,
      cookTime: scraped.cookTime,
      difficulty: 'Moyen',
      instructions: scraped.instructions,
      ingredients: recipeIngredients,
    });

    onImported();
    onClose();
  };

  return (
    <div className="card-glass rounded-2xl border border-gray-200/60 p-5 space-y-4 animate-fade-in">
      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        Importer une recette depuis un site web
      </h3>

      {/* URL Input */}
      {!scraped && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Collez l'URL d'une recette (Marmiton, 750g, Cuisineaz, etc.)
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://www.marmiton.org/recettes/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFetch(); } }}
              className="flex-1 px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              autoFocus
            />
            <button
              onClick={handleFetch}
              disabled={loading || !url.trim()}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                loading || !url.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-gradient text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Chargement...
                </span>
              ) : (
                'Récupérer'
              )}
            </button>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-200/60">
              {error}
            </div>
          )}
          {/* Supported sites */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span className="font-medium text-gray-500">Sites compatibles :</span>
            <span>Marmiton</span>
            <span>750g</span>
            <span>CuisineAZ</span>
            <span>Ptitchef</span>
            <span>Journal des Femmes</span>
            <span>Hervé Cuisine</span>
            <span>Ricardo</span>
            <span className="italic">et tout site avec données structurées</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100/80 transition-colors cursor-pointer font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Preview / Edit scraped recipe */}
      {scraped && (
        <div className="space-y-4 animate-fade-in">
          {/* Recipe info */}
          <div className="bg-gradient-to-r from-primary/8 to-primary/4 rounded-xl p-4 space-y-3 border border-primary/10">
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-1.5">Nom de la recette</label>
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prépa : {scraped.prepTime} min
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                Cuisson : {scraped.cookTime} min
              </span>
              <span className="text-primary font-medium">Pour {scraped.servings} pers. → 2 pers.</span>
            </div>
          </div>

          {/* Ingredients matching */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">
              Ingrédients ({matched.filter((m) => m.include).length}/{matched.length} sélectionnés)
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {matched.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm border transition-all ${
                    m.include
                      ? m.matchedId
                        ? 'bg-emerald-50/80 border-emerald-200/60'
                        : 'bg-amber-50/80 border-amber-200/60'
                      : 'bg-gray-50/50 border-gray-200/40 opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={m.include}
                    onChange={() => toggleIngredient(idx)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-gray-800 truncate">{m.matchedName}</span>
                      {m.matchedId ? (
                        <span className="text-xs text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium">trouvé</span>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full font-medium">nouveau</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">Source : {m.scraped.raw}</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={m.quantity || ''}
                    onChange={(e) => updateMatchedQty(idx, Number(e.target.value))}
                    className="w-16 px-2 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <select
                    value={m.unit}
                    onChange={(e) => updateMatchedUnit(idx, e.target.value as Unit)}
                    className="px-2 py-1.5 bg-white/80 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions preview */}
          {scraped.instructions && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1.5">Instructions</h4>
              <div className="bg-gray-50/80 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-line max-h-40 overflow-y-auto border border-gray-100/60 leading-relaxed">
                {scraped.instructions}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100/60">
            <button
              onClick={handleImport}
              disabled={matched.filter((m) => m.include).length === 0 || !recipeName.trim()}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                matched.filter((m) => m.include).length === 0 || !recipeName.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-gradient text-white'
              }`}
            >
              Importer la recette
            </button>
            <button
              onClick={() => { setScraped(null); setMatched([]); setError(''); }}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100/80 transition-colors cursor-pointer font-medium"
            >
              Changer d'URL
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100/80 transition-colors cursor-pointer font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
