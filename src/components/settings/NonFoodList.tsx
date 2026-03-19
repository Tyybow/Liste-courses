import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { NonFoodItem, NonFoodCategory } from '../../types';
import { NON_FOOD_CATEGORIES } from '../../types';

export default function NonFoodList() {
  const { nonFoodItems, addNonFoodItem, updateNonFoodItem } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [form, setForm] = useState<Omit<NonFoodItem, 'id'>>({
    name: '',
    category: 'Autre',
  });

  const filtered = nonFoodItems
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => !filterCategory || i.category === filterCategory)
    .sort((a, b) => a.name.localeCompare(b.name));

  const grouped = filtered.reduce<Record<string, NonFoodItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      updateNonFoodItem(editingId, form);
      setEditingId(null);
    } else {
      addNonFoodItem(form);
    }
    setForm({ name: '', category: 'Autre' });
    setShowForm(false);
  };

  const startEdit = (item: NonFoodItem) => {
    setForm({ name: item.name, category: item.category });
    setEditingId(item.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', category: 'Autre' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Non-comestibles ({nonFoodItems.length})</h3>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', category: 'Autre' }); }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          + Ajouter
        </button>
      </div>

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
          {NON_FOOD_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h4 className="font-semibold text-gray-700">{editingId ? 'Modifier' : 'Nouvel'} article</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nom de l'article"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
              autoFocus
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as NonFoodCategory })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {NON_FOOD_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
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

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Aucun article trouvé.</p>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {getCategoryIcon(category)} {category}
            </h4>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-primary hover:text-primary-dark cursor-pointer"
                  >
                    Modifier
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Hygiène & Beauté': '🧴',
    'Ménage & Entretien': '🧹',
    'Papeterie': '📎',
    'Bébé': '👶',
    'Animaux': '🐾',
    'Autre': '📦',
  };
  return icons[category] ?? '📦';
}
