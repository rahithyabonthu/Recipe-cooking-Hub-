import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { resolveAccurateRecipeImage } from './src/utils/recipeImageMatcher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini AI SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Forbidden Beef and Pork keywords
const FORBIDDEN_WORDS = [
  'beef',
  'pork',
  'bacon',
  'ham',
  'lard',
  'prosciutto',
  'pancetta',
  'veal',
  'pepperoni',
  'pork belly',
  'pork chop',
  'pork loin',
  'beef steak',
  'ground beef',
  'minced beef',
  'beef mince',
  'pork mince',
  'ox',
  'oxtail',
  'cow',
  'pig',
  'swine',
  'pork sausage',
  'beef sausage',
  'beef broth',
  'pork broth',
  'beef tallow',
  'corned beef',
];

const FORBIDDEN_MESSAGE =
  'Sorry! Beef and Pork are not supported by RecipeHub. Please enter other ingredients.';

function isForbiddenText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FORBIDDEN_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower) || lower.includes(word);
  });
}

function sanitizeTheMealDbMeal(meal: any): boolean {
  if (!meal) return false;
  if (isForbiddenText(meal.strMeal || '')) return false;
  if (isForbiddenText(meal.strCategory || '')) return false;
  if (isForbiddenText(meal.strInstructions || '')) return false;

  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && isForbiddenText(ing)) return false;
  }
  return true;
}

// Fallback high quality food images
const FALLBACK_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1000&q=80',
];

