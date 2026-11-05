import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Clock,
  ChefHat,
  Users,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Recipe, RecipeIngredient, RecipeInstruction } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { containsForbiddenMeat, FORBIDDEN_MESSAGE } from '../utils/restrictions';
import { resolveAccurateRecipeImage, getCategoryFallbackImage } from '../utils/recipeImageMatcher';

interface MyRecipesViewProps {
  myRecipes: Recipe[];
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  isFav: (id: string) => boolean;
  onToggleFav: (recipe: Recipe, e: React.MouseEvent) => void;
}

export const MyRecipesView: React.FC<MyRecipesViewProps> = ({
  myRecipes,
  onSaveRecipe,
  onDeleteRecipe,
  onSelectRecipe,
  isFav,
  onToggleFav,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Dinner');
  const [cuisine, setCuisine] = useState('Universal');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(25);
  const [servings, setServings] = useState(4);

  // Dynamic ingredient rows
  const [ingredients, setIngredients] = useState<Array<{ name: string; amount: string }>>([
    { name: '', amount: '' },
    { name: '', amount: '' },
  ]);

  // Dynamic instruction steps
  const [instructions, setInstructions] = useState<Array<{ title: string; instruction: string; duration: number }>>([
    { title: 'Prep', instruction: '', duration: 5 },
    { title: 'Cook', instruction: '', duration: 15 },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  // Open modal for new recipe
  const handleOpenNew = () => {
    setEditingRecipeId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setCategory('Dinner');
    setCuisine('Universal');
    setDifficulty('Easy');
    setPrepTimeMinutes(15);
    setCookTimeMinutes(25);
    setServings(4);
    setIngredients([
      { name: '', amount: '' },
      { name: '', amount: '' },
    ]);
    setInstructions([
      { title: 'Prep Ingredients', instruction: '', duration: 10 },
      { title: 'Cook & Simmer', instruction: '', duration: 15 },
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing recipe
  const handleOpenEdit = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRecipeId(recipe.id);
    setTitle(recipe.title);
    setDescription(recipe.description);
    setImageUrl(recipe.imageUrl);
    setCategory(recipe.category);
    setCuisine(recipe.cuisine);
    setDifficulty(recipe.difficulty);
    setPrepTimeMinutes(recipe.prepTimeMinutes);
    setCookTimeMinutes(recipe.cookTimeMinutes);
    setServings(recipe.servings);
    setIngredients(
      recipe.ingredients.map((i) => ({ name: i.name, amount: i.amount }))
    );
    setInstructions(
      recipe.instructions.map((i) => ({
        title: i.title || '',
        instruction: i.instruction,
        duration: i.durationMinutes || 0,
      }))
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle local image file upload -> Base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic ingredient handlers
  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleUpdateIngredient = (idx: number, field: 'name' | 'amount', val: string) => {
    const updated = [...ingredients];
    updated[idx][field] = val;
    setIngredients(updated);
  };

  const handleRemoveIngredientRow = (idx: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== idx));
    }
  };

  // Dynamic instruction handlers
  const handleAddInstructionRow = () => {
    setInstructions([
      ...instructions,
      { title: `Step ${instructions.length + 1}`, instruction: '', duration: 5 },
    ]);
  };

  const handleUpdateInstruction = (
    idx: number,
    field: 'title' | 'instruction' | 'duration',
    val: any
  ) => {
    const updated = [...instructions];
    updated[idx] = { ...updated[idx], [field]: val };
    setInstructions(updated);
  };

  const handleRemoveInstructionRow = (idx: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== idx));
    }
  };

  // Save / Validate
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // STRICT BEEF & PORK CHECK
    if (containsForbiddenMeat(title) || containsForbiddenMeat(description)) {
      setFormError(FORBIDDEN_MESSAGE);
      return;
    }

    if (!title.trim()) {
      setFormError('Please enter a recipe title.');
      return;
    }

    // Check ingredients for beef or pork
    for (const ing of ingredients) {
      if (containsForbiddenMeat(ing.name) || containsForbiddenMeat(ing.amount)) {
        setFormError(FORBIDDEN_MESSAGE);
        return;
      }
    }

    const validIngredients: RecipeIngredient[] = ingredients
      .filter((i) => i.name.trim() !== '')
      .map((i) => ({
        name: i.name.trim(),
        amount: i.amount.trim() || 'To taste',
        isFromUser: true,
      }));

    if (validIngredients.length === 0) {
      setFormError('Please provide at least one ingredient.');
      return;
    }

    const validInstructions: RecipeInstruction[] = instructions
      .filter((i) => i.instruction.trim() !== '')
      .map((i, idx) => ({
        stepNumber: idx + 1,
        title: i.title.trim() || `Step ${idx + 1}`,
        instruction: i.instruction.trim(),
        durationMinutes: Number(i.duration) || undefined,
        timerRecommended: Number(i.duration) > 0,
      }));

    if (validInstructions.length === 0) {
      setFormError('Please provide at least one cooking instruction step.');
      return;
    }

    const newRecipe: Recipe = {
      id: editingRecipeId || 'personal_' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'A delicious personal family recipe.',
      imageUrl:
        imageUrl.trim() ||
        resolveAccurateRecipeImage(title.trim(), category.trim()),
      category: category.trim() || 'General',
      cuisine: cuisine.trim() || 'Universal',
      difficulty,
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      cookTimeMinutes: Number(cookTimeMinutes) || 20,
      servings: Number(servings) || 4,
      caloriesPerServing: 450,
      ingredients: validIngredients,
      instructions: validInstructions,
      source: 'personal',
      createdAt: new Date().toISOString(),
    };

    onSaveRecipe(newRecipe);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
              My Personal Recipes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create, edit, organize, and cook your custom culinary dishes
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Personal Recipe</span>
        </button>
      </div>

      {/* Grid of Personal Recipes */}
      {myRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            No personal recipes yet
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Preserve your secret family recipes or save creative culinary experiments with complete ingredient ratios, step times, and photos.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Create Your First Recipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {myRecipes.map((recipe) => (
            <div key={recipe.id} className="relative group">
              <RecipeCard
                recipe={recipe}
                isFav={isFav(recipe.id)}
                onToggleFav={onToggleFav}
                onSelect={onSelectRecipe}
              />

              {/* Edit & Delete Action Pill in bottom corner */}
              <div className="absolute top-3 left-14 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title="Edit Recipe"
                  onClick={(e) => handleOpenEdit(recipe, e)}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-emerald-600 text-white backdrop-blur-xs transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Delete Recipe"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
                      onDeleteRecipe(recipe.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white backdrop-blur-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-stone-900">
                {editingRecipeId ? 'Edit Personal Recipe' : 'Create Personal Recipe'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nonna's Rustic Lasagna"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Description & Origin
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share the story, flavors, or serving ideas..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Image Preview & URL or File */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Recipe Image
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-24 h-24 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={imageUrl.trim() || resolveAccurateRecipeImage(title || 'Recipe', category)}
                      alt="Recipe preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getCategoryFallbackImage(category, title);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL (optional)..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Local Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-400">or leave blank for matching dish photo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800"
                  >
                    <option value="South Indian">South Indian</option>
                    <option value="Andhra & Telangana">Andhra & Telangana</option>
                    <option value="North Indian">North Indian</option>
                    <option value="Indian Street Food">Indian Street Food</option>
                    <option value="Indian Desserts">Indian Desserts (Mithai)</option>
                    <option value="Indian Non-Vegetarian">Indian Non-Vegetarian</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Breakfast">Breakfast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Cuisine
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. Italian, Indian"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={prepTimeMinutes}
                    onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Cook Time (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={cookTimeMinutes}
                    onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800"
                  />
                </div>
              </div>

              {/* Dynamic Ingredients */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Ingredients List *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ing.amount}
                        onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                        placeholder="Amount (e.g. 2 cups, 100g)"
                        className="w-1/3 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                        placeholder="Ingredient name (e.g. Olive Oil, Garlic)"
                        className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(idx)}
                          className="p-2 text-stone-400 hover:text-rose-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Instructions */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Step-by-Step Instructions *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddInstructionRow}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {instructions.map((step, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateInstruction(idx, 'title', e.target.value)}
                          placeholder={`Step ${idx + 1} Title (e.g. Sauté Veggies)`}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-900"
                        />
                        <div className="flex items-center gap-1.5 text-xs text-stone-600">
                          <span>Timer:</span>
                          <input
                            type="number"
                            min="0"
                            max="240"
                            value={step.duration}
                            onChange={(e) =>
                              handleUpdateInstruction(idx, 'duration', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-14 px-2 py-1 rounded-lg bg-white border border-stone-200 text-xs text-center"
                          />
                          <span>min</span>
                        </div>
                        {instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInstructionRow(idx)}
                            className="p-1 text-stone-400 hover:text-rose-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={step.instruction}
                        onChange={(e) => handleUpdateInstruction(idx, 'instruction', e.target.value)}
                        placeholder="Detailed instruction for this step..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRecipeId ? 'Save Changes' : 'Create Recipe'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
