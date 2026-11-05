import React from 'react';
import { Clock, ChefHat, Heart, Sparkles, User, Flame } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { resolveAccurateRecipeImage, getCategoryFallbackImage } from '../utils/recipeImageMatcher';

interface RecipeCardProps {
  recipe: Recipe;
  isFav: boolean;
  onToggleFav: (recipe: Recipe, e: React.MouseEvent) => void;
  onSelect: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFav,
  onToggleFav,
  onSelect,
}) => {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200',
  }[recipe.difficulty || 'Easy'];

  // Resolve authentic verified image matching the exact recipe name and category
  const accurateImageUrl = resolveAccurateRecipeImage(
    recipe.title,
    recipe.category,
    recipe.imageUrl
  );

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <img
          src={accurateImageUrl}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Category-specific fallback matching the exact dish instead of a misleading image
            (e.target as HTMLImageElement).src = getCategoryFallbackImage(recipe.category, recipe.title);
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Source Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {recipe.source === 'ai' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm backdrop-blur-xs">
              <Sparkles className="w-3 h-3" />
              AI Chef
            </span>
          )}
          {recipe.source === 'personal' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white shadow-sm backdrop-blur-xs">
              <User className="w-3 h-3" />
              Personal
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-md">
            {recipe.category || 'Recipe'}
          </span>
        </div>

        {/* Favourite Button */}
        <button
          type="button"
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          onClick={(e) => onToggleFav(recipe, e)}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 shadow-md backdrop-blur-md ${
            isFav
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom image metadata */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs">
            {recipe.cuisine || 'International'}
          </span>
          {recipe.caloriesPerServing && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs">
              <Flame className="w-3 h-3 text-amber-300" />
              {recipe.caloriesPerServing} kcal
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {recipe.title}
          </h3>
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalTime > 0 ? `${totalTime} mins` : '30 mins'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyColors}`}>
              {recipe.difficulty || 'Easy'}
            </span>
            <div className="flex items-center gap-1 text-stone-400">
              <ChefHat className="w-3.5 h-3.5 text-stone-500" />
              <span>{recipe.ingredients.length} ingr.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
