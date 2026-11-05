// Strict prohibition rules: NO BEEF, NO PORK in any part of RecipeHub

export const FORBIDDEN_MESSAGE =
  'Sorry! Beef and Pork are not supported by RecipeHub. Please enter other ingredients.';

const FORBIDDEN_TERMS = [
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
  'pork rib',
  'beef rib',
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
  'pastrami',
];

// Returns true if text contains any forbidden beef or pork terms
export function containsForbiddenMeat(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FORBIDDEN_TERMS.some((term) => {
    // Word boundary or substring check
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    return regex.test(lower) || lower.includes(term);
  });
}

// Validates a recipe or list of ingredients. Returns null if valid, or error message if forbidden
export function validateNoBeefOrPork(
  items: Array<string | { name?: string; amount?: string }> | string
): string | null {
  if (typeof items === 'string') {
    if (containsForbiddenMeat(items)) {
      return FORBIDDEN_MESSAGE;
    }
    return null;
  }

  for (const item of items) {
    const textToCheck = typeof item === 'string' ? item : `${item.name || ''} ${item.amount || ''}`;
    if (containsForbiddenMeat(textToCheck)) {
      return FORBIDDEN_MESSAGE;
    }
  }

  return null;
}

// Filters out any recipes containing beef or pork
export function sanitizeRecipeList<T extends { title?: string; category?: string; description?: string; ingredients?: any[] }>(
  recipes: T[]
): T[] {
  return recipes.filter((recipe) => {
    if (recipe.category && containsForbiddenMeat(recipe.category)) return false;
    if (recipe.title && containsForbiddenMeat(recipe.title)) return false;
    if (recipe.description && containsForbiddenMeat(recipe.description)) return false;
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      for (const ing of recipe.ingredients) {
        const ingName = typeof ing === 'string' ? ing : ing.name || '';
        if (containsForbiddenMeat(ingName)) return false;
      }
    }
    return true;
  });
}
