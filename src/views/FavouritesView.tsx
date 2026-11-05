import React, { useState } from 'react';
import { Heart, Search, Compass, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';

interface FavouritesViewProps {
  favourites: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFav: (recipe: Recipe, e: React.MouseEvent) => void;
  onSelectTab: (tab: string) => void;
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({
  favourites,
  onSelectRecipe,
  onToggleFav,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const filteredFavourites = favourites.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource =
      selectedSource === 'all' || recipe.source === selectedSource;

    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-current" />
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
              Saved Favourites
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {favourites.length} {favourites.length === 1 ? 'recipe' : 'recipes'} saved across sessions
          </p>
        </div>

        {/* Source Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'themealdb', label: 'TheMealDB' },
            { id: 'ai', label: 'AI Chef' },
            { id: 'personal', label: 'Personal' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedSource(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSource === item.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search within favourites */}
      {favourites.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within your saved favourites..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      {/* Grid or Empty State */}
      {favourites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-display">
            No favourites saved yet
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Whenever you find an appetizing dish or generate a custom creation, tap the heart icon to save it here for quick access anytime!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => onSelectTab('explore')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Recipes</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('ai-generator')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Generate with AI</span>
            </button>
          </div>
        </div>
      ) : filteredFavourites.length === 0 ? (
        <div className="p-8 text-center text-stone-500 text-xs">
          No saved recipes matched your search filter "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFavourites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFav={true}
              onToggleFav={onToggleFav}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
};
