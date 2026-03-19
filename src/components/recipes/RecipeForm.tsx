import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Recipe, RecipeIngredient, RecipeCategory, Difficulty, Unit } from '../../types';
import { RECIPE_CATEGORIES, UNITS } from '../../types';

interface RecipeFormProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export default function RecipeForm({ recipe, onClose }: RecipeFormProps) {
  const { ingredients, addIngredient, addRecipe, updateRecipe } = useStore();

  const [name, setName] = useState(recipe?.name ?? '');
  const [category, setCategory] = useState<RecipeCategory>(recipe?.category ?? 'Autre');
  const [prepTime, setPrepTime] = useState(recipe?.prepTime ?? 0);
  const [cookTime, setCookTime] = useState(recipe?.cookTime ?? 0);
  const [difficulty, setDifficulty] = useState<Difficulty>(recipe?.difficulty ?? 'Facile');
  const [instructions, setInstructions] = useState(recipe?.instructions ?? '');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(
    recipe?.ingredients ?? []
  );

  // Ingredient input with autocomplete
  const [ingSearch, setIngSearch] = useState('');
  const [selectedQty, setSelectedQty] = useState<number>(0);
  const [selectedUnit, setSelectedUnit] = useState<Unit>('g');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on search text
  const suggestions = ingSearch.trim()
    ? ingredients
        .filter((i) =>
          i.name.toLowerCase().includes(ingSearch.toLowerCase()) &&
          !recipeIngredients.some((ri) => ri.ingredientId === i.id)
        )
        .sort((a, b) => {
          // Prioritize names that start with the search term
          const aStarts = a.name.toLowerCase().startsWith(ingSearch.toLowerCase());
          const bStarts = b.name.toLowerCase().startsWith(ingSearch.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 8)
    : [];

  const exactMatch = ingredients.find(
    (i) => i.name.toLowerCase() === ingSearch.trim().toLowerCase()
  );

  const canCreateNew = ingSearch.trim().length > 0 && !exactMatch;

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectIngredient = (id: string) => {
    const ing = ingredients.find((i) => i.id === id);
    if (ing) {
      setIngSearch(ing.name);
      setSelectedUnit(ing.defaultUnit);
    }
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const addIngredientLine = () => {
    if (!ingSearch.trim() || selectedQty <= 0) return;

    let ingredientId: string;

    if (exactMatch) {
      ingredientId = exactMatch.id;
    } else {
      // Create the ingredient on the fly
      ingredientId = addIngredient({
        name: ingSearch.trim(),
        category: 'Autre',
        defaultUnit: selectedUnit,
      });
    }

    if (recipeIngredients.some((ri) => ri.ingredientId === ingredientId)) return;

    setRecipeIngredients([
      ...recipeIngredients,
      { ingredientId, quantity: selectedQty, unit: selectedUnit },
    ]);
    setIngSearch('');
    setSelectedQty(0);
    setSelectedUnit('g');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addIngredientLine();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        selectIngredient(suggestions[highlightedIndex].id);
      } else {
        addIngredientLine();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const removeIngredientLine = (ingredientId: string) => {
    setRecipeIngredients(recipeIngredients.filter((ri) => ri.ingredientId !== ingredientId));
  };

  const getIngredientName = (id: string) =>
    ingredients.find((i) => i.id === id)?.name ?? 'Inconnu';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || recipeIngredients.length === 0) return;

    const data = {
      name: name.trim(),
      category,
      prepTime,
      cookTime,
      difficulty,
      instructions: instructions.trim(),
      ingredients: recipeIngredients,
    };

    if (recipe) {
      updateRecipe(recipe.id, data);
    } else {
      addRecipe(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="card-glass rounded-2xl border border-gray-200/60 p-5 space-y-5 animate-fade-in">
      <h3 className="font-bold text-gray-800 text-lg">{recipe ? 'Modifier la recette' : 'Nouvelle recette'}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Nom de la recette"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          required
          autoFocus
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as RecipeCategory)}
          className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        >
          {RECIPE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Prépa (min)</label>
          <input
            type="number"
            min={0}
            value={prepTime}
            onChange={(e) => setPrepTime(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Cuisson (min)</label>
          <input
            type="number"
            min={0}
            value={cookTime}
            onChange={(e) => setCookTime(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Difficulté</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          >
            <option value="Facile">Facile</option>
            <option value="Moyen">Moyen</option>
            <option value="Difficile">Difficile</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          placeholder="Décrivez les étapes de préparation..."
          className="w-full px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-y"
        />
      </div>

      {/* Ingrédients de la recette */}
      <div>
        <label className="text-xs font-medium text-gray-400 mb-2 block">Ingrédients (pour 2 personnes)</label>

        {recipeIngredients.length > 0 && (
          <ul className="space-y-1.5 mb-3">
            {recipeIngredients.map((ri) => (
              <li key={ri.ingredientId} className="flex items-center justify-between bg-gradient-to-r from-primary/6 to-primary/3 px-3.5 py-2.5 rounded-xl text-sm border border-primary/10">
                <span className="font-medium text-gray-700">{ri.quantity} {ri.unit} {getIngredientName(ri.ingredientId)}</span>
                <button
                  type="button"
                  onClick={() => removeIngredientLine(ri.ingredientId)}
                  className="text-gray-400 hover:text-danger text-xs cursor-pointer font-medium transition-colors"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Autocomplete ingredient input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tapez un ingrédient..."
              value={ingSearch}
              onChange={(e) => {
                setIngSearch(e.target.value);
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => ingSearch.trim() && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
            {showSuggestions && ingSearch.trim() && (suggestions.length > 0 || canCreateNew) && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200/60 rounded-xl shadow-lg max-h-48 overflow-y-auto"
              >
                {suggestions.map((ing, idx) => (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => selectIngredient(ing.id)}
                    className={`w-full text-left px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                      idx === highlightedIndex
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {ing.name}
                    <span className="text-xs text-gray-400 ml-2">({ing.category})</span>
                  </button>
                ))}
                {canCreateNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-primary font-medium hover:bg-primary/5 cursor-pointer border-t border-gray-100"
                  >
                    + Créer « {ingSearch.trim()} »
                  </button>
                )}
              </div>
            )}
          </div>
          <input
            type="number"
            min={0}
            step="any"
            placeholder="Qté"
            value={selectedQty || ''}
            onChange={(e) => setSelectedQty(Number(e.target.value))}
            className="w-20 px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value as Unit)}
            className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addIngredientLine}
            className="btn-gradient text-white px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          >
            +
          </button>
        </div>
        {ingSearch.trim() && !exactMatch && (
          <p className="text-xs text-gray-400 mt-1">
            « {ingSearch.trim()} » sera ajouté automatiquement au catalogue
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100/60">
        <button
          type="submit"
          className="btn-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
        >
          {recipe ? 'Enregistrer' : 'Créer la recette'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100/80 transition-colors cursor-pointer font-medium"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