// --- 1. AI RECIPE GENERATOR ENDPOINT ---
app.post('/api/ai/generate-recipe', async (req: Request, res: Response) => {
  try {
    const {
      ingredients = [],
      cuisine = 'Indian',
      mealType = 'Any',
      dietary = [],
      servings = 4,
      maxTime = 'Any',
    } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one ingredient.' });
    }

    // STRICT BEEF & PORK CHECK
    for (const ing of ingredients) {
      if (typeof ing === 'string' && isForbiddenText(ing)) {
        return res.status(400).json({ error: FORBIDDEN_MESSAGE });
      }
    }

    if (isForbiddenText(cuisine) || isForbiddenText(mealType)) {
      return res.status(400).json({ error: FORBIDDEN_MESSAGE });
    }

    const ingredientsList = ingredients.join(', ');
    const dietaryRestrictions = dietary.length > 0 ? dietary.join(', ') : 'None';

    const prompt = `You are a world-class master chef specializing in authentic Indian and global cuisine.
CRITICAL MANDATORY RESTRICTION:
NEVER USE, SUGGEST, OR INCLUDE BEEF OR PORK OR ANY DERIVATIVE (NO bacon, ham, lard, veal, prosciutto, pancetta, beef/pork gelatin or stock). These ingredients are strictly prohibited on RecipeHub.
Chicken, mutton/goat, fish, seafood, eggs, paneer, lentils/dal, and all vegetarian ingredients are warmly welcomed.

The user wants an authentic, delicious, reliable recipe created from the ingredients available in their kitchen:
Available Ingredients: ${ingredientsList}

Preferences:
- Cuisine Style: ${cuisine}
- Meal Type: ${mealType}
- Dietary Preferences: ${dietaryRestrictions}
- Target Servings: ${servings}
- Time Constraints: ${maxTime}

Culinary Guidelines:
1. If Indian ingredients or cuisine are specified, use traditional techniques like tempering (tadka/baghar), sautéing aromatics (onions, ginger-garlic paste, green chillies), and balanced spice blends (turmeric, cumin, coriander, garam masala).
2. Measurements MUST be provided in precise grams (g), cups, tablespoons (tbsp), and teaspoons (tsp).
3. Clearly mark which ingredients are from the user, which are pantry staples, and any optional elevating additions.
4. Provide step-by-step instructions with recommended timer minutes for each step.
5. Strictly adhere to the JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Authentic and appetizing recipe name' },
            description: { type: Type.STRING, description: '2-3 sentence tantalizing description of flavors, textures, and heritage' },
            category: { type: Type.STRING, description: 'Category e.g. South Indian, North Indian, Andhra & Telangana, Street Food, Curry, Rice, Dessert' },
            cuisine: { type: Type.STRING, description: 'Cuisine e.g. Andhra, Tamil Nadu, Punjab, Kerala, Hyderabadi, Indian' },
            difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' },
            prepTimeMinutes: { type: Type.INTEGER, description: 'Prep time in minutes' },
            cookTimeMinutes: { type: Type.INTEGER, description: 'Cook time in minutes' },
            servings: { type: Type.INTEGER, description: 'Number of servings' },
            caloriesPerServing: { type: Type.INTEGER, description: 'Estimated calories per serving' },
            imageUrl: { type: Type.STRING, description: 'Relevant food image URL' },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING, description: 'Quantity in grams, cups, tbsp, or tsp' },
                  unit: { type: Type.STRING },
                  isFromUser: { type: Type.BOOLEAN },
                  isPantryStaple: { type: Type.BOOLEAN },
                },
                required: ['name', 'amount', 'isFromUser'],
              },
            },
            additionalNeeded: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  optional: { type: Type.BOOLEAN },
                },
                required: ['name', 'amount'],
              },
            },
            substitutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  substitute: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ['original', 'substitute', 'note'],
              },
            },
            instructions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  timerRecommended: { type: Type.BOOLEAN },
                  chefTip: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'instruction'],
              },
            },
            chefAdvice: { type: Type.STRING, description: 'Pro Indian culinary tip on tempering, roasting, or texture' },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                proteinGrams: { type: Type.INTEGER },
                carbsGrams: { type: Type.INTEGER },
                fatGrams: { type: Type.INTEGER },
                fiberGrams: { type: Type.INTEGER },
              },
              required: ['proteinGrams', 'carbsGrams', 'fatGrams'],
            },
          },
          required: [
            'title',
            'description',
            'category',
            'cuisine',
            'difficulty',
            'prepTimeMinutes',
            'cookTimeMinutes',
            'servings',
            'ingredients',
            'instructions',
          ],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('No content returned from AI model.');
    }

    const parsedRecipe = JSON.parse(textOutput);

    // Double check AI output for strict compliance
    if (
      isForbiddenText(parsedRecipe.title) ||
      isForbiddenText(parsedRecipe.description) ||
      parsedRecipe.ingredients.some((i: any) => isForbiddenText(i.name))
    ) {
      return res.status(400).json({ error: FORBIDDEN_MESSAGE });
    }

    parsedRecipe.id = 'ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    // Accurately assign a verified image matching the exact recipe title and category (Rule 7)
    parsedRecipe.imageUrl = resolveAccurateRecipeImage(
      parsedRecipe.title,
      parsedRecipe.category,
      parsedRecipe.imageUrl
    );

    return res.json({ success: true, recipe: parsedRecipe });
  } catch (error: any) {
    console.error('Error generating AI recipe:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate recipe with AI. Please check your API key in Settings > Secrets.',
    });
  }
});

// --- 2. ASK AI CHEF / CULINARY ASSISTANT ---
app.post('/api/ai/ask-chef', async (req: Request, res: Response) => {
  try {
    const { question, recipeContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    if (isForbiddenText(question)) {
      return res.json({
        answer: FORBIDDEN_MESSAGE,
      });
    }

    const contextPrompt = recipeContext
      ? `The user is cooking: "${recipeContext.title}" (${recipeContext.cuisine || 'Indian'}, Ingredients: ${
          recipeContext.ingredients?.map((i: any) => typeof i === 'string' ? i : i.name).join(', ')
        }).`
      : 'General cooking question.';

    const prompt = `You are Chef Marco / Chef Raghav, an encouraging master of authentic Indian and world cuisine.
${contextPrompt}

CRITICAL RESTRICTION: Never recommend or mention beef or pork under any circumstances.

User Question: "${question}"

Provide a concise, practical, highly encouraging answer (under 120 words). Include temperature, timing, or sensory checks (e.g. look, smell, sound of tadka) when relevant.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error asking AI chef:', error);
    return res.status(500).json({ error: error.message || 'Chef is currently busy in the kitchen.' });
  }
});

