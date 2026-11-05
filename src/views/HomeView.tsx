import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Heart,
  ChefHat,
  Compass,
  Utensils,
  Flame,
  Globe,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Recipe, Category } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { AUTHENTIC_INDIAN_RECIPES, INDIAN_REGIONS } from '../data/indianRecipes';
import { containsForbiddenMeat, FORBIDDEN_MESSAGE } from '../utils/restrictions';
import { resolveAccurateRecipeImage, getCategoryFallbackImage } from '../utils/recipeImageMatcher';

interface HomeViewProps {
  categories: Category[];
  popularRecipes: Recipe[];
  recentlyViewed: Recipe[];
  favourites: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFav: (recipe: Recipe, e: React.MouseEvent) => void;
  isFav: (id: string) => boolean;
  onSelectTab: (tab: string) => void;
  onCategoryClick: (categoryName: string) => void;
  onQuickSearch: (query: string) => void;
}

const INDIAN_SUB_CATEGORIES = [
  'All Indian',
  'South Indian',
  'Andhra & Telangana',
  'North Indian',
  'Indian Street Food',
  'Indian Desserts',
  'Indian Non-Vegetarian',
];

export const HomeView: React.FC<HomeViewProps> = ({
  categories,
  popularRecipes,
  recentlyViewed,
  favourites,
  onSelectRecipe,
  onToggleFav,
  isFav,
  onSelectTab,
  onCategoryClick,
  onQuickSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedIndianCategory, setSelectedIndianCategory] = useState<string>('All Indian');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    if (containsForbiddenMeat(searchInput)) {
      setSearchError(FORBIDDEN_MESSAGE);
      return;
    }

    if (searchInput.trim()) {
      onQuickSearch(searchInput.trim());
      onSelectTab('explore');
    }
  };

  // Filtered Indian recipes based on selected tab or region
  const displayedIndianRecipes = useMemo(() => {
    return AUTHENTIC_INDIAN_RECIPES.filter((r) => {
      if (selectedRegion) {
        return (
          r.cuisine.toLowerCase().includes(selectedRegion.toLowerCase()) ||
          r.description.toLowerCase().includes(selectedRegion.toLowerCase())
        );
      }
      if (selectedIndianCategory === 'All Indian') return true;
      return r.category.toLowerCase() === selectedIndianCategory.toLowerCase();
    });
  }, [selectedIndianCategory, selectedRegion]);

  const featuredRecipe = AUTHENTIC_INDIAN_RECIPES[13] || popularRecipes[0] || null; // Authentic Andhra Kodi Kura

  return (
    <div className="space-y-10 pb-16 animate-fade-in">
      
      {/* 1. HERO WELCOME & SEARCH BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-amber-950 text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold backdrop-blur-md mb-4 border border-emerald-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Multiplatform Culinary Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight leading-tight">
            Discover the Rich Soul of <span className="text-amber-400 italic">Indian Cuisine</span>
          </h1>

          <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
            From crispy Masala Dosas and fiery Andhra Kodi Kura to royal Hyderabadi Dum Biryani and street-style Pani Puri. Strict 100% Halal/Satvik dietary compliance (Strictly No Beef, No Pork).
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchError(null);
                }}
                placeholder="Search Biryani, Dosa, Paneer, Andhra Curry, Samosa..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-stone-400 text-sm focus:outline-none focus:bg-white/15 focus:border-emerald-400 transition-all backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm transition-all shadow-md active:scale-95 shrink-0"
            >
              Search
            </button>
          </form>

          {/* Search Error Alert */}
          {searchError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-900/90 border border-rose-700 text-rose-100 text-xs flex items-center gap-2 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Popular search tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-300">
            <span className="font-semibold text-amber-300">Popular:</span>
            {['Masala Dosa', 'Hyderabadi Biryani', 'Andhra Chicken', 'Paneer Butter Masala', 'Gongura Pachadi', 'Pani Puri', 'Gulab Jamun'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onQuickSearch(tag);
                  onSelectTab('explore');
                }}
                className="hover:text-amber-300 transition-colors underline decoration-stone-500 hover:decoration-amber-400"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. DEDICATED AUTHENTIC INDIAN CUISINE SHOWCASE (TOP PRIORITY) */}
      <section className="space-y-5 bg-gradient-to-b from-amber-50/50 via-white to-stone-50/60 p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900 tracking-tight">
                Authentic Indian Recipes & Regional Heritage
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Cooked with aromatic spices, tadka tempering, and measurements in grams, cups, and teaspoons.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              ✓ 100% Beef & Pork Free
            </span>
          </div>
        </div>

        {/* Indian Cuisine Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {INDIAN_SUB_CATEGORIES.map((cat) => {
            const isSelected = selectedIndianCategory === cat && !selectedRegion;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedIndianCategory(cat);
                  setSelectedRegion(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Regional Cuisines Badges */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Regions:</span>
          </span>
          {INDIAN_REGIONS.map((reg) => (
            <button
              key={reg.id}
              type="button"
              onClick={() => {
                setSelectedRegion(selectedRegion === reg.name ? null : reg.name);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedRegion === reg.name
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-900'
              }`}
            >
              {reg.name}
            </button>
          ))}
        </div>

        {/* Grid of Indian Recipes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedIndianRecipes.slice(0, 8).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFav={isFav(recipe.id)}
              onToggleFav={onToggleFav}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              onQuickSearch('Indian');
              onSelectTab('explore');
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-50 shadow-xs transition-colors"
          >
            <span>Explore All Authentic Indian Recipes ({AUTHENTIC_INDIAN_RECIPES.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. AI RECIPE GENERATOR CALLOUT CARD */}
      <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Ingredient Chef</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
            Have leftover Indian or pantry ingredients?
          </h2>
          <p className="text-stone-600 text-sm max-w-xl">
            Input staples like "Tomato, Onion, Potato, Rice, Green Chilli" and our Gemini AI will formulate an authentic recipe with tadka instructions, accurate measurements, and step timers!
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('ai-generator')}
          className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <span>Open AI Recipe Generator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* 4. FEATURED RECIPE SPOTLIGHT */}
      {featuredRecipe && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
                Culinary Spotlight
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('explore')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            onClick={() => onSelectRecipe(featuredRecipe)}
            className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-md hover:shadow-xl transition-all cursor-pointer grid grid-cols-1 md:grid-cols-12"
          >
            <div className="md:col-span-7 h-64 md:h-96 relative overflow-hidden bg-stone-100">
              <img
                src={resolveAccurateRecipeImage(featuredRecipe.title, featuredRecipe.category, featuredRecipe.imageUrl)}
                alt={featuredRecipe.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getCategoryFallbackImage(
                    featuredRecipe.category,
                    featuredRecipe.title
                  );
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-md">
                  Heritage Recipe
                </span>
              </div>
            </div>

            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider">
                  <span>{featuredRecipe.category}</span>
                  <span>•</span>
                  <span>{featuredRecipe.cuisine}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {featuredRecipe.title}
                </h3>
                <p className="mt-2 text-stone-600 text-sm leading-relaxed line-clamp-3">
                  {featuredRecipe.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{featuredRecipe.prepTimeMinutes + featuredRecipe.cookTimeMinutes} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {featuredRecipe.difficulty}
                  </span>
                  <span className="font-medium text-stone-500">
                    {featuredRecipe.ingredients.length} ingredients
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. RECIPE CATEGORIES SCROLL */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              Browse Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('explore')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>See Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.idCategory}
              onClick={() => onCategoryClick(cat.strCategory)}
              className="flex flex-col items-center p-3.5 rounded-2xl bg-white border border-stone-200/80 hover:border-emerald-500 hover:shadow-md transition-all shrink-0 w-28 group"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-stone-100 p-1 mb-2 group-hover:scale-105 transition-transform">
                <img
                  src={cat.strCategoryThumb}
                  alt={cat.strCategory}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-emerald-700 transition-colors text-center truncate w-full">
                {cat.strCategory}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 6. POPULAR RECIPES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              Global Favorites (Halal / Clean)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('explore')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {popularRecipes.slice(0, 8).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFav={isFav(recipe.id)}
              onToggleFav={onToggleFav}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      </section>

      {/* 7. RECENTLY VIEWED */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-stone-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              Recently Viewed
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentlyViewed.slice(0, 4).map((recipe) => (
              <RecipeCard
                key={`recent_${recipe.id}`}
                recipe={recipe}
                isFav={isFav(recipe.id)}
                onToggleFav={onToggleFav}
                onSelect={onSelectRecipe}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. QUICK FAVOURITES */}
      {favourites.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
                Your Saved Favourites ({favourites.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('favourites')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Favourites</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {favourites.slice(0, 4).map((recipe) => (
              <RecipeCard
                key={`fav_${recipe.id}`}
                recipe={recipe}
                isFav={true}
                onToggleFav={onToggleFav}
                onSelect={onSelectRecipe}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
