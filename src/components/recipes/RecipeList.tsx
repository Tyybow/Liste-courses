import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Recipe, Difficulty } from '../../types';
import { RECIPE_CATEGORIES } from '../../types';
import RecipeForm from './RecipeForm';

export default function RecipeList() {
  const { recipes, ingredients, deleteRecipe } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const filtered = recipes
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => !filterCategory || r.category === filterCategory)
    .sort((a, b) => a.name.localeCompare(b.name));

  const getIngredientName = (id: string) =>
    ingredients.find((i) => i.id === id)?.name ?? 'Inconnu';

  const difficultyColor = (d: Difficulty) => {
    if (d === 'Facile') return 'bg-green-100 text-green-700';
    if (d === 'Moyen') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const startEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Recettes ({recipes.length})</h2>
        <button
          onClick={() => { setShowForm(true); setEditingRecipe(null); }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          + Nouvelle recette
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Toutes catégories</option>
          {RECIPE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Formulaire */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={closeForm}
        />
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Aucune recette trouvée.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{recipe.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {recipe.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Prépa {recipe.prepTime} min • Cuisson {recipe.cookTime} min • {recipe.ingredients.length} ingrédients
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === recipe.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expandedId === recipe.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Ingrédients (pour 2 pers.)</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {recipe.ingredients.map((ri, idx) => (
                        <li key={idx}>• {ri.quantity} {ri.unit} {getIngredientName(ri.ingredientId)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Instructions</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{recipe.instructions}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(recipe); }}
                      className="text-sm text-primary hover:text-primary-dark font-medium cursor-pointer"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); setExpandedId(null); }}
                      className="text-sm text-danger hover:text-red-700 font-medium cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
