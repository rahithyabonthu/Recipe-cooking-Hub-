import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Clock,
  ChefHat,
  Users,
  Flame,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  Youtube,
  Timer,
  Utensils,
  Lightbulb,
} from 'lucide-react';
import { Recipe, RecipeInstruction } from '../types/recipe';
import { aiService } from '../services/aiService';
import { containsForbiddenMeat, FORBIDDEN_MESSAGE } from '../utils/restrictions';
import { resolveAccurateRecipeImage, getCategoryFallbackImage } from '../utils/recipeImageMatcher';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isFav: boolean;
  onToggleFav: (recipe: Recipe) => void;
  onStartTimer: (minutes: number, title: string) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  isFav,
  onToggleFav,
  onStartTimer,
}) => {
  const [servingMultiplier, setServingMultiplier] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isCookMode, setIsCookMode] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Chef AI Question widget
  const [chefQuestion, setChefQuestion] = useState<string>('');
  const [chefAnswer, setChefAnswer] = useState<string | null>(null);
  const [isAskingChef, setIsAskingChef] = useState<boolean>(false);

  // Text to speech voice guidance
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    // Reset state when recipe changes
    setServingMultiplier(1);
    setCheckedIngredients({});
    setIsCookMode(false);
    setActiveStepIndex(0);
    setChefQuestion('');
    setChefAnswer(null);
  }, [recipe?.id]);

  useEffect(() => {
    // Stop speech synthesis when closing or unmounting
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!recipe) return null;

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAskChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chefQuestion.trim() || isAskingChef) return;

    if (containsForbiddenMeat(chefQuestion)) {
      setChefAnswer(FORBIDDEN_MESSAGE);
      return;
    }

    setIsAskingChef(true);
    try {
      const answer = await aiService.askChef(chefQuestion, recipe);
      setChefAnswer(answer);
    } catch {
      setChefAnswer('Chef is currently busy in the kitchen. Make sure heat is gentle and season to taste!');
    } finally {
      setIsAskingChef(false);
    }
  };

  // Text-to-speech for Cook Mode
  const speakStep = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const currentStep: RecipeInstruction | undefined = recipe.instructions[activeStepIndex];

  // Recalculate ingredient amounts if numeric
  const scaleAmount = (amountStr: string, multiplier: number) => {
    if (multiplier === 1) return amountStr;
    const match = amountStr.match(/^([\d./]+)\s*(.*)$/);
    if (match) {
      const valStr = match[1];
      const rest = match[2];
      let val = 0;
      if (valStr.includes('/')) {
        const [num, den] = valStr.split('/').map(Number);
        if (den) val = num / den;
      } else {
        val = parseFloat(valStr);
      }
      if (!isNaN(val)) {
        const scaled = (val * multiplier).toFixed(1).replace(/\.0$/, '');
        return `${scaled} ${rest}`.trim();
      }
    }
    return amountStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 lg:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] sm:rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden my-auto max-h-[100vh] sm:max-h-[92vh] flex flex-col">
        
        {/* Modal Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              {recipe.category}
            </span>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
              {recipe.cuisine}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Enter Cook Mode Button */}
            <button
              type="button"
              onClick={() => setIsCookMode(!isCookMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isCookMode
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{isCookMode ? 'Exit Cook Mode' : 'Start Cook Mode'}</span>
            </button>

            {/* Favorite toggle */}
            <button
              type="button"
              onClick={() => onToggleFav(recipe)}
              className={`p-2 rounded-xl border transition-all ${
                isFav
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-stone-200 text-stone-600 hover:text-rose-500 hover:bg-stone-50'
              }`}
              title={isFav ? 'Remove from favourites' : 'Save to favourites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          
          {/* ============ COOK MODE VIEW ============ */}
          {isCookMode ? (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-emerald-200 text-sm font-semibold mb-4">
                  <span>
                    STEP {activeStepIndex + 1} OF {recipe.instructions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakStep(currentStep?.instruction || '')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Step Title & Instruction */}
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-3">
                  {currentStep?.title || `Step ${activeStepIndex + 1}`}
                </h3>
                <p className="text-lg sm:text-xl text-emerald-50 leading-relaxed">
                  {currentStep?.instruction}
                </p>

                {/* Chef Tip */}
                {currentStep?.chefTip && (
                  <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-800/60 border border-emerald-700/60 text-emerald-100 text-sm">
                    <Lightbulb className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-200">Chef's Secret: </span>
                      {currentStep.chefTip}
                    </div>
                  </div>
                )}

                {/* Step Timer Trigger */}
                {currentStep?.durationMinutes && currentStep.durationMinutes > 0 && (
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onStartTimer(
                          currentStep.durationMinutes!,
                          `${recipe.title} - Step ${activeStepIndex + 1}`
                        )
                      }
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      <Timer className="w-4 h-4" />
                      <span>Start {currentStep.durationMinutes} Min Step Timer</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cook Mode Navigation Controls */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => {
                    setActiveStepIndex((prev) => Math.max(0, prev - 1));
                    if (isSpeaking) window.speechSynthesis.cancel();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-800 font-semibold text-sm shadow-xs hover:bg-stone-50 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                {/* Progress bar */}
                <div className="flex items-center gap-1.5">
                  {recipe.instructions.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`h-2 rounded-full cursor-pointer transition-all ${
                        idx === activeStepIndex
                          ? 'w-8 bg-emerald-600'
                          : idx < activeStepIndex
                          ? 'w-3 bg-emerald-300'
                          : 'w-3 bg-stone-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={activeStepIndex === recipe.instructions.length - 1}
                  onClick={() => {
                    setActiveStepIndex((prev) => Math.min(recipe.instructions.length - 1, prev + 1));
                    if (isSpeaking) window.speechSynthesis.cancel();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm shadow-xs hover:bg-emerald-700 disabled:opacity-40 transition-all"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ============ STANDARD OVERVIEW VIEW ============ */
            <>
              {/* Hero Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5 relative rounded-3xl overflow-hidden aspect-4/3 sm:aspect-square bg-stone-100 shadow-md">
                  <img
                    src={resolveAccurateRecipeImage(recipe.title, recipe.category, recipe.imageUrl)}
                    alt={recipe.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getCategoryFallbackImage(recipe.category, recipe.title);
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {recipe.youtubeUrl && (
                    <a
                      href={recipe.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      <span>Watch Video</span>
                    </a>
                  )}
                </div>

                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 leading-tight">
                      {recipe.title}
                    </h1>
                    <p className="mt-2 text-stone-600 text-sm leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-center">
                      <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <span className="block text-[11px] text-stone-400 font-medium">Prep Time</span>
                      <span className="font-bold text-stone-900 text-sm">{recipe.prepTimeMinutes}m</span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-center">
                      <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <span className="block text-[11px] text-stone-400 font-medium">Cook Time</span>
                      <span className="font-bold text-stone-900 text-sm">{recipe.cookTimeMinutes}m</span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-center">
                      <ChefHat className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <span className="block text-[11px] text-stone-400 font-medium">Difficulty</span>
                      <span className="font-bold text-stone-900 text-sm">{recipe.difficulty}</span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-center">
                      <Users className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                      <span className="block text-[11px] text-stone-400 font-medium">Servings</span>
                      <span className="font-bold text-stone-900 text-sm">
                        {recipe.servings * servingMultiplier}
                      </span>
                    </div>
                  </div>

                  {/* Chef advice quote */}
                  {recipe.chefAdvice && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Chef's Secret: </strong>
                        {recipe.chefAdvice}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ============ INGREDIENTS SECTION ============ */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <span>Ingredients</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {recipe.ingredients.length} items
                      </span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Check off ingredients as you prepare your kitchen
                    </p>
                  </div>

                  {/* Servings Multiplier Buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-100 p-1 rounded-xl">
                    <span className="text-xs font-semibold text-stone-500 px-2">Scale:</span>
                    {[1, 2, 3].map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => setServingMultiplier(mult)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                          servingMultiplier === mult
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {mult}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recipe.ingredients.map((ing, idx) => {
                    const isChecked = !!checkedIngredients[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleIngredientCheck(idx)}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-200 text-stone-400 line-through'
                            : 'bg-stone-50/60 border-stone-200/60 hover:bg-stone-100/80 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-emerald-600 text-white'
                                : 'border border-stone-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-3" />}
                          </div>
                          <span className="text-sm font-medium">{ing.name}</span>
                        </div>

                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-md">
                          {scaleAmount(ing.amount, servingMultiplier)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Substitutions & Extras if available */}
                {recipe.substitutions && recipe.substitutions.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-stone-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                      Smart Ingredient Swaps
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recipe.substitutions.map((sub, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs"
                        >
                          <span className="font-bold text-stone-900">{sub.original}</span>
                          <span className="text-stone-400"> → </span>
                          <span className="font-semibold text-emerald-700">{sub.substitute}</span>
                          <p className="mt-1 text-stone-500 italic">{sub.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ============ INSTRUCTIONS SECTION ============ */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900">
                    Cooking Instructions ({recipe.instructions.length} steps)
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsCookMode(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>Full-Screen Cook Mode</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {recipe.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 hover:bg-stone-50 transition-colors"
                    >
                      <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.stepNumber || idx + 1}
                      </span>
                      <div className="flex-1 space-y-2">
                        {step.title && (
                          <h4 className="font-bold text-stone-900 text-sm">{step.title}</h4>
                        )}
                        <p className="text-stone-700 text-sm leading-relaxed">
                          {step.instruction}
                        </p>

                        {step.chefTip && (
                          <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                            <strong>Tip: </strong> {step.chefTip}
                          </p>
                        )}

                        {step.durationMinutes && step.durationMinutes > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              onStartTimer(
                                step.durationMinutes!,
                                `${recipe.title} - Step ${idx + 1}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                          >
                            <Timer className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Start {step.durationMinutes} Min Step Timer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ============ ASK AI CHEF WIDGET ============ */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50 rounded-3xl p-6 border border-emerald-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Ask Chef Marco (AI Assistant)</h3>
                    <p className="text-xs text-stone-500">
                      Need a substitution, temperature guidance, or pairing recommendation?
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAskChef} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chefQuestion}
                    onChange={(e) => setChefQuestion(e.target.value)}
                    placeholder="e.g. Can I bake this instead of frying, and at what temperature?"
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isAskingChef || !chefQuestion.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    {isAskingChef ? (
                      <span className="animate-pulse">Thinking...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Ask</span>
                      </>
                    )}
                  </button>
                </form>

                {chefAnswer && (
                  <div className="mt-4 p-4 rounded-2xl bg-white border border-emerald-200 text-sm text-stone-800 shadow-xs animate-fade-in">
                    <p className="font-bold text-emerald-800 text-xs uppercase tracking-wider mb-1">
                      Chef Marco says:
                    </p>
                    <p className="leading-relaxed">{chefAnswer}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
