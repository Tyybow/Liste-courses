import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Unit } from '../../types';
import { INGREDIENT_CATEGORIES, NON_FOOD_CATEGORIES, UNITS } from '../../types';

type FilterMode = 'active' | 'all' | 'purchased';
type AddMode = null | 'food' | 'nonfood';

export default function ShoppingList() {
  const {
    shoppingList, ingredients, manualShoppingItems,
    toggleInStock, togglePurchased, resetShoppingList,
    addIngredient, addManualFoodToShopping, removeManualFoodFromShopping,
    nonFoodItems, shoppingNonFood,
    addNonFoodItem, addNonFoodToShopping, removeNonFoodFromShopping,
    toggleNonFoodInStock, toggleNonFoodPurchased,
  } = useStore();

  const [filterMode, setFilterMode] = useState<FilterMode>('active');
  const [addMode, setAddMode] = useState<AddMode>(null);

  // Non-food add state
  const [nfSearch, setNfSearch] = useState('');
  const [showNfSuggestions, setShowNfSuggestions] = useState(false);
  const nfInputRef = useRef<HTMLInputElement>(null);
  const nfSugRef = useRef<HTMLDivElement>(null);

  // Food add state
  const [foodSearch, setFoodSearch] = useState('');
  const [foodQty, setFoodQty] = useState<number>(1);
  const [foodUnit, setFoodUnit] = useState<Unit>('pièce(s)');
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const foodSugRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const getIngredientName = (id: string) =>
    ingredients.find((i) => i.id === id)?.name ?? 'Inconnu';

  const getIngredientCategory = (id: string) =>
    ingredients.find((i) => i.id === id)?.category ?? 'Autre';

  const getNonFoodName = (id: string) =>
    nonFoodItems.find((i) => i.id === id)?.name ?? 'Inconnu';

  const getNonFoodCategory = (id: string) =>
    nonFoodItems.find((i) => i.id === id)?.category ?? 'Autre';

  // --- Merge recipe shopping + manual items ---
  type MergedFoodItem = {
    ingredientId: string;
    totalQuantity: number;
    unit: string;
    category: string;
    inStock: boolean;
    purchased: boolean;
    isManual: boolean;
  };

  const mergedFoodItems: MergedFoodItem[] = [];

  // Add recipe-generated items
  for (const item of shoppingList) {
    mergedFoodItems.push({ ...item, isManual: false });
  }

  // Add manual items (merge if same ingredientId+unit exists from recipes)
  for (const manual of manualShoppingItems) {
    const existing = mergedFoodItems.find(
      (m) => m.ingredientId === manual.ingredientId && m.unit === manual.unit
    );
    if (existing) {
      existing.totalQuantity += manual.quantity;
    } else {
      mergedFoodItems.push({
        ingredientId: manual.ingredientId,
        totalQuantity: manual.quantity,
        unit: manual.unit,
        category: getIngredientCategory(manual.ingredientId),
        inStock: manual.inStock,
        purchased: manual.purchased,
        isManual: true,
      });
    }
  }

  // Track which manual items are standalone (not merged with recipe items)
  const standaloneManualKeys = new Set(
    manualShoppingItems
      .filter((m) => !shoppingList.some((s) => s.ingredientId === m.ingredientId && s.unit === m.unit))
      .map((m) => `${m.ingredientId}_${m.unit}`)
  );

  // --- Filtering ---
  const filteredFood = mergedFoodItems.filter((item) => {
    if (filterMode === 'active') return !item.inStock && !item.purchased;
    if (filterMode === 'purchased') return item.purchased;
    return true;
  });

  const groupedFood = filteredFood.reduce<Record<string, typeof filteredFood>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const filteredNonFood = shoppingNonFood.filter((item) => {
    if (filterMode === 'active') return !item.inStock && !item.purchased;
    if (filterMode === 'purchased') return item.purchased;
    return true;
  });

  const groupedNonFood = filteredNonFood.reduce<Record<string, typeof filteredNonFood>>((acc, item) => {
    const cat = getNonFoodCategory(item.nonFoodItemId);
    (acc[cat] ??= []).push(item);
    return acc;
  }, {});

  // --- Stats ---
  const totalItems = mergedFoodItems.length + shoppingNonFood.length;
  const purchasedCount =
    mergedFoodItems.filter((i) => i.purchased).length +
    shoppingNonFood.filter((i) => i.purchased).length;
  const inStockCount =
    mergedFoodItems.filter((i) => i.inStock).length +
    shoppingNonFood.filter((i) => i.inStock).length;
  const activeCount = totalItems - purchasedCount - inStockCount;

  // --- Food autocomplete ---
  const foodSuggestions = foodSearch.trim()
    ? ingredients
        .filter((i) => i.name.toLowerCase().includes(foodSearch.toLowerCase()))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(foodSearch.toLowerCase());
          const bStarts = b.name.toLowerCase().startsWith(foodSearch.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 8)
    : [];

  const exactFoodMatch = ingredients.find(
    (i) => i.name.toLowerCase() === foodSearch.trim().toLowerCase()
  );

  const selectFoodIngredient = (id: string) => {
    const ing = ingredients.find((i) => i.id === id);
    if (ing) {
      setFoodSearch(ing.name);
      setFoodUnit(ing.defaultUnit);
    }
    setShowFoodSuggestions(false);
  };

  const addFoodToList = () => {
    if (!foodSearch.trim() || foodQty <= 0) return;
    let ingredientId: string;
    if (exactFoodMatch) {
      ingredientId = exactFoodMatch.id;
    } else {
      ingredientId = addIngredient({ name: foodSearch.trim(), category: 'Autre', defaultUnit: foodUnit });
    }
    addManualFoodToShopping(ingredientId, foodQty, foodUnit);
    setFoodSearch('');
    setFoodQty(1);
    setFoodUnit('pièce(s)');
    setShowFoodSuggestions(false);
    foodInputRef.current?.focus();
  };

  // --- Non-food autocomplete ---
  const nfSuggestions = nfSearch.trim()
    ? nonFoodItems
        .filter((i) =>
          i.name.toLowerCase().includes(nfSearch.toLowerCase()) &&
          !shoppingNonFood.some((s) => s.nonFoodItemId === i.id)
        )
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(nfSearch.toLowerCase());
          const bStarts = b.name.toLowerCase().startsWith(nfSearch.toLowerCase());
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 8)
    : [];

  const exactNfMatch = nonFoodItems.find(
    (i) => i.name.toLowerCase() === nfSearch.trim().toLowerCase()
  );

  const addNonFoodItemToList = (id?: string) => {
    let itemId = id;
    if (!itemId) {
      if (exactNfMatch) {
        itemId = exactNfMatch.id;
      } else if (nfSearch.trim()) {
        itemId = addNonFoodItem({ name: nfSearch.trim(), category: 'Autre' });
      } else {
        return;
      }
    }
    addNonFoodToShopping(itemId);
    setNfSearch('');
    setShowNfSuggestions(false);
  };

  // --- Click outside ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (nfSugRef.current && !nfSugRef.current.contains(target) && nfInputRef.current && !nfInputRef.current.contains(target)) {
        setShowNfSuggestions(false);
      }
      if (foodSugRef.current && !foodSugRef.current.contains(target) && foodInputRef.current && !foodInputRef.current.contains(target)) {
        setShowFoodSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasFood = Object.keys(groupedFood).length > 0;
  const hasNonFood = Object.keys(groupedNonFood).length > 0;
  const hasAnything = mergedFoodItems.length > 0 || shoppingNonFood.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Liste de courses</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setAddMode(addMode === 'food' ? null : 'food')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              addMode === 'food' ? 'bg-primary-dark text-white' : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            + Comestible
          </button>
          <button
            onClick={() => setAddMode(addMode === 'nonfood' ? null : 'nonfood')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              addMode === 'nonfood' ? 'bg-primary-dark text-white' : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            + Non-comestible
          </button>
          {totalItems > 0 && (
            <button
              onClick={resetShoppingList}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer px-3 py-2"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Ajout comestible */}
      {addMode === 'food' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm">Ajouter un article comestible</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                ref={foodInputRef}
                type="text"
                placeholder="Tapez un aliment (ex: Chips, Eau, Cumin...)"
                value={foodSearch}
                onChange={(e) => { setFoodSearch(e.target.value); setShowFoodSuggestions(true); }}
                onFocus={() => foodSearch.trim() && setShowFoodSuggestions(true)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFoodToList(); } }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              {showFoodSuggestions && foodSearch.trim() && foodSuggestions.length > 0 && (
                <div ref={foodSugRef} className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {foodSuggestions.map((ing) => (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => selectFoodIngredient(ing.id)}
                      className="w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 text-gray-700"
                    >
                      {ing.name}
                      <span className="text-xs text-gray-400 ml-2">({ing.category})</span>
                    </button>
                  ))}
                  {!exactFoodMatch && (
                    <button
                      type="button"
                      onClick={() => setShowFoodSuggestions(false)}
                      className="w-full text-left px-3 py-2 text-sm text-primary font-medium hover:bg-primary/5 cursor-pointer border-t border-gray-100"
                    >
                      + Créer « {foodSearch.trim()} »
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
              value={foodQty || ''}
              onChange={(e) => setFoodQty(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <select
              value={foodUnit}
              onChange={(e) => setFoodUnit(e.target.value as Unit)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <button
              onClick={addFoodToList}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors cursor-pointer font-medium"
            >
              Ajouter
            </button>
          </div>
          {foodSearch.trim() && !exactFoodMatch && (
            <p className="text-xs text-gray-400">
              « {foodSearch.trim()} » sera ajouté automatiquement au catalogue
            </p>
          )}
        </div>
      )}

      {/* Ajout non-comestible */}
      {addMode === 'nonfood' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm">Ajouter un article non-comestible</h3>
          <div className="relative">
            <input
              ref={nfInputRef}
              type="text"
              placeholder="Tapez un article (ex: Papier toilette, Lessive...)"
              value={nfSearch}
              onChange={(e) => { setNfSearch(e.target.value); setShowNfSuggestions(true); }}
              onFocus={() => nfSearch.trim() && setShowNfSuggestions(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNonFoodItemToList(); } }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            {showNfSuggestions && nfSearch.trim() && (nfSuggestions.length > 0 || (!exactNfMatch && nfSearch.trim())) && (
              <div ref={nfSugRef} className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {nfSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addNonFoodItemToList(item.id)}
                    className="w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 text-gray-700"
                  >
                    {item.name}
                    <span className="text-xs text-gray-400 ml-2">({item.category})</span>
                  </button>
                ))}
                {!exactNfMatch && (
                  <button
                    type="button"
                    onClick={() => addNonFoodItemToList()}
                    className="w-full text-left px-3 py-2 text-sm text-primary font-medium hover:bg-primary/5 cursor-pointer border-t border-gray-100"
                  >
                    + Créer « {nfSearch.trim()} »
                  </button>
                )}
              </div>
            )}
          </div>
          {nfSearch.trim() && !exactNfMatch && (
            <p className="text-xs text-gray-400">
              « {nfSearch.trim()} » sera ajouté automatiquement au catalogue
            </p>
          )}
        </div>
      )}

      {!hasAnything && addMode === null && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-12 text-center">
          <p className="text-gray-400 text-lg mb-2">🛒</p>
          <p className="text-gray-500">Ajoutez des repas dans le planning ou des articles manuellement.</p>
        </div>
      )}

      {hasAnything && (
        <>
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

          {!hasFood && !hasNonFood && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-8 text-center">
              <p className="text-gray-400">
                {filterMode === 'active' ? 'Tout est en stock ou acheté !' : 'Aucun article.'}
              </p>
            </div>
          )}

          {/* Alimentation (recipe + manual) */}
          {hasFood && (
            INGREDIENT_CATEGORIES
              .filter((cat) => groupedFood[cat])
              .map((category) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {getFoodCategoryIcon(category)} {category}
                  </h3>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {groupedFood[category].map((item) => {
                      const key = `${item.ingredientId}_${item.unit}`;
                      const isStandalone = standaloneManualKeys.has(key);
                      return (
                        <div
                          key={key}
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
                            {isStandalone && (
                              <button
                                onClick={() => removeManualFoodFromShopping(item.ingredientId, item.unit)}
                                className="text-gray-300 hover:text-danger cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )}

          {/* Non-comestibles */}
          {hasNonFood && (
            NON_FOOD_CATEGORIES
              .filter((cat) => groupedNonFood[cat])
              .map((category) => (
                <div key={`nf-${category}`}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {getNonFoodCategoryIcon(category)} {category}
                  </h3>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                    {groupedNonFood[category].map((item) => (
                      <div
                        key={item.nonFoodItemId}
                        className={`flex items-center justify-between px-4 py-3 ${
                          item.purchased ? 'opacity-50' : item.inStock ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <span className={`font-medium text-gray-800 ${item.purchased ? 'line-through' : ''}`}>
                            {getNonFoodName(item.nonFoodItemId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.inStock}
                              onChange={() => toggleNonFoodInStock(item.nonFoodItemId)}
                              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent/30 cursor-pointer"
                            />
                            <span className="text-xs text-gray-400">Stock</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.purchased}
                              onChange={() => toggleNonFoodPurchased(item.nonFoodItemId)}
                              className="w-4 h-4 rounded border-gray-300 text-success focus:ring-success/30 cursor-pointer"
                            />
                            <span className="text-xs text-gray-400">Acheté</span>
                          </label>
                          <button
                            onClick={() => removeNonFoodFromShopping(item.nonFoodItemId)}
                            className="text-gray-300 hover:text-danger cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </>
      )}
    </div>
  );
}

function getFoodCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Viande & Poisson': '🥩', 'Légumes': '🥬', 'Fruits': '🍎',
    'Produits laitiers': '🧀', 'Oeufs': '🥚', 'Pain & Féculents': '🍞',
    'Épicerie sèche': '🍝', 'Condiments & Épices': '🧂', 'Surgelés': '🧊', 'Autre': '📦',
  };
  return icons[category] ?? '📦';
}

function getNonFoodCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Hygiène & Beauté': '🧴', 'Ménage & Entretien': '🧹', 'Papeterie': '📎',
    'Bébé': '👶', 'Animaux': '🐾', 'Autre': '📦',
  };
  return icons[category] ?? '📦';
}
