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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

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
          className="btn-gradient text-white px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer shadow-sm"
        >
          + Ajouter
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
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
          {NON_FOOD_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-glass rounded-2xl border border-gray-200/60 p-5 space-y-3 animate-fade-in">
          <h4 className="font-semibold text-gray-700">{editingId ? 'Modifier' : 'Nouvel'} article</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nom de l'article"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              required
              autoFocus
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as NonFoodCategory })}
              className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            >
              {NON_FOOD_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer">
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={cancelForm} className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100/80 transition-colors cursor-pointer font-medium">
              Annuler
            </button>
          </div>
        </form>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="card-glass rounded-2xl border border-gray-200/60 px-6 py-12 text-center">
          <p className="text-gray-400 font-medium">Aucun article trouvé.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="card-glass rounded-2xl border border-gray-200/60 overflow-hidden hover-lift">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span>{getCategoryIcon(category)}</span>
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{category}</h4>
                <span className="text-xs text-primary bg-primary/8 px-2.5 py-0.5 rounded-full font-medium border border-primary/15">{items.length}</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${expandedCategories.has(category) ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedCategories.has(category) && (
              <div className="divide-y divide-gray-100/60 border-t border-gray-100/60 animate-fade-in">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/40 transition-colors">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <button
                      onClick={() => startEdit(item)}
                      className="text-xs text-primary hover:text-primary-dark cursor-pointer font-medium"
                    >
                      Modifier
                    </button>
                  </div>
                ))}
              </div>
            )}
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
