import { Recipe } from '../types/recipe';

export interface GenerateRecipeRequest {
  ingredients: string[];
  cuisine?: string;
  mealType?: string;
  dietary?: string[];
  servings?: number;
  maxTime?: string;
}

export const aiService = {
  async generateRecipe(params: GenerateRecipeRequest): Promise<Recipe> {
    const res = await fetch('/api/ai/generate-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate recipe from AI.');
    }

    const recipe: Recipe = {
      ...data.recipe,
      source: 'ai',
      createdAt: new Date().toISOString(),
    };

    return recipe;
  },

  async askChef(question: string, context?: Recipe): Promise<string> {
    const res = await fetch('/api/ai/ask-chef', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, recipeContext: context }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Chef was unable to answer right now.');
    }

    return data.answer || 'Keep heat controlled and taste as you season!';
  },
};
