/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CookingTimerWidget } from './components/CookingTimerWidget';
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { AiGeneratorView } from './views/AiGeneratorView';
import { FavouritesView } from './views/FavouritesView';
import { MyRecipesView } from './views/MyRecipesView';
import { CookingTimerView } from './views/CookingTimerView';
import { FlutterSuiteView } from './views/FlutterSuiteView';
import { RecipeDetailModal } from './views/RecipeDetailModal';
import { Recipe, Category, ActiveTimer } from './types/recipe';
import { mealApi } from './services/mealApi';
import { storageService } from './services/storageService';
import { soundEffects } from './services/soundEffects';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [favourites, setFavourites] = useState<Recipe[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Recipe[]>([]);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);

  // Selected recipe for full detail modal & cook mode
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Initial search text to pass to Explore tab
  const [exploreInitialSearch, setExploreInitialSearch] = useState<string>('');

  // Active floating timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  // Random recipe loading state
  const [isLoadingRandom, setIsLoadingRandom] = useState<boolean>(false);

  // Initialize initial data
  useEffect(() => {
    // Load local storage items
    setFavourites(storageService.getFavourites());
    setRecentlyViewed(storageService.getRecentlyViewed());
    setMyRecipes(storageService.getMyRecipes());

    // Load TheMealDB categories and initial popular items (prioritizing authentic Indian cuisine)
    const loadInitialMeals = async () => {
      try {
        const [cats, meals] = await Promise.all([
          mealApi.getCategories(),
          mealApi.searchMeals('chicken'),
        ]);
        setCategories(cats);
        // Prioritize authentic Indian recipes at the top of popular recipes
        const indianStarters = mealApi.getAuthenticIndianRecipes().slice(0, 8);
        setPopularRecipes([...indianStarters, ...meals]);
      } catch (err) {
        console.warn('Initial data load error:', err);
        setPopularRecipes(mealApi.getAuthenticIndianRecipes().slice(0, 8));
      }
    };

    loadInitialMeals();
  }, []);

  // Global background timer countdown loop
  useEffect(() => {
    let interval: any = null;

    if (activeTimer && activeTimer.isRunning && activeTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => {
          if (!prev) return null;
          if (prev.remainingSeconds <= 1) {
            soundEffects.playTimerComplete();
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
            return {
              ...prev,
              remainingSeconds: 0,
              isRunning: false,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer?.isRunning, activeTimer?.remainingSeconds]);

  // Handle recipe selection and track to recently viewed
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    storageService.addRecentlyViewed(recipe);
    setRecentlyViewed(storageService.getRecentlyViewed());
  };

  // Toggle favourite
  const handleToggleFav = (recipe: Recipe, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    storageService.toggleFavourite(recipe);
    setFavourites(storageService.getFavourites());
  };

  const isFav = (id: string) => {
    return favourites.some((r) => r.id === id);
  };

  // Trigger random recipe
  const handleRandomRecipe = async () => {
    setIsLoadingRandom(true);
    try {
      const meal = await mealApi.getRandomMeal();
      if (meal) {
        handleSelectRecipe(meal);
      }
    } catch (err) {
      console.error('Random recipe error:', err);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Quick category click from Home -> switch to Explore with that category
  const handleCategoryClick = (categoryName: string) => {
    setExploreInitialSearch(categoryName);
    setCurrentTab('explore');
  };

  // Quick search from Home hero -> switch to Explore
  const handleQuickSearch = (query: string) => {
    setExploreInitialSearch(query);
    setCurrentTab('explore');
  };

  // Start timer from recipe steps or details
  const handleStartTimer = (minutes: number, title: string) => {
    const totalSecs = minutes * 60;
    setActiveTimer({
      id: 'timer_' + Date.now(),
      title,
      totalSeconds: totalSecs,
      remainingSeconds: totalSecs,
      isRunning: true,
    });
    soundEffects.playSoftBeep();
  };

  // Timer controls on widget
  const handleToggleTimerPlay = () => {
    if (!activeTimer) return;
    if (activeTimer.remainingSeconds === 0) {
      setActiveTimer({
        ...activeTimer,
        remainingSeconds: activeTimer.totalSeconds,
        isRunning: true,
      });
    } else {
      setActiveTimer({
        ...activeTimer,
        isRunning: !activeTimer.isRunning,
      });
    }
    soundEffects.playSoftBeep();
  };

  const handleResetTimer = () => {
    if (!activeTimer) return;
    setActiveTimer({
      ...activeTimer,
      remainingSeconds: activeTimer.totalSeconds,
      isRunning: false,
    });
    soundEffects.playSoftBeep();
  };

  // Save personal recipe
  const handleSavePersonalRecipe = (recipe: Recipe) => {
    storageService.savePersonalRecipe(recipe);
    setMyRecipes(storageService.getMyRecipes());
  };

  // Delete personal recipe
  const handleDeletePersonalRecipe = (id: string) => {
    storageService.deletePersonalRecipe(id);
    setMyRecipes(storageService.getMyRecipes());
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTimer={activeTimer}
        onOpenTimerModal={() => setCurrentTab('timer')}
        onRandomRecipe={handleRandomRecipe}
        isLoadingRandom={isLoadingRandom}
        favCount={favourites.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'home' && (
          <HomeView
            categories={categories}
            popularRecipes={popularRecipes}
            recentlyViewed={recentlyViewed}
            favourites={favourites}
            onSelectRecipe={handleSelectRecipe}
            onToggleFav={handleToggleFav}
            isFav={isFav}
            onSelectTab={setCurrentTab}
            onCategoryClick={handleCategoryClick}
            onQuickSearch={handleQuickSearch}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreView
            categories={categories}
            initialSearchQuery={exploreInitialSearch}
            onSelectRecipe={handleSelectRecipe}
            onToggleFav={handleToggleFav}
            isFav={isFav}
            onRandomRecipe={handleRandomRecipe}
            isLoadingRandom={isLoadingRandom}
          />
        )}

        {currentTab === 'ai-generator' && (
          <AiGeneratorView
            onSaveToMyRecipes={handleSavePersonalRecipe}
            onOpenRecipeDetail={handleSelectRecipe}
            isFav={isFav}
            onToggleFav={handleToggleFav}
            onStartTimer={handleStartTimer}
          />
        )}

        {currentTab === 'favourites' && (
          <FavouritesView
            favourites={favourites}
            onSelectRecipe={handleSelectRecipe}
            onToggleFav={handleToggleFav}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'my-recipes' && (
          <MyRecipesView
            myRecipes={myRecipes}
            onSaveRecipe={handleSavePersonalRecipe}
            onDeleteRecipe={handleDeletePersonalRecipe}
            onSelectRecipe={handleSelectRecipe}
            isFav={isFav}
            onToggleFav={handleToggleFav}
          />
        )}

        {currentTab === 'timer' && (
          <CookingTimerView
            initialMinutes={activeTimer ? Math.ceil(activeTimer.totalSeconds / 60) : 10}
            initialTitle={activeTimer ? activeTimer.title : 'Kitchen Cooking Timer'}
          />
        )}

        {currentTab === 'flutter-suite' && (
          <FlutterSuiteView />
        )}
      </main>

      {/* Floating Active Timer Widget */}
      {activeTimer && currentTab !== 'timer' && (
        <CookingTimerWidget
          timer={activeTimer}
          onTogglePlay={handleToggleTimerPlay}
          onReset={handleResetTimer}
          onExpand={() => setCurrentTab('timer')}
          onClose={() => setActiveTimer(null)}
        />
      )}

      {/* Recipe Detail & Cook Mode Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isFav={isFav(selectedRecipe.id)}
          onToggleFav={handleToggleFav}
          onStartTimer={handleStartTimer}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        favCount={favourites.length}
      />
    </div>
  );
}
