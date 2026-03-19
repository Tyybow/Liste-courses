import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Recipe, Difficulty } from '../../types';
import { RECIPE_CATEGORIES } from '../../types';
import RecipeForm from './RecipeForm';
import RecipeImport from './RecipeImport';

export default function RecipeList() {
  const { recipes, ingredients, deleteRecipe } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState(false);

  const filtered = recipes
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => !filterCategory || r.category === filterCategory)
    .sort((a, b) => a.name.localeCompare(b.name));

  const getIngredientName = (id: string) =>
    ingredients.find((i) => i.id === id)?.name ?? 'Inconnu';

  const difficultyColor = (d: Difficulty) => {
    if (d === 'Facile') return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    if (d === 'Moyen') return 'bg-amber-50 text-amber-600 border border-amber-200';
    return 'bg-rose-50 text-rose-600 border border-rose-200';
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Recettes</h2>
          <p className="text-sm text-gray-400 mt-0.5">{recipes.length} recette{recipes.length > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setShowImport(true); setShowForm(false); }}
            className="btn-gradient-accent text-white px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Importer
          </button>
          <button
            onClick={() => { setShowForm(true); setShowImport(false); setEditingRecipe(null); }}
            className="btn-gradient text-white px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer shadow-sm"
          >
            + Nouvelle recette
          </button>
        </div>
      </div>

      {/* Success message */}
      {importSuccess && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between border border-emerald-200 animate-fade-in">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recette importée avec succès !
          </span>
          <button onClick={() => setImportSuccess(false)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une recette..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        >
          <option value="">Toutes catégories</option>
          {RECIPE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Import */}
      {showImport && (
        <RecipeImport
          onClose={() => setShowImport(false)}
          onImported={() => { setImportSuccess(true); setTimeout(() => setImportSuccess(false), 5000); }}
        />
      )}

      {/* Formulaire */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onClose={closeForm}
        />
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="card-glass rounded-2xl border border-gray-200/60 px-6 py-16 text-center">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-gray-400 font-medium">Aucune recette trouvée.</p>
          <p className="text-gray-300 text-sm mt-1">Ajoutez votre première recette pour commencer !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="card-glass rounded-2xl border border-gray-200/60 overflow-hidden hover-lift">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/60 transition-all"
                onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{recipe.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/8 text-primary font-medium border border-primary/15">
                      {recipe.category}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${difficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {recipe.prepTime + recipe.cookTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {recipe.ingredients.length} ingr.
                    </span>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${expandedId === recipe.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expandedId === recipe.id && (
                <div className="px-5 pb-5 border-t border-gray-100/60 pt-4 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingrédients (2 pers.)</h4>
                      <ul className="text-sm text-gray-600 space-y-1.5">
                        {recipe.ingredients.map((ri, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                            <span>{ri.quantity} {ri.unit} {getIngredientName(ri.ingredientId)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {recipe.instructions && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Instructions</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{recipe.instructions}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-gray-100/60">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(recipe); }}
                      className="text-sm text-primary hover:text-primary-dark font-medium cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); setExpandedId(null); }}
                      className="text-sm text-gray-400 hover:text-danger font-medium cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
