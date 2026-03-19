export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'pièce(s)' | 'c. à soupe' | 'c. à café' | 'sachet(s)' | 'tranche(s)' | 'gousse(s)' | 'branche(s)';

export type IngredientCategory =
  | 'Viande & Poisson'
  | 'Légumes'
  | 'Fruits'
  | 'Produits laitiers'
  | 'Oeufs'
  | 'Pain & Féculents'
  | 'Épicerie sèche'
  | 'Condiments & Épices'
  | 'Surgelés'
  | 'Autre';

export type RecipeCategory =
  | 'Viande'
  | 'Poisson'
  | 'Végétarien'
  | 'Pâtes'
  | 'Salade'
  | 'Soupe'
  | 'Autre';

export type Difficulty = 'Facile' | 'Moyen' | 'Difficile';

export type MealTime = 'midi' | 'soir';

export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  'Viande & Poisson',
  'Légumes',
  'Fruits',
  'Produits laitiers',
  'Oeufs',
  'Pain & Féculents',
  'Épicerie sèche',
  'Condiments & Épices',
  'Surgelés',
  'Autre',
];

export const RECIPE_CATEGORIES: RecipeCategory[] = [
  'Viande', 'Poisson', 'Végétarien', 'Pâtes', 'Salade', 'Soupe', 'Autre',
];

export const UNITS: Unit[] = [
  'g', 'kg', 'ml', 'L', 'pièce(s)', 'c. à soupe', 'c. à café', 'sachet(s)', 'tranche(s)', 'gousse(s)', 'branche(s)',
];

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  defaultUnit: Unit;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  instructions: string;
  ingredients: RecipeIngredient[];
}

export interface PlannedMeal {
  id: string;
  day: DayOfWeek;
  mealTime: MealTime;
  recipeId: string;
  servings: number;
}

export interface ShoppingItem {
  ingredientId: string;
  totalQuantity: number;
  unit: Unit;
  category: IngredientCategory;
  inStock: boolean;
  purchased: boolean;
}

export interface ManualShoppingItem {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  inStock: boolean;
  purchased: boolean;
}

// --- Non-comestibles ---

export type NonFoodCategory =
  | 'Hygiène & Beauté'
  | 'Ménage & Entretien'
  | 'Papeterie'
  | 'Bébé'
  | 'Animaux'
  | 'Autre';

export const NON_FOOD_CATEGORIES: NonFoodCategory[] = [
  'Hygiène & Beauté',
  'Ménage & Entretien',
  'Papeterie',
  'Bébé',
  'Animaux',
  'Autre',
];

export interface NonFoodItem {
  id: string;
  name: string;
  category: NonFoodCategory;
}

export interface ShoppingNonFoodItem {
  nonFoodItemId: string;
  inStock: boolean;
  purchased: boolean;
}
