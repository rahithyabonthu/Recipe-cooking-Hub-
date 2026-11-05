import React from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  Search,
  Heart,
  BookOpen,
  Timer as TimerIcon,
  Dice5,
  Code2,
  Compass,
} from 'lucide-react';
import { ActiveTimer } from '../types/recipe';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeTimer: ActiveTimer | null;
  onOpenTimerModal: () => void;
  onRandomRecipe: () => void;
  isLoadingRandom: boolean;
  favCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeTimer,
  onOpenTimerModal,
  onRandomRecipe,
  isLoadingRandom,
  favCount,
}) => {
  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: UtensilsCrossed },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'ai-generator', label: 'AI Chef', icon: Sparkles, badge: 'Smart' },
    { id: 'favourites', label: 'Favourites', icon: Heart, count: favCount },
    { id: 'my-recipes', label: 'My Recipes', icon: BookOpen },
    { id: 'timer', label: 'Timer', icon: TimerIcon },
    { id: 'flutter-suite', label: 'Flutter Code', icon: Code2, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
                  Recipe<span className="text-emerald-600">Hub</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                  <span>🇮🇳</span>
                  <span>Indian Cuisine</span>
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-stone-500 font-medium">
                Authentic Heritage & AI Chef • <span className="text-emerald-700 font-semibold">100% Beef & Pork Free</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : item.highlight
                      ? 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-stone-500'}`} />
                  <span>{item.label}</span>

                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700">
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons (Timer + Surprise Me) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Ticking Timer Pill */}
            {activeTimer && (
              <button
                type="button"
                onClick={onOpenTimerModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-xs hover:bg-emerald-100 transition-colors animate-pulse"
              >
                <TimerIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formatTimerTime(activeTimer.remainingSeconds)}</span>
              </button>
            )}

            {/* Random Recipe button */}
            <button
              type="button"
              onClick={onRandomRecipe}
              disabled={isLoadingRandom}
              title="Surprise me with a random recipe!"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-stone-200 text-stone-800 shadow-2xs hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all disabled:opacity-50"
            >
              <Dice5 className={`w-4 h-4 text-emerald-600 ${isLoadingRandom ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Surprise Me</span>
            </button>

            {/* Quick Explore / Search trigger */}
            <button
              type="button"
              onClick={() => onSelectTab('explore')}
              title="Search recipes"
              className="p-2 sm:p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 shadow-2xs hover:bg-stone-50 hover:text-emerald-700 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