// --- 3. THEMEALDB PROXY & FALLBACK ENDPOINTS ---
const THEMEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Get categories, strictly excluding Beef and Pork
app.get('/api/meals/categories', async (_req: Request, res: Response) => {
  try {
    const fetchRes = await fetch(`${THEMEALDB_BASE}/categories.php`);
    if (!fetchRes.ok) throw new Error('TheMealDB error');
    const data = await fetchRes.json();
    const cleanCategories = (data.categories || []).filter((c: any) => {
      const name = (c.strCategory || '').toLowerCase();
      return name !== 'beef' && name !== 'pork';
    });
    return res.json({ categories: cleanCategories });
  } catch (err: any) {
    console.warn('TheMealDB categories fetch error, returning curated fallback', err.message);
    return res.json({
      categories: [
        { idCategory: '2', strCategory: 'Chicken', strCategoryThumb: 'https://www.themealdb.com/images/category/chicken.png', strCategoryDescription: 'Chicken favorites' },
        { idCategory: '3', strCategory: 'Dessert', strCategoryThumb: 'https://www.themealdb.com/images/category/dessert.png', strCategoryDescription: 'Sweet treats & Mithai' },
        { idCategory: '4', strCategory: 'Pasta', strCategoryThumb: 'https://www.themealdb.com/images/category/pasta.png', strCategoryDescription: 'Pasta specialties' },
        { idCategory: '5', strCategory: 'Seafood', strCategoryThumb: 'https://www.themealdb.com/images/category/seafood.png', strCategoryDescription: 'Fresh ocean catches' },
        { idCategory: '6', strCategory: 'Vegetarian', strCategoryThumb: 'https://www.themealdb.com/images/category/vegetarian.png', strCategoryDescription: 'Healthy plant-based meals' },
        { idCategory: '7', strCategory: 'Breakfast', strCategoryThumb: 'https://www.themealdb.com/images/category/breakfast.png', strCategoryDescription: 'Energizing breakfasts' },
        { idCategory: '8', strCategory: 'Lamb', strCategoryThumb: 'https://www.themealdb.com/images/category/lamb.png', strCategoryDescription: 'Tender lamb & mutton dishes' },
      ],
    });
  }
});

// Search meals, filtering out any beef or pork
app.get('/api/meals/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    if (isForbiddenText(query)) {
      return res.json({
        meals: [],
        message: FORBIDDEN_MESSAGE,
      });
    }

    const fetchRes = await fetch(`${THEMEALDB_BASE}/search.php?s=${encodeURIComponent(query)}`);
    if (!fetchRes.ok) throw new Error('Search failed');
    const data = await fetchRes.json();
    const cleanMeals = (data.meals || []).filter(sanitizeTheMealDbMeal);
    return res.json({ meals: cleanMeals });
  } catch (err: any) {
    console.error('Meal search proxy error:', err);
    return res.status(500).json({ error: err.message, meals: null });
  }
});

// Filter meals, strictly disallowing beef or pork
app.get('/api/meals/filter', async (req: Request, res: Response) => {
  try {
    const category = req.query.c as string;
    const area = req.query.a as string;
    const ingredient = req.query.i as string;

    if (
      (category && isForbiddenText(category)) ||
      (ingredient && isForbiddenText(ingredient))
    ) {
      return res.json({ meals: [] });
    }

    let url = `${THEMEALDB_BASE}/filter.php?`;
    if (category) url += `c=${encodeURIComponent(category)}`;
    else if (area) url += `a=${encodeURIComponent(area)}`;
    else if (ingredient) url += `i=${encodeURIComponent(ingredient)}`;
    else url += 'c=Chicken';

    const fetchRes = await fetch(url);
    if (!fetchRes.ok) throw new Error('Filter failed');
    const data = await fetchRes.json();
    const cleanMeals = (data.meals || []).filter(sanitizeTheMealDbMeal);
    return res.json({ meals: cleanMeals });
  } catch (err: any) {
    console.error('Meal filter proxy error:', err);
    return res.status(500).json({ error: err.message, meals: null });
  }
});

// Random meal: fetch until a strictly compliant (no beef, no pork) meal is found
app.get('/api/meals/random', async (_req: Request, res: Response) => {
  try {
    for (let attempts = 0; attempts < 5; attempts++) {
      const fetchRes = await fetch(`${THEMEALDB_BASE}/random.php`);
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        if (data.meals && data.meals[0] && sanitizeTheMealDbMeal(data.meals[0])) {
          return res.json(data);
        }
      }
    }
    // Fallback if random returned beef/pork multiple times
    const fallbackRes = await fetch(`${THEMEALDB_BASE}/lookup.php?i=52772`); // Chicken Teriyaki
    const data = await fallbackRes.json();
    return res.json(data);
  } catch (err: any) {
    console.error('Meal random proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Meal lookup by ID with sanitization
app.get('/api/meals/lookup/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const fetchRes = await fetch(`${THEMEALDB_BASE}/lookup.php?i=${encodeURIComponent(id)}`);
    if (!fetchRes.ok) throw new Error('Lookup failed');
    const data = await fetchRes.json();
    if (data.meals && data.meals[0] && !sanitizeTheMealDbMeal(data.meals[0])) {
      return res.status(404).json({ error: FORBIDDEN_MESSAGE });
    }
    return res.json(data);
  } catch (err: any) {
    console.error('Meal lookup proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// App Health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'RecipeHub',
    restrictions: 'NO_BEEF_NO_PORK_ENFORCED',
    time: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`RecipeHub server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
