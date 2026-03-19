import type { PlannedMeal, Recipe, Ingredient, ShoppingItem } from '../types';

/**
 * Calcule la liste de courses à partir du planning de la semaine.
 * - Ajuste les quantités selon le nombre de personnes (base 2)
 * - Cumule les quantités d'un même ingrédient avec la même unité
 */
export function calculateShoppingList(
  meals: PlannedMeal[],
  recipes: Recipe[],
  ingredients: Ingredient[],
  existingItems: ShoppingItem[]
): ShoppingItem[] {
  const accumulator = new Map<string, { totalQuantity: number; unit: string }>();

  for (const meal of meals) {
    const recipe = recipes.find((r) => r.id === meal.recipeId);
    if (!recipe) continue;

    for (const ri of recipe.ingredients) {
      // Quantité proportionnelle : quantité_base_2_pers × nb_personnes / 2
      const adjustedQuantity = ri.quantity * (meal.servings / 2);

      const key = `${ri.ingredientId}_${ri.unit}`;
      const existing = accumulator.get(key);
      if (existing) {
        existing.totalQuantity += adjustedQuantity;
      } else {
        accumulator.set(key, { totalQuantity: adjustedQuantity, unit: ri.unit });
      }
    }
  }

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

  // Préserver l'état "en stock" / "acheté" des items existants
  const existingMap = new Map(existingItems.map((item) => [item.ingredientId + '_' + item.unit, item]));

  const shoppingList: ShoppingItem[] = [];
  for (const [key, value] of accumulator) {
    const ingredientId = key.split('_')[0];
    const ingredient = ingredientMap.get(ingredientId);
    const existingItem = existingMap.get(key);

    shoppingList.push({
      ingredientId,
      totalQuantity: Math.round(value.totalQuantity * 100) / 100,
      unit: value.unit as ShoppingItem['unit'],
      category: ingredient?.category ?? 'Autre',
      inStock: existingItem?.inStock ?? false,
      purchased: existingItem?.purchased ?? false,
    });
  }

  // Trier par catégorie puis par nom d'ingrédient
  shoppingList.sort((a, b) => {
    const catA = a.category;
    const catB = b.category;
    if (catA !== catB) return catA.localeCompare(catB);
    const nameA = ingredientMap.get(a.ingredientId)?.name ?? '';
    const nameB = ingredientMap.get(b.ingredientId)?.name ?? '';
    return nameA.localeCompare(nameB);
  });

  return shoppingList;
}
