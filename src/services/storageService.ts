import { Recipe } from '../types/recipe';
import { sanitizeRecipeList, containsForbiddenMeat, FORBIDDEN_MESSAGE } from '../utils/restrictions';
import { AUTHENTIC_INDIAN_RECIPES } from '../data/indianRecipes';

const FAVOURITES_KEY = 'recipehub_favourites_v1';
const PERSONAL_RECIPES_KEY = 'recipehub_personal_recipes_v1';
const RECENTLY_VIEWED_KEY = 'recipehub_recently_viewed_v1';

// Seed sample personal recipes with authentic Indian dishes
const INITIAL_PERSONAL_RECIPES: Recipe[] = [
  AUTHENTIC_INDIAN_RECIPES[0], // Idli Sambar
  AUTHENTIC_INDIAN_RECIPES[1], // Masala Dosa
  AUTHENTIC_INDIAN_RECIPES[13], // Andhra Chicken Curry (Kodi Kura)
  AUTHENTIC_INDIAN_RECIPES[14], // Gongura Pachadi
];

export const storageService = {
  // --- FAVOURITES ---
  getFavourites(): Recipe[] {
    try {
      const data = localStorage.getItem(FAVOURITES_KEY);
      const list: Recipe[] = data ? JSON.parse(data) : [];
      return sanitizeRecipeList(list);
    } catch {
      return [];
    }
  },

  isFavourite(recipeId: string): boolean {
    const list = this.getFavourites();
    return list.some((r) => r.id === recipeId);
  },

  toggleFavourite(recipe: Recipe): boolean {
    if (containsForbiddenMeat(recipe.title) || containsForbiddenMeat(recipe.category)) {
      return false;
    }

    const list = this.getFavourites();
    const exists = list.some((r) => r.id === recipe.id);
    let updated: Recipe[];

    if (exists) {
      updated = list.filter((r) => r.id !== recipe.id);
    } else {
      updated = [recipe, ...list];
    }

    try {
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(sanitizeRecipeList(updated)));
    } catch (e) {
      console.error('Storage write error', e);
    }

    return !exists;
  },

  // --- PERSONAL RECIPES ---
  getMyRecipes(): Recipe[] {
    try {
      const data = localStorage.getItem(PERSONAL_RECIPES_KEY);
      if (!data) {
        localStorage.setItem(PERSONAL_RECIPES_KEY, JSON.stringify(INITIAL_PERSONAL_RECIPES));
        return INITIAL_PERSONAL_RECIPES;
      }
      const list: Recipe[] = JSON.parse(data);
      return sanitizeRecipeList(list);
    } catch {
      return INITIAL_PERSONAL_RECIPES;
    }
  },

  savePersonalRecipe(recipe: Recipe): void {
    if (containsForbiddenMeat(recipe.title) || containsForbiddenMeat(recipe.description)) {
      throw new Error(FORBIDDEN_MESSAGE);
    }
    for (const ing of recipe.ingredients) {
      if (containsForbiddenMeat(ing.name)) {
        throw new Error(FORBIDDEN_MESSAGE);
      }
    }

    const list = this.getMyRecipes();
    const existingIndex = list.findIndex((r) => r.id === recipe.id);
    let updated: Recipe[];

    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = recipe;
    } else {
      updated = [recipe, ...list];
    }

    try {
      localStorage.setItem(PERSONAL_RECIPES_KEY, JSON.stringify(sanitizeRecipeList(updated)));
    } catch (e) {
      console.error('Storage write error', e);
    }
  },

  deletePersonalRecipe(id: string): void {
    const list = this.getMyRecipes();
    const updated = list.filter((r) => r.id !== id);
    try {
      localStorage.setItem(PERSONAL_RECIPES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage write error', e);
    }
  },

  // --- RECENTLY VIEWED ---
  getRecentlyViewed(): Recipe[] {
    try {
      const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const list: Recipe[] = data ? JSON.parse(data) : [];
      return sanitizeRecipeList(list);
    } catch {
      return [];
    }
  },

  addRecentlyViewed(recipe: Recipe): void {
    if (containsForbiddenMeat(recipe.title) || containsForbiddenMeat(recipe.category)) {
      return;
    }

    const list = this.getRecentlyViewed();
    const filtered = list.filter((r) => r.id !== recipe.id);
    const updated = [recipe, ...filtered].slice(0, 10);
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(sanitizeRecipeList(updated)));
    } catch (e) {
      console.error('Storage write error', e);
    }
  },
};
