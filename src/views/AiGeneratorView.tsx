import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  X,
  ChefHat,
  Flame,
  Clock,
  Heart,
  Save,
  Check,
  Utensils,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
  AlertCircle,
  Timer,
} from 'lucide-react';
import { Recipe } from '../types/recipe';
import { aiService } from '../services/aiService';
import { containsForbiddenMeat, FORBIDDEN_MESSAGE } from '../utils/restrictions';
import { resolveAccurateRecipeImage, getCategoryFallbackImage } from '../utils/recipeImageMatcher';

interface AiGeneratorViewProps {
  onSaveToMyRecipes: (recipe: Recipe) => void;
  onOpenRecipeDetail: (recipe: Recipe) => void;
  isFav: (id: string) => boolean;
  onToggleFav: (recipe: Recipe) => void;
  onStartTimer: (minutes: number, title: string) => void;
}

// Preset popular Indian and kitchen staple suggestions for quick clicking
const PRESET_INGREDIENTS = [
  'Tomato',
  'Onion',
  'Potato',
  'Rice',
  'Green Chilli',
  'Curry Leaves (Karivepaku)',
  'Mustard Seeds (Rai)',
  'Cumin (Jeera)',
  'Turmeric (Haldi)',
  'Ginger-Garlic Paste',
  'Paneer',
  'Tamarind (Chintapandu)',
  'Toor Dal',
  'Urad Dal',
  'Gongura Leaves',
  'Garam Masala',
  'Pure Desi Ghee',
  'Chicken',
  'Mutton',
  'Fish',
  'Eggs',
  'Fresh Coriander',
];

const CUISINE_OPTIONS = [
  'South Indian',
  'Andhra & Telangana',
  'North Indian',
  'Tamil Nadu',
  'Kerala',
  'Punjab',
  'Maharashtra',
  'Gujarat & Rajasthan',
  'Indian Street Food',
  'Mediterranean',
  'Italian',
  'Asian Fusion',
];

const MEAL_TYPES = ['Any', 'Dinner', 'Lunch', 'Breakfast', 'Quick Snack', 'Dessert'];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low Carb / Keto',
  'High Protein',
];

