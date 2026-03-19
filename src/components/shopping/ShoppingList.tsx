import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { INGREDIENT_CATEGORIES } from '../../types';

type FilterMode = 'active' | 'all' | 'purchased';

export default function ShoppingList() {
  const { shoppingList, ingredients, meals, toggleInStock, togglePurchased, resetShoppingList } = useStore();
  const [filterMode, setFilterMode] = useState<FilterMode>('active');

  const getIngredientName = (id: string) =>
    ingredients.find((i) => i.id === id)?.name ?? 'Inconnu';

  // Filtrage selon le mode
  const filteredItems = shoppingList.filter((item) => {
    if (filterMode === 'active') return !item.inStock && !item.purchased;
    if (filterMode === 'purchased') return item.purchased;
    return true;
  });

  // Grouper par catégorie
  const grouped = filteredItems.reduce<Record<string, typeof filteredItems>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const totalItems = shoppingList.length;
  const purchasedCount = shoppingList.filter((i) => i.purchased).length;
  const inStockCount = shoppingList.filter((i) => i.inStock).length;
  const activeCount = totalItems - purchasedCount - inStockCount;

  if (meals.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Liste de courses</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-12 text-center">
          <p className="text-gray-400 text-lg mb-2">🛒</p>
          <p className="text-gray-500">Ajoutez des repas dans le planning pour générer la liste de courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Liste de courses</h2>
        {totalItems > 0 && (
          <button
            onClick={resetShoppingList}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
          >
            Réinitialiser les cases
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-primary">{activeCount}</p>
          <p className="text-xs text-gray-400">À acheter</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-accent">{inStockCount}</p>
          <p className="text-xs text-gray-400">En stock</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-success">{purchasedCount}</p>
          <p className="text-xs text-gray-400">Achetés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {([
          { key: 'active', label: 'À acheter' },
          { key: 'all', label: 'Tout' },
          { key: 'purchased', label: 'Achetés' },
        ] as { key: FilterMode; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterMode(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filterMode === f.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste groupée par catégorie / rayon */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-8 text-center">
          <p className="text-gray-400">
            {filterMode === 'active' ? 'Tout est en stock ou acheté !' : 'Aucun article.'}
          </p>
        </div>
      ) : (
        INGREDIENT_CATEGORIES
          .filter((cat) => grouped[cat])
          .map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {getCategoryIcon(category)} {category}
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                {grouped[category].map((item) => (
                  <div
                    key={item.ingredientId + '_' + item.unit}
                    className={`flex items-center justify-between px-4 py-3 ${
                      item.purchased ? 'opacity-50' : item.inStock ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <span className={`font-medium text-gray-800 ${item.purchased ? 'line-through' : ''}`}>
                        {getIngredientName(item.ingredientId)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {item.totalQuantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.inStock}
                          onChange={() => toggleInStock(item.ingredientId, item.unit)}
                          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent/30 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400">Stock</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.purchased}
                          onChange={() => togglePurchased(item.ingredientId, item.unit)}
                          className="w-4 h-4 rounded border-gray-300 text-success focus:ring-success/30 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400">Acheté</span>
                      </label>
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

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Viande & Poisson': '🥩',
    'Légumes': '🥬',
    'Fruits': '🍎',
    'Produits laitiers': '🧀',
    'Oeufs': '🥚',
    'Pain & Féculents': '🍞',
    'Épicerie sèche': '🍝',
    'Condiments & Épices': '🧂',
    'Surgelés': '🧊',
    'Autre': '📦',
  };
  return icons[category] ?? '📦';
}
