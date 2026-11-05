export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type RecipeSource = 'themealdb' | 'ai' | 'personal';

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit?: string;
  isFromUser?: boolean;
  isPantryStaple?: boolean;
}

export interface RecipeInstruction {
  stepNumber: number;
  title?: string;
  instruction: string;
  durationMinutes?: number;
  timerRecommended?: boolean;
  chefTip?: string;
}

export interface RecipeSubstitution {
  original: string;
  substitute: string;
  note: string;
}

export interface RecipeAdditionalIngredient {
  name: string;
  amount: string;
  optional?: boolean;
}

export interface RecipeNutrition {
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  cuisine: string;
  difficulty: DifficultyLevel;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  caloriesPerServing?: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  source: RecipeSource;
  tags?: string[];
  youtubeUrl?: string;
  sourceUrl?: string;
  createdAt?: string;
  additionalNeeded?: RecipeAdditionalIngredient[];
  substitutions?: RecipeSubstitution[];
  chefAdvice?: string;
  nutrition?: RecipeNutrition;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  cuisine: string;
  maxCookTime: number; // in minutes, 0 means any
  difficulty: string; // 'All' | 'Easy' | 'Medium' | 'Hard'
}

export interface ActiveTimer {
  id: string;
  title: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  recipeId?: string;
  stepNumber?: number;
}
