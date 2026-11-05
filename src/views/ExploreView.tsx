import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Clock,
  X,
  Dice5,
  Utensils,
  Globe2,
  ChefHat,
  RefreshCw,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Recipe, Category } from '../types/recipe';
import { mealApi } from '../services/mealApi';
import { RecipeCard } from '../components/RecipeCard';
import { containsForbiddenMeat, FORBIDDEN_MESSAGE, sanitizeRecipeList } from '../utils/restrictions';
import { AUTHENTIC_INDIAN_RECIPES } from '../data/indianRecipes';

interface ExploreViewProps {
  categories: Category[];
  initialSearchQuery?: string;
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFav: (recipe: Recipe, e: React.MouseEvent) => void;
  isFav: (id: string) => boolean;
  onRandomRecipe: () => void;
  isLoadingRandom: boolean;
}

const CUISINES = [
  'All',
  'Indian',
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Punjab',
  'Maharashtra',
  'Gujarat & Rajasthan',
  'Italian',
  'Mexican',
  'French',
  'Greek',
  'Japanese',
  'Chinese',
  'Thai',
  'Spanish',
  'Moroccan',
  'Turkish',
];

const EXPLORE_CATEGORIES = [
  'All Categories',
  'South Indian',
  'Andhra & Telangana',
  'North Indian',
  'Indian Street Food',
  'Indian Desserts',
  'Indian Non-Vegetarian',
  'Chicken',
  'Vegetarian',
  'Seafood',
  'Dessert',
  'Pasta',
  'Breakfast',
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  categories,
  initialSearchQuery = '',
  onSelectRecipe,
  onToggleFav,
  isFav,
  onRandomRecipe,
  isLoadingRandom,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [maxCookingTime, setMaxCookingTime] = useState<number>(120);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial search query when it changes from props
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Load recipes based on category or search
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      // STRICT BEEF & PORK CHECK
      if (containsForbiddenMeat(searchQuery)) {
        setErrorMessage(FORBIDDEN_MESSAGE);
        setRecipes([]);
        setIsLoading(false);
        return;
      }

      setErrorMessage(null);
      setIsLoading(true);

      try {
        let results: Recipe[] = [];

        if (searchQuery.trim()) {
          results = await mealApi.searchMeals(searchQuery.trim());
        } else if (selectedCategory !== 'All Categories') {
          // Check if category is one of the Indian categories
          const matchingIndian = AUTHENTIC_INDIAN_RECIPES.filter(
            (r) => r.category.toLowerCase() === selectedCategory.toLowerCase()
          );

          if (matchingIndian.length > 0) {
            results = matchingIndian;
          } else {
            results = await mealApi.getMealsByCategory(selectedCategory);
          }
        } else if (selectedCuisine !== 'All') {
          if (
            selectedCuisine === 'Indian' ||
            ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Punjab', 'Maharashtra', 'Gujarat & Rajasthan'].includes(selectedCuisine)
          ) {
            results = AUTHENTIC_INDIAN_RECIPES.filter((r) =>
              r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()) ||
              r.description.toLowerCase().includes(selectedCuisine.toLowerCase())
            );
          } else {
            results = await mealApi.getMealsByCuisine(selectedCuisine);
          }
        } else {
          // Default: showcase Indian favorites first, followed by chicken recipes
          results = [...AUTHENTIC_INDIAN_RECIPES, ...(await mealApi.searchMeals('chicken'))];
        }

        if (!isCancelled) {
          setRecipes(sanitizeRecipeList(results));
        }
      } catch (err) {
        console.error('Error fetching recipes in Explore:', err);
        if (!isCancelled) setRecipes(AUTHENTIC_INDIAN_RECIPES);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadData();
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory, selectedCuisine]);

  // Apply client-side filters: max cooking time, difficulty
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

      if (maxCookingTime < 120 && totalTime > maxCookingTime) {
        return false;
      }

      if (selectedDifficulty !== 'All' && recipe.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [recipes, maxCookingTime, selectedDifficulty]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedCuisine('All');
    setSelectedDifficulty('All');
    setMaxCookingTime(120);
    setErrorMessage(null);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All Categories' ||
    selectedCuisine !== 'All' ||
    selectedDifficulty !== 'All' ||
    maxCookingTime < 120;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
            Explore & Discover Recipes
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Authentic Indian culinary heritage and clean global dishes (Strictly No Beef, No Pork)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Surprise Me / Random Recipe */}
          <button
            type="button"
            onClick={onRandomRecipe}
            disabled={isLoadingRandom}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-xs sm:text-sm font-bold shadow-xs hover:bg-stone-50 transition-all disabled:opacity-50"
          >
            <Dice5 className={`w-4 h-4 text-emerald-600 ${isLoadingRandom ? 'animate-spin' : ''}`} />
            <span>Random Recipe</span>
          </button>

          {/* Toggle Mobile Filters */}
          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
              hasActiveFilters
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-stone-700 border-stone-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setErrorMessage(null);
          }}
          placeholder="Search by recipe name or ingredient (e.g. Biryani, Dosa, Paneer, Gongura, Chicken, Samosa)..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setErrorMessage(null);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Prohibition Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-scale-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Category Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {EXPLORE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Detailed Filters Bar */}
      <div
        className={`bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs ${
          showFiltersMobile ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Cuisine / Regional Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cuisine / Region</span>
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => {
                setSelectedCuisine(e.target.value);
                setSearchQuery('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Cuisines' : `${c}`}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
              <span>Difficulty</span>
            </label>
            <div className="flex items-center gap-1">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Max Cook Time Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Max Time</span>
              </label>
              <span className="text-xs font-bold text-emerald-700">
                {maxCookingTime >= 120 ? 'Any Time' : `≤ ${maxCookingTime} mins`}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={maxCookingTime}
              onChange={(e) => setMaxCookingTime(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Reset Filters button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
        <span>
          Showing <strong className="text-stone-900">{filteredRecipes.length}</strong> clean, delicious recipes
        </span>
        {hasActiveFilters && (
          <span className="text-emerald-700 font-semibold">Filters active</span>
        )}
      </div>

      {/* Grid or Loading or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl h-80 border border-stone-200 animate-pulse p-4 space-y-3"
            >
              <div className="h-44 bg-stone-100 rounded-xl" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            {errorMessage ? 'Prohibited Ingredients Detected' : 'No matching recipes found'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            {errorMessage ||
              "We couldn't find any recipes matching your current filters. Try searching for Idli, Dosa, Biryani, Paneer, or resetting your filters."}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFav={isFav(recipe.id)}
              onToggleFav={onToggleFav}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
};
