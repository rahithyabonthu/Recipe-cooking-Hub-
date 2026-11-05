import { Category, Recipe, RecipeIngredient, RecipeInstruction } from '../types/recipe';
import { sanitizeRecipeList, containsForbiddenMeat } from '../utils/restrictions';
import { AUTHENTIC_INDIAN_RECIPES } from '../data/indianRecipes';

const THEMEALDB_DIRECT = 'https://www.themealdb.com/api/json/v1/1';

// Convert a raw TheMealDB meal object to unified Recipe interface
export function parseTheMealDbRecipe(rawMeal: any): Recipe | null {
  if (!rawMeal) return null;

  // Strict check: if meal name or category has beef or pork, reject
  if (containsForbiddenMeat(rawMeal.strMeal || '') || containsForbiddenMeat(rawMeal.strCategory || '')) {
    return null;
  }

  const ingredients: RecipeIngredient[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredientName = rawMeal[`strIngredient${i}`];
    const measure = rawMeal[`strMeasure${i}`];

    if (ingredientName && ingredientName.trim()) {
      if (containsForbiddenMeat(ingredientName)) {
        return null; // Reject entire recipe if it uses beef or pork
      }

      ingredients.push({
        name: ingredientName.trim(),
        amount: measure && measure.trim() ? measure.trim() : 'As needed',
        isFromUser: false,
        isPantryStaple: ['salt', 'pepper', 'olive oil', 'water', 'oil', 'sugar', 'mustard', 'cumin', 'turmeric'].some(s =>
          ingredientName.toLowerCase().includes(s)
        ),
      });
    }
  }

  // Parse raw instructions string into discrete steps
  const rawInstructions: string = rawMeal.strInstructions || '';
  if (containsForbiddenMeat(rawInstructions)) {
    return null;
  }

  const lines = rawInstructions
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.toLowerCase().startsWith('step 0'));

  const instructions: RecipeInstruction[] = [];
  let stepCounter = 1;

  if (lines.length <= 1) {
    const sentences = rawInstructions
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);

    if (sentences.length > 1) {
      sentences.forEach((sentence, idx) => {
        const timeMatch = sentence.match(/(\d+)\s*(?:min|minutes|mins|hour|hours)/i);
        let duration = 0;
        if (timeMatch) {
          const num = parseInt(timeMatch[1], 10);
          duration = sentence.toLowerCase().includes('hour') ? num * 60 : num;
        }

        instructions.push({
          stepNumber: idx + 1,
          title: `Step ${idx + 1}`,
          instruction: sentence,
          durationMinutes: duration > 0 ? duration : undefined,
          timerRecommended: duration > 0,
        });
      });
    } else {
      instructions.push({
        stepNumber: 1,
        title: 'Preparation & Cooking',
        instruction: rawInstructions || 'Follow recipe directions.',
        durationMinutes: 20,
        timerRecommended: true,
      });
    }
  } else {
    lines.forEach((line) => {
      const cleaned = line.replace(/^(step\s*\d+[\s.:-]*)/i, '').trim();
      if (!cleaned) return;

      const timeMatch = cleaned.match(/(\d+)\s*(?:min|minutes|mins|hour|hours)/i);
      let duration = 0;
      if (timeMatch) {
        const num = parseInt(timeMatch[1], 10);
        duration = cleaned.toLowerCase().includes('hour') ? num * 60 : num;
      }

      instructions.push({
        stepNumber: stepCounter++,
        title: `Step ${stepCounter - 1}`,
        instruction: cleaned,
        durationMinutes: duration > 0 ? duration : undefined,
        timerRecommended: duration > 0,
      });
    });
  }

  const totalSteps = instructions.length;
  const ingredientCount = ingredients.length;
  const prepTime = Math.max(10, Math.min(45, ingredientCount * 2));
  const detectedCookTime = instructions.reduce((acc, step) => acc + (step.durationMinutes || 0), 0);
  const cookTime = detectedCookTime > 0 ? detectedCookTime : Math.max(15, Math.min(60, totalSteps * 5));

  const difficulty = totalSteps > 7 || ingredientCount > 10 ? 'Hard' : totalSteps > 4 ? 'Medium' : 'Easy';

  return {
    id: rawMeal.idMeal,
    title: rawMeal.strMeal,
    description: `A classic ${rawMeal.strArea || ''} ${rawMeal.strCategory || 'dish'} featuring ${
      ingredients.slice(0, 3).map(i => i.name).join(', ')
    }.`,
    imageUrl: rawMeal.strMealThumb,
    category: rawMeal.strCategory || 'General',
    cuisine: rawMeal.strArea || 'International',
    difficulty,
    prepTimeMinutes: prepTime,
    cookTimeMinutes: cookTime,
    servings: 4,
    caloriesPerServing: Math.floor(350 + Math.random() * 300),
    ingredients,
    instructions,
    source: 'themealdb',
    tags: rawMeal.strTags ? rawMeal.strTags.split(',').map((t: string) => t.trim()) : [],
    youtubeUrl: rawMeal.strYoutube || undefined,
    sourceUrl: rawMeal.strSource || undefined,
  };
}

