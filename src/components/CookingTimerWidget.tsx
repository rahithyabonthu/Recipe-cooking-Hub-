import React from 'react';
import { Timer, Play, Pause, RotateCcw, X, Maximize2 } from 'lucide-react';
import { ActiveTimer } from '../types/recipe';

interface CookingTimerWidgetProps {
  timer: ActiveTimer | null;
  onTogglePlay: () => void;
  onReset: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const CookingTimerWidget: React.FC<CookingTimerWidgetProps> = ({
  timer,
  onTogglePlay,
  onReset,
  onExpand,
  onClose,
}) => {
  if (!timer) return null;

  const progressPercent = Math.min(
    100,
    Math.max(0, ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100)
  );

  const mins = Math.floor(timer.remainingSeconds / 60);
  const secs = timer.remainingSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 animate-slide-up">
      <div className="bg-stone-900 text-white rounded-2xl p-3.5 shadow-2xl border border-stone-700/60 flex items-center gap-3 backdrop-blur-md max-w-sm">
        {/* Circular Progress Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#44403C"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
            />
          </svg>
          <Timer className="w-5 h-5 text-emerald-400 absolute" />
        </div>

        {/* Text and Countdown */}
        <div className="min-w-[100px] cursor-pointer" onClick={onExpand}>
          <p className="text-[11px] font-medium text-stone-400 truncate max-w-[130px]">
            {timer.title || 'Cooking Timer'}
          </p>
          <p className="text-lg font-bold font-mono tracking-tight text-white">
            {timeFormatted}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`p-2 rounded-xl transition-colors ${
              timer.isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={timer.isRunning ? 'Pause' : 'Resume'}
          >
            {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onExpand}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
            title="Full Timer Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
