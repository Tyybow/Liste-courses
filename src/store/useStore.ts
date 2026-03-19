import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type { Ingredient, Recipe, PlannedMeal, ShoppingItem } from '../types';
import { initialIngredients, initialRecipes } from './initialData';
import { calculateShoppingList } from '../utils/shoppingCalculator';

interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  meals: PlannedMeal[];
  shoppingList: ShoppingItem[];

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
  recalculateShoppingList: () => void;
  toggleInStock: (ingredientId: string, unit: string) => void;
  togglePurchased: (ingredientId: string, unit: string) => void;
  resetShoppingList: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ingredients: initialIngredients,
      recipes: initialRecipes,
      meals: [],
      shoppingList: [],

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
        })),

      togglePurchased: (ingredientId, unit) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
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
        })),
    }),
    {
      name: 'liste-courses-storage',
      version: 2,
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<AppState>;
        const currentState = current as AppState;

        // Merge ingredients: keep user's existing ones + add any new defaults
        const existingNames = new Set(
          (persistedState.ingredients ?? []).map((i) => i.name.toLowerCase())
        );
        const newDefaults = currentState.ingredients.filter(
          (i) => !existingNames.has(i.name.toLowerCase())
        );

        return {
          ...currentState,
          ...persistedState,
          ingredients: [...(persistedState.ingredients ?? []), ...newDefaults],
        };
      },
    }
  )
);
