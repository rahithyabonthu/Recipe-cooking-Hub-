import React, { useState, useEffect } from 'react';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Flame,
  Volume2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';

interface CookingTimerViewProps {
  initialMinutes?: number;
  initialTitle?: string;
  onTimerRunningChange?: (isRunning: boolean, remaining: number, total: number) => void;
}

const PRESETS = [
  { label: 'Soft Boiled Egg', minutes: 6, icon: '🥚' },
  { label: 'Hard Boiled Egg', minutes: 9, icon: '🥚' },
  { label: 'Al Dente Pasta', minutes: 10, icon: '🍝' },
  { label: 'Sauté Aromatics', minutes: 4, icon: '🧅' },
  { label: 'Rest Meat / Steak', minutes: 5, icon: '🥩' },
  { label: 'Simmer Stew / Soup', minutes: 25, icon: '🍲' },
  { label: 'Bake Cookies', minutes: 12, icon: '🍪' },
  { label: 'Steep Herbal Tea', minutes: 3, icon: '🫖' },
];

export const CookingTimerView: React.FC<CookingTimerViewProps> = ({
  initialMinutes = 10,
  initialTitle = 'Kitchen Timer',
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerTitle, setTimerTitle] = useState<string>(initialTitle);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Custom inputs
  const [customMins, setCustomMins] = useState<number>(10);
  const [customSecs, setCustomSecs] = useState<number>(0);

  // Sync if initialMinutes change
  useEffect(() => {
    if (initialMinutes > 0) {
      const secs = initialMinutes * 60;
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
      setIsRunning(true);
      setIsFinished(false);
      setTimerTitle(initialTitle);
    }
  }, [initialMinutes, initialTitle]);

  // Main countdown interval loop
  useEffect(() => {
    let interval: any = null;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            soundEffects.playTimerComplete();
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (remainingSeconds === 0 && isRunning) {
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  const handleStartPause = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
      setIsFinished(false);
    }
    soundEffects.playSoftBeep();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    setIsFinished(false);
    soundEffects.playSoftBeep();
  };

  const handleSelectPreset = (minutes: number, label: string) => {
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setTimerTitle(label);
    setIsFinished(false);
    setIsRunning(true);
    soundEffects.playSoftBeep();
  };

  const handleApplyCustomTime = () => {
    const secs = (customMins || 0) * 60 + (customSecs || 0);
    if (secs > 0) {
      setTotalSeconds(secs);
      setRemainingSeconds(secs);
      setTimerTitle(`Custom Timer (${customMins}m ${customSecs}s)`);
      setIsFinished(false);
      setIsRunning(true);
      soundEffects.playSoftBeep();
    }
  };

  const handleAddMinutes = (extraMins: number) => {
    const addSecs = extraMins * 60;
    setTotalSeconds((prev) => prev + addSecs);
    setRemainingSeconds((prev) => prev + addSecs);
    setIsFinished(false);
    soundEffects.playSoftBeep();
  };

  // Calculations for display
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const displayTime = hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const progressPercent = totalSeconds > 0
    ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
    : 0;

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span>Kitchen Cooking Timer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-stone-900">
          Precision Cooking Timer
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Keep your dishes cooked to exact culinary perfection with audio alerts & presets
        </p>
      </div>

      {/* Main Big Circular Timer Dial */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Timer Label */}
        <div className="mb-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {timerTitle}
          </span>
        </div>

        {/* Big Circular SVG Dial */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke="#F5F5F4"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              stroke={isFinished ? '#10B981' : isRunning ? '#059669' : '#D97706'}
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 135}
              strokeDashoffset={2 * Math.PI * 135 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isFinished ? (
              <div className="space-y-2 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <span className="text-2xl font-bold font-display text-stone-900">Time's Up!</span>
                <p className="text-xs text-stone-500 font-semibold">Your dish is ready!</p>
              </div>
            ) : (
              <>
                <span className="text-4xl sm:text-6xl font-mono font-extrabold tracking-tight text-stone-900">
                  {displayTime}
                </span>
                <span className="text-xs text-stone-400 font-medium mt-1">
                  {isRunning ? 'Cooking in progress...' : remainingSeconds === 0 ? 'Ready' : 'Paused'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleAddMinutes(1)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
          >
            +1 Min
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(5)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
          >
            +5 Min
          </button>
          <button
            type="button"
            onClick={() => handleAddMinutes(10)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
          >
            +10 Min
          </button>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="p-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shadow-2xs"
            title="Reset Timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleStartPause}
            className={`px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-95 flex items-center gap-2.5 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span>{remainingSeconds < totalSeconds ? 'Resume' : 'Start Timer'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => soundEffects.playTimerComplete()}
            className="p-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shadow-2xs"
            title="Test Chime Sound"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Culinary Presets Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 font-display">
          Popular Culinary Presets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset.minutes, preset.label)}
              className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group"
            >
              <span className="text-2xl block mb-1">{preset.icon}</span>
              <span className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors block">
                {preset.label}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 block">
                {preset.minutes} minutes
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Timer Input */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900">Set Custom Countdown</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="240"
              value={customMins}
              onChange={(e) => setCustomMins(parseInt(e.target.value, 10) || 0)}
              className="w-20 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center font-bold text-sm text-stone-900"
            />
            <span className="text-xs font-semibold text-stone-500">mins</span>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="59"
              value={customSecs}
              onChange={(e) => setCustomSecs(parseInt(e.target.value, 10) || 0)}
              className="w-20 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-center font-bold text-sm text-stone-900"
            />
            <span className="text-xs font-semibold text-stone-500">secs</span>
          </div>

          <button
            type="button"
            onClick={handleApplyCustomTime}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>
  );
};
