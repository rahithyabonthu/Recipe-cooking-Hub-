import React from 'react';
import {
  UtensilsCrossed,
  Compass,
  Sparkles,
  Heart,
  BookOpen,
  Timer as TimerIcon,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  favCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  favCount,
}) => {
  const items = [
    { id: 'home', label: 'Home', icon: UtensilsCrossed },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'ai-generator', label: 'AI Chef', icon: Sparkles, highlight: true },
    { id: 'favourites', label: 'Saved', icon: Heart, count: favCount },
    { id: 'my-recipes', label: 'Mine', icon: BookOpen },
    { id: 'timer', label: 'Timer', icon: TimerIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-1.5 shadow-lg safe-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative"
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.highlight && !isActive ? 'text-emerald-600' : ''}`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute top-1 right-2.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {item.count > 9 ? '9+' : item.count}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-emerald-900' : 'font-medium text-stone-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
