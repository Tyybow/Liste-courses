import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { Ingredient, Unit, IngredientCategory } from '../../types';
import { INGREDIENT_CATEGORIES, UNITS } from '../../types';

export default function IngredientList() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, recipes } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [form, setForm] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    category: 'Autre',
    defaultUnit: 'g',
  });

  const filtered = ingredients
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => !filterCategory || i.category === filterCategory)
    .sort((a, b) => a.name.localeCompare(b.name));

  const grouped = filtered.reduce<Record<string, Ingredient[]>>((acc, ing) => {
    (acc[ing.category] ??= []).push(ing);
    return acc;
  }, {});

  const isUsedInRecipe = (id: string) =>
    recipes.some((r) => r.ingredients.some((ri) => ri.ingredientId === id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      updateIngredient(editingId, form);
      setEditingId(null);
    } else {
      addIngredient(form);
    }
    setForm({ name: '', category: 'Autre', defaultUnit: 'g' });
    setShowForm(false);
  };

  const startEdit = (ing: Ingredient) => {
    setForm({ name: ing.name, category: ing.category, defaultUnit: ing.defaultUnit });
    setEditingId(ing.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', category: 'Autre', defaultUnit: 'g' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Catalogue d'ingrédients ({ingredients.length})</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', category: 'Autre', defaultUnit: 'g' }); }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          + Ajouter un ingrédient
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher..."
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
          {INGREDIENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-700">{editingId ? 'Modifier' : 'Nouvel'} ingrédient</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nom de l'ingrédient"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
              autoFocus
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as IngredientCategory })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {INGREDIENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={form.defaultUnit}
              onChange={(e) => setForm({ ...form, defaultUnit: e.target.value as Unit })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer">
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste groupée par catégorie */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Aucun ingrédient trouvé.</p>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              {items.map((ing) => (
                <div key={ing.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-800">{ing.name}</span>
                    <span className="ml-2 text-xs text-gray-400">({ing.defaultUnit})</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(ing)}
                      className="text-xs text-primary hover:text-primary-dark cursor-pointer"
                    >
                      Modifier
                    </button>
                    {!isUsedInRecipe(ing.id) && (
                      <button
                        onClick={() => deleteIngredient(ing.id)}
                        className="text-xs text-danger hover:text-red-700 cursor-pointer"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