// Fetch helper with fallback to direct API if backend proxy is starting up
async function safeFetchJson(proxyUrl: string, directUrl: string): Promise<any> {
  try {
    const res = await fetch(proxyUrl);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Proxy fetch failed for ${proxyUrl}, falling back to direct API`, err);
  }

  const directRes = await fetch(directUrl);
  if (!directRes.ok) {
    throw new Error(`Failed to fetch from ${directUrl}`);
  }
  return await directRes.json();
}

export const mealApi = {
  // Get categories, filtering out Beef and Pork
  async getCategories(): Promise<Category[]> {
    try {
      const data = await safeFetchJson(
        '/api/meals/categories',
        `${THEMEALDB_DIRECT}/categories.php`
      );
      const rawCategories: Category[] = data.categories || [];
      return rawCategories.filter((cat) => !containsForbiddenMeat(cat.strCategory));
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  },

  // Search recipes with authentic Indian priority and zero beef/pork
  async searchMeals(query: string): Promise<Recipe[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    if (containsForbiddenMeat(cleanQuery)) {
      return [];
    }

    // 1. Search authentic Indian recipes database first!
    const matchingIndian = AUTHENTIC_INDIAN_RECIPES.filter((r) => {
      const matchesTitle = r.title.toLowerCase().includes(cleanQuery);
      const matchesCategory = r.category.toLowerCase().includes(cleanQuery);
      const matchesCuisine = r.cuisine.toLowerCase().includes(cleanQuery);
      const matchesIngredients = r.ingredients.some((i) =>
        i.name.toLowerCase().includes(cleanQuery)
      );
      return matchesTitle || matchesCategory || matchesCuisine || matchesIngredients;
    });

    try {
      const data = await safeFetchJson(
        `/api/meals/search?q=${encodeURIComponent(query)}`,
        `${THEMEALDB_DIRECT}/search.php?s=${encodeURIComponent(query)}`
      );

      let theMealDbResults: Recipe[] = [];
      if (data.meals && Array.isArray(data.meals)) {
        theMealDbResults = data.meals
          .map(parseTheMealDbRecipe)
          .filter((r: Recipe | null): r is Recipe => r !== null);
      }

      // Combine with Indian recipes placed first
      const combined = [...matchingIndian, ...theMealDbResults];
      return sanitizeRecipeList(combined);
    } catch (err) {
      console.error('Error searching meals:', err);
      return matchingIndian;
    }
  },

  // Get meals by category
  async getMealsByCategory(category: string): Promise<Recipe[]> {
    if (containsForbiddenMeat(category)) return [];

    // Check Indian database for Indian categories
    const matchingIndian = AUTHENTIC_INDIAN_RECIPES.filter(
      (r) => r.category.toLowerCase() === category.toLowerCase()
    );

    try {
      const filterData = await safeFetchJson(
        `/api/meals/filter?c=${encodeURIComponent(category)}`,
        `${THEMEALDB_DIRECT}/filter.php?c=${encodeURIComponent(category)}`
      );
      if (!filterData.meals || filterData.meals.length === 0) {
        return matchingIndian;
      }

      const sampleMeals = filterData.meals.slice(0, 8);
      const detailedMeals = await Promise.all(
        sampleMeals.map(async (m: any) => {
          try {
            return await this.getMealById(m.idMeal);
          } catch {
            return null;
          }
        })
      );

      const validTheMealDb = detailedMeals.filter((r): r is Recipe => r !== null);
      return sanitizeRecipeList([...matchingIndian, ...validTheMealDb]);
    } catch (err) {
      console.error(`Error fetching meals for category ${category}:`, err);
      return matchingIndian;
    }
  },

  // Get meals by cuisine
  async getMealsByCuisine(cuisine: string): Promise<Recipe[]> {
    if (containsForbiddenMeat(cuisine)) return [];

    if (cuisine.toLowerCase().includes('indian') || cuisine.toLowerCase() === 'all') {
      return AUTHENTIC_INDIAN_RECIPES;
    }

    try {
      const filterData = await safeFetchJson(
        `/api/meals/filter?a=${encodeURIComponent(cuisine)}`,
        `${THEMEALDB_DIRECT}/filter.php?a=${encodeURIComponent(cuisine)}`
      );
      if (!filterData.meals || filterData.meals.length === 0) return [];

      const sampleMeals = filterData.meals.slice(0, 8);
      const detailedMeals = await Promise.all(
        sampleMeals.map(async (m: any) => {
          try {
            return await this.getMealById(m.idMeal);
          } catch {
            return null;
          }
        })
      );

      const validTheMealDb = detailedMeals.filter((r): r is Recipe => r !== null);
      return sanitizeRecipeList(validTheMealDb);
    } catch (err) {
      console.error(`Error fetching meals for cuisine ${cuisine}:`, err);
      return [];
    }
  },

  // Random meal: return authentic Indian or strictly clean international meal
  async getRandomMeal(): Promise<Recipe | null> {
    // 50% of the time, celebrate authentic Indian cuisine on Random!
    if (Math.random() > 0.4) {
      const randomIndex = Math.floor(Math.random() * AUTHENTIC_INDIAN_RECIPES.length);
      return AUTHENTIC_INDIAN_RECIPES[randomIndex];
    }

    try {
      const data = await safeFetchJson(
        '/api/meals/random',
        `${THEMEALDB_DIRECT}/random.php`
      );
      if (data.meals && data.meals[0]) {
        const recipe = parseTheMealDbRecipe(data.meals[0]);
        if (recipe && !containsForbiddenMeat(recipe.title)) {
          return recipe;
        }
      }
      return AUTHENTIC_INDIAN_RECIPES[0];
    } catch (err) {
      console.error('Error fetching random meal:', err);
      return AUTHENTIC_INDIAN_RECIPES[0];
    }
  },

  async getMealById(id: string): Promise<Recipe | null> {
    // Check if it's an authentic Indian recipe
    const indianMeal = AUTHENTIC_INDIAN_RECIPES.find((r) => r.id === id);
    if (indianMeal) return indianMeal;

    try {
      const data = await safeFetchJson(
        `/api/meals/lookup/${id}`,
        `${THEMEALDB_DIRECT}/lookup.php?i=${id}`
      );
      if (data.meals && data.meals[0]) {
        return parseTheMealDbRecipe(data.meals[0]);
      }
      return null;
    } catch (err) {
      console.error(`Error fetching meal by id ${id}:`, err);
      return null;
    }
  },

  // Direct accessor for all authentic Indian recipes
  getAuthenticIndianRecipes(): Recipe[] {
    return AUTHENTIC_INDIAN_RECIPES;
  },
};
