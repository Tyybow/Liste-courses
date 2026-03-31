import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Ingredient, Recipe, PlannedMeal, ShoppingItem, ManualShoppingItem, NonFoodItem, ShoppingNonFoodItem } from '../types';
import { initialIngredients, initialRecipes } from './initialData';
import { initialNonFoodItems } from './initialNonFood';
import { calculateShoppingList } from '../utils/shoppingCalculator';
import { getRoomCode, saveToCloud } from '../utils/sync';
import type { SyncData } from '../utils/sync';

interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  meals: PlannedMeal[];
  shoppingList: ShoppingItem[];
  manualShoppingItems: ManualShoppingItem[];
  nonFoodItems: NonFoodItem[];
  shoppingNonFood: ShoppingNonFoodItem[];

  // Sync
  syncStatus: 'idle' | 'saving' | 'loading' | 'error';
  loadFromCloudData: (data: SyncData) => void;

  // Ingredients
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => string;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  // Recipes
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  // Meals
  addMeal: (meal: Omit<PlannedMeal, 'id'>) => void;
  updateMeal: (id: string, meal: Partial<PlannedMeal>) => void;
  deleteMeal: (id: string) => void;
  clearPlanning: () => void;

  // Shopping
  addManualFoodToShopping: (ingredientId: string, quantity: number, unit: string) => void;
  removeManualFoodFromShopping: (ingredientId: string, unit: string) => void;
  recalculateShoppingList: () => void;
  toggleInStock: (ingredientId: string, unit: string) => void;
  togglePurchased: (ingredientId: string, unit: string) => void;
  resetShoppingList: () => void;

  // Non-food items
  addNonFoodItem: (item: Omit<NonFoodItem, 'id'>) => string;
  updateNonFoodItem: (id: string, data: Partial<NonFoodItem>) => void;
  addNonFoodToShopping: (nonFoodItemId: string) => void;
  removeNonFoodFromShopping: (nonFoodItemId: string) => void;
  toggleNonFoodInStock: (nonFoodItemId: string) => void;
  toggleNonFoodPurchased: (nonFoodItemId: string) => void;
  resetNonFoodShopping: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ingredients: initialIngredients,
      recipes: initialRecipes,
      meals: [],
      shoppingList: [],
      manualShoppingItems: [],
      nonFoodItems: initialNonFoodItems,
      shoppingNonFood: [],
      syncStatus: 'idle' as const,

      loadFromCloudData: (data: SyncData) =>
        set({
          ingredients: data.ingredients as Ingredient[],
          recipes: data.recipes as Recipe[],
          meals: data.meals as PlannedMeal[],
          shoppingList: data.shoppingList as ShoppingItem[],
          manualShoppingItems: data.manualShoppingItems as ManualShoppingItem[],
          nonFoodItems: data.nonFoodItems as NonFoodItem[],
          shoppingNonFood: data.shoppingNonFood as ShoppingNonFoodItem[],
          syncStatus: 'idle' as const,
        }),

      // --- Ingredients ---
      addIngredient: (ingredient) => {
        const id = uuid();
        set((state) => ({
          ingredients: [...state.ingredients, { ...ingredient, id }],
        }));
        return id;
      },

      updateIngredient: (id, data) =>
        set((state) => ({
          ingredients: state.ingredients.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
        })),

      deleteIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((i) => i.id !== id),
        })),

      // --- Recipes ---
      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [...state.recipes, { ...recipe, id: uuid() }],
        })),

      updateRecipe: (id, data) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
          meals: state.meals.filter((m) => m.recipeId !== id),
        })),

      // --- Meals ---
      addMeal: (meal) =>
        set((state) => {
          const newMeals = [...state.meals, { ...meal, id: uuid() }];
          return {
            meals: newMeals,
            shoppingList: calculateShoppingList(newMeals, state.recipes, state.ingredients, state.shoppingList),
          };
        }),

      updateMeal: (id, data) =>
        set((state) => {
          const newMeals = state.meals.map((m) =>
            m.id === id ? { ...m, ...data } : m
          );
          return {
            meals: newMeals,
            shoppingList: calculateShoppingList(newMeals, state.recipes, state.ingredients, state.shoppingList),
          };
        }),

      deleteMeal: (id) =>
        set((state) => {
          const newMeals = state.meals.filter((m) => m.id !== id);
          return {
            meals: newMeals,
            shoppingList: calculateShoppingList(newMeals, state.recipes, state.ingredients, state.shoppingList),
          };
        }),

      clearPlanning: () =>
        set({ meals: [], shoppingList: [] }),

      // --- Shopping ---
      addManualFoodToShopping: (ingredientId, quantity, unit) =>
        set((state) => {
          const existing = state.manualShoppingItems.find(
            (i) => i.ingredientId === ingredientId && i.unit === unit
          );
          if (existing) {
            return {
              manualShoppingItems: state.manualShoppingItems.map((i) =>
                i.ingredientId === ingredientId && i.unit === unit
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            manualShoppingItems: [
              ...state.manualShoppingItems,
              { ingredientId, quantity, unit: unit as ManualShoppingItem['unit'], inStock: false, purchased: false },
            ],
          };
        }),

      removeManualFoodFromShopping: (ingredientId, unit) =>
        set((state) => ({
          manualShoppingItems: state.manualShoppingItems.filter(
            (i) => !(i.ingredientId === ingredientId && i.unit === unit)
          ),
        })),

      recalculateShoppingList: () =>
        set((state) => ({
          shoppingList: calculateShoppingList(state.meals, state.recipes, state.ingredients, state.shoppingList),
        })),

      toggleInStock: (ingredientId, unit) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.ingredientId === ingredientId && item.unit === unit
              ? { ...item, inStock: !item.inStock }
              : item
          ),
          manualShoppingItems: state.manualShoppingItems.map((item) =>
            item.ingredientId === ingredientId && item.unit === unit
              ? { ...item, inStock: !item.inStock }
              : item
          ),
        })),

      togglePurchased: (ingredientId, unit) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.ingredientId === ingredientId && item.unit === unit
              ? { ...item, purchased: !item.purchased }
              : item
          ),
          manualShoppingItems: state.manualShoppingItems.map((item) =>
            item.ingredientId === ingredientId && item.unit === unit
              ? { ...item, purchased: !item.purchased }
              : item
          ),
        })),

      resetShoppingList: () =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) => ({
            ...item,
            inStock: false,
            purchased: false,
          })),
          manualShoppingItems: [],
          shoppingNonFood: [],
        })),

      // --- Non-food items ---
      addNonFoodItem: (item) => {
        const id = uuid();
        set((state) => ({
          nonFoodItems: [...state.nonFoodItems, { ...item, id }],
        }));
        return id;
      },

      updateNonFoodItem: (id, data) =>
        set((state) => ({
          nonFoodItems: state.nonFoodItems.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
        })),

      addNonFoodToShopping: (nonFoodItemId) =>
        set((state) => {
          if (state.shoppingNonFood.some((s) => s.nonFoodItemId === nonFoodItemId)) return state;
          return {
            shoppingNonFood: [
              ...state.shoppingNonFood,
              { nonFoodItemId, inStock: false, purchased: false },
            ],
          };
        }),

      removeNonFoodFromShopping: (nonFoodItemId) =>
        set((state) => ({
          shoppingNonFood: state.shoppingNonFood.filter((s) => s.nonFoodItemId !== nonFoodItemId),
        })),

      toggleNonFoodInStock: (nonFoodItemId) =>
        set((state) => ({
          shoppingNonFood: state.shoppingNonFood.map((item) =>
            item.nonFoodItemId === nonFoodItemId
              ? { ...item, inStock: !item.inStock }
              : item
          ),
        })),

      toggleNonFoodPurchased: (nonFoodItemId) =>
        set((state) => ({
          shoppingNonFood: state.shoppingNonFood.map((item) =>
            item.nonFoodItemId === nonFoodItemId
              ? { ...item, purchased: !item.purchased }
              : item
          ),
        })),

      resetNonFoodShopping: () =>
        set((state) => ({
          shoppingNonFood: state.shoppingNonFood.map((item) => ({
            ...item,
            inStock: false,
            purchased: false,
          })),
        })),
    }),
    {
      name: 'liste-courses-storage',
      version: 3,
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<AppState>;
        const currentState = current as AppState;

        // Merge ingredients
        const existingIngNames = new Set(
          (persistedState.ingredients ?? []).map((i) => i.name.toLowerCase())
        );
        const newIngredients = currentState.ingredients.filter(
          (i) => !existingIngNames.has(i.name.toLowerCase())
        );

        // Merge non-food items
        const existingNFNames = new Set(
          (persistedState.nonFoodItems ?? []).map((i) => i.name.toLowerCase())
        );
        const newNonFood = currentState.nonFoodItems.filter(
          (i) => !existingNFNames.has(i.name.toLowerCase())
        );

        return {
          ...currentState,
          ...persistedState,
          ingredients: [...(persistedState.ingredients ?? []), ...newIngredients],
          nonFoodItems: [...(persistedState.nonFoodItems ?? []), ...newNonFood],
        };
      },
    }
  )
);

// Auto-sync to cloud on state changes (debounced)
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const DATA_KEYS = ['ingredients', 'recipes', 'meals', 'shoppingList', 'manualShoppingItems', 'nonFoodItems', 'shoppingNonFood'] as const;

useStore.subscribe((state, prevState) => {
  const roomCode = getRoomCode();
  if (!roomCode) return;

  // Only sync if data actually changed (not syncStatus)
  const changed = DATA_KEYS.some((key) => state[key] !== prevState[key]);
  if (!changed) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    const s = useStore.getState();
    const data: SyncData = {
      ingredients: s.ingredients,
      recipes: s.recipes,
      meals: s.meals,
      shoppingList: s.shoppingList,
      manualShoppingItems: s.manualShoppingItems,
      nonFoodItems: s.nonFoodItems,
      shoppingNonFood: s.shoppingNonFood,
      lastModified: Date.now(),
    };
    saveToCloud(roomCode, data);
  }, 1000);
});