export const AiGeneratorView: React.FC<AiGeneratorViewProps> = ({
  onSaveToMyRecipes,
  onOpenRecipeDetail,
  isFav,
  onToggleFav,
  onStartTimer,
}) => {
  // User ingredients list - initialized with the exact prompt example!
  const [ingredients, setIngredients] = useState<string[]>([
    'Tomato',
    'Onion',
    'Potato',
    'Rice',
    'Green Chilli',
  ]);
  const [inputVal, setInputVal] = useState<string>('');

  // Preferences
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Any');
  const [selectedMealType, setSelectedMealType] = useState<string>('Dinner');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [servings, setServings] = useState<number>(4);
  const [maxTime, setMaxTime] = useState<string>('30-45 mins');

  // Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSavedPersonal, setHasSavedPersonal] = useState<boolean>(false);

  // Add custom ingredient
  const handleAddIngredient = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // STRICT BEEF & PORK CHECK
    if (containsForbiddenMeat(trimmed)) {
      setErrorMessage(FORBIDDEN_MESSAGE);
      setInputVal('');
      return;
    }

    setErrorMessage(null);
    if (!ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
      setInputVal('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setIngredients(ingredients.filter((i) => i !== ing));
  };

  const handleToggleDietary = (item: string) => {
    if (selectedDietary.includes(item)) {
      setSelectedDietary(selectedDietary.filter((d) => d !== item));
    } else {
      setSelectedDietary([...selectedDietary, item]);
    }
  };

  // Generate recipe with Gemini AI
  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setErrorMessage('Please add at least one ingredient to generate a recipe.');
      return;
    }

    // STRICT CHECK ACROSS ALL INGREDIENTS
    for (const ing of ingredients) {
      if (containsForbiddenMeat(ing)) {
        setErrorMessage(FORBIDDEN_MESSAGE);
        return;
      }
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedRecipe(null);
    setHasSavedPersonal(false);

    try {
      const recipe = await aiService.generateRecipe({
        ingredients,
        cuisine: selectedCuisine,
        mealType: selectedMealType,
        dietary: selectedDietary,
        servings,
        maxTime,
      });

      setGeneratedRecipe(recipe);
    } catch (err: any) {
      console.error('Error generating AI recipe:', err);
      setErrorMessage(
        err.message || 'Unable to generate recipe at this moment. Please check your Gemini API key in Settings > Secrets.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!generatedRecipe) return;
    onSaveToMyRecipes(generatedRecipe);
    setHasSavedPersonal(true);
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini AI Culinary Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-stone-900 tracking-tight">
          AI Recipe Generator
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Tell us what ingredients you have in your fridge or pantry, and Chef Gemini will formulate an original, step-by-step gourmet recipe.
        </p>
      </div>

      {/* Main Ingredient Input Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md space-y-6">
        
        {/* Ingredients input box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
            Available Ingredients in Your Kitchen
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type an ingredient (e.g. Tomato, Rice, Cheese)..."
              className="flex-1 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddIngredient}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Active Ingredient Chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-900 animate-scale-in"
              >
                <span>{ing}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ing)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {ingredients.length === 0 && (
              <span className="text-xs text-stone-400 italic">No ingredients added yet.</span>
            )}
          </div>
        </div>

        {/* Quick Add Suggestions */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Tap to quick-add staples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_INGREDIENTS.map((preset) => {
              const isAdded = ingredients.some((i) => i.toLowerCase() === preset.toLowerCase());
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={isAdded}
                  onClick={() => setIngredients([...ingredients, preset])}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    isAdded
                      ? 'bg-stone-100 text-stone-400 cursor-default'
                      : 'bg-stone-50 border border-stone-200 text-stone-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800'
                  }`}
                >
                  {isAdded ? `✓ ${preset}` : `+ ${preset}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Options & Preferences Grid */}
        <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Cuisine */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Cuisine Style
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Meal Type
            </label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Target Servings */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Servings: {servings}
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setServings(num)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    servings === num
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Time Target */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Cooking Time
            </label>
            <select
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Under 20 mins">Quick (&lt; 20 mins)</option>
              <option value="30-45 mins">Standard (30-45 mins)</option>
              <option value="45+ mins">Slow & Gourmet (45+ mins)</option>
            </select>
          </div>
        </div>

        {/* Dietary Preferences Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            Dietary Preferences (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((item) => {
              const isSelected = selectedDietary.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleToggleDietary(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isSelected ? `✓ ${item}` : item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isGenerating || ingredients.length === 0}
            onClick={handleGenerateRecipe}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Chef Gemini is formulating your recipe...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate Recipe with Gemini AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============ GENERATED RECIPE RESULT CARD ============ */}
      {generatedRecipe && (
        <div className="bg-white rounded-3xl overflow-hidden border border-emerald-300 shadow-xl space-y-6 animate-slide-up">
          
          {/* Header banner */}
          <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-stone-900 overflow-hidden">
            <img
              src={resolveAccurateRecipeImage(generatedRecipe.title, generatedRecipe.category, generatedRecipe.imageUrl)}
              alt={generatedRecipe.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getCategoryFallbackImage(
                  generatedRecipe.category,
                  generatedRecipe.title
                );
              }}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Recipe Generated</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
                {generatedRecipe.cuisine} • {generatedRecipe.category}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
                {generatedRecipe.title}
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {generatedRecipe.description}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Highlights row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="block text-[11px] text-stone-500 font-medium">Prep / Cook Time</span>
                <span className="font-bold text-stone-900 text-sm">
                  {generatedRecipe.prepTimeMinutes}m / {generatedRecipe.cookTimeMinutes}m
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                <ChefHat className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="block text-[11px] text-stone-500 font-medium">Difficulty</span>
                <span className="font-bold text-stone-900 text-sm">{generatedRecipe.difficulty}</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                <Utensils className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="block text-[11px] text-stone-500 font-medium">Servings</span>
                <span className="font-bold text-stone-900 text-sm">{generatedRecipe.servings} people</span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-center">
                <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="block text-[11px] text-stone-500 font-medium">Nutrition Est.</span>
                <span className="font-bold text-stone-900 text-sm">
                  {generatedRecipe.caloriesPerServing || 480} kcal
                </span>
              </div>
            </div>

            {/* Ingredients Analysis: What you had vs pantry staples vs extras */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>Ingredients Analysis</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {generatedRecipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {ing.isFromUser ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          From You
                        </span>
                      ) : ing.isPantryStaple ? (
                        <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-medium text-[10px]">
                          Pantry Staple
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium text-[10px]">
                          Optional
                        </span>
                      )}
                      <span className="font-semibold text-stone-800">{ing.name}</span>
                    </div>
                    <span className="font-bold text-emerald-700">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Substitutions & Chef Tips */}
            {generatedRecipe.substitutions && generatedRecipe.substitutions.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  <span>Clever Substitutions Suggested by Chef Gemini:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {generatedRecipe.substitutions.map((sub, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100">
                      <strong>{sub.original}</strong> → <span className="text-emerald-700 font-bold">{sub.substitute}</span>
                      <p className="text-stone-500 mt-0.5 text-[11px]">{sub.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-stone-900">Step-by-Step Instructions</h3>
              <div className="space-y-3">
                {generatedRecipe.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-start gap-3.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber || idx + 1}
                    </span>
                    <div className="flex-1 space-y-1.5">
                      {step.title && <h4 className="font-bold text-stone-900 text-sm">{step.title}</h4>}
                      <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">{step.instruction}</p>
                      {step.durationMinutes && step.durationMinutes > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            onStartTimer(
                              step.durationMinutes!,
                              `${generatedRecipe.title} - Step ${idx + 1}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
                        >
                          <Timer className="w-3.5 h-3.5 text-amber-700" />
                          <span>Start {step.durationMinutes}m Step Timer</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  disabled={hasSavedPersonal}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
                    hasSavedPersonal
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {hasSavedPersonal ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved to My Recipes!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save to My Recipes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFav(generatedRecipe)}
                  className={`px-4 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
                    isFav(generatedRecipe.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav(generatedRecipe.id) ? 'fill-current' : ''}`} />
                  <span>{isFav(generatedRecipe.id) ? 'Favourited' : 'Add to Favourites'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenRecipeDetail(generatedRecipe)}
                  className="px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Open in Interactive Cook Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
