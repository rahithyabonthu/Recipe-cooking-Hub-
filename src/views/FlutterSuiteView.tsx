import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Globe,
  Layers,
  Terminal,
  FileCode,
  Sparkles,
  Download,
} from 'lucide-react';

const FLUTTER_FILES: Record<string, { filename: string; path: string; language: string; code: string }> = {
  'pubspec': {
    filename: 'pubspec.yaml',
    path: 'pubspec.yaml',
    language: 'yaml',
    code: `name: recipehub
description: "AI-Powered Multiplatform Recipe Application using Flutter and Dart supporting Android, iOS, Web, Windows, macOS, and Linux."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  http: ^1.2.0
  provider: ^6.1.1
  google_generative_ai: ^0.4.0
  shared_preferences: ^2.2.2
  cached_network_image: ^3.3.1
  google_fonts: ^6.1.0
  audioplayers: ^5.2.1
  flutter_staggered_grid_view: ^0.7.0
  intl: ^0.19.0
  uuid: ^4.3.3
  lucide_icons: ^0.257.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`,
  },
  'main': {
    filename: 'main.dart',
    path: 'lib/main.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/recipe_provider.dart';
import 'providers/timer_provider.dart';
import 'views/home_screen.dart';
import 'views/explore_screen.dart';
import 'views/ai_generator_screen.dart';
import 'views/favourites_screen.dart';
import 'views/my_recipes_screen.dart';
import 'views/cooking_timer_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => RecipeProvider()..initialize()),
        ChangeNotifierProvider(create: (_) => TimerProvider()),
      ],
      child: const RecipeHubApp(),
    ),
  );
}

class RecipeHubApp extends StatelessWidget {
  const RecipeHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Material 3 Cream & Fresh Emerald Green Scheme
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF10B981),
      brightness: Brightness.light,
      surface: const Color(0xFFFAF8F5),
      surfaceContainer: const Color(0xFFF3EFEA),
      primary: const Color(0xFF059669),
      onPrimary: Colors.white,
      secondary: const Color(0xFFD97706),
    );

    return MaterialApp(
      title: 'RecipeHub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
        scaffoldBackgroundColor: const Color(0xFFFAF8F5),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          Theme.of(context).textTheme,
        ),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    ExploreScreen(),
    AiGeneratorScreen(),
    FavouritesScreen(),
    MyRecipesScreen(),
    CookingTimerScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 1024;
    final isTablet = MediaQuery.of(context).size.width >= 700 && !isDesktop;

    // Desktop & Tablet Navigation Rail
    if (isDesktop || isTablet) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: _currentIndex,
              onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
              labelType: NavigationRailLabelType.all,
              leading: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20.0),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.restaurant_menu, color: Colors.white, size: 24),
                ),
              ),
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: Text('Home')),
                NavigationRailDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: Text('Explore')),
                NavigationRailDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome), label: Text('AI Chef')),
                NavigationRailDestination(icon: Icon(Icons.favorite_outline), selectedIcon: Icon(Icons.favorite), label: Text('Saved')),
                NavigationRailDestination(icon: Icon(Icons.book_outlined), selectedIcon: Icon(Icons.book), label: Text('Mine')),
                NavigationRailDestination(icon: Icon(Icons.timer_outlined), selectedIcon: Icon(Icons.timer), label: Text('Timer')),
              ],
            ),
            const VerticalDivider(thickness: 1, width: 1, color: Color(0xFFE7E5E4)),
            Expanded(child: _screens[_currentIndex]),
          ],
        ),
      );
    }

    // Mobile Bottom Navigation Bar
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome), label: 'AI Chef'),
          NavigationDestination(icon: Icon(Icons.favorite_outline), selectedIcon: Icon(Icons.favorite), label: 'Saved'),
          NavigationDestination(icon: Icon(Icons.book_outlined), selectedIcon: Icon(Icons.book), label: 'Mine'),
          NavigationDestination(icon: Icon(Icons.timer_outlined), selectedIcon: Icon(Icons.timer), label: 'Timer'),
        ],
      ),
    );
  }
}`,
  },
  'models': {
    filename: 'recipe.dart',
    path: 'lib/models/recipe.dart',
    language: 'dart',
    code: `class RecipeIngredient {
  final String name;
  final String amount;
  final bool isFromUser;
  final bool isPantryStaple;

  RecipeIngredient({
    required this.name,
    required this.amount,
    this.isFromUser = false,
    this.isPantryStaple = false,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'amount': amount,
    'isFromUser': isFromUser,
    'isPantryStaple': isPantryStaple,
  };

  factory RecipeIngredient.fromJson(Map<String, dynamic> json) => RecipeIngredient(
    name: json['name'] ?? '',
    amount: json['amount'] ?? '',
    isFromUser: json['isFromUser'] ?? false,
    isPantryStaple: json['isPantryStaple'] ?? false,
  );
}

class RecipeInstruction {
  final int stepNumber;
  final String title;
  final String instruction;
  final int? durationMinutes;
  final bool timerRecommended;
  final String? chefTip;

  RecipeInstruction({
    required this.stepNumber,
    required this.title,
    required this.instruction,
    this.durationMinutes,
    this.timerRecommended = false,
    this.chefTip,
  });

  Map<String, dynamic> toJson() => {
    'stepNumber': stepNumber,
    'title': title,
    'instruction': instruction,
    'durationMinutes': durationMinutes,
    'timerRecommended': timerRecommended,
    'chefTip': chefTip,
  };

  factory RecipeInstruction.fromJson(Map<String, dynamic> json) => RecipeInstruction(
    stepNumber: json['stepNumber'] ?? 1,
    title: json['title'] ?? '',
    instruction: json['instruction'] ?? '',
    durationMinutes: json['durationMinutes'],
    timerRecommended: json['timerRecommended'] ?? false,
    chefTip: json['chefTip'],
  );
}

class Recipe {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final String category;
  final String cuisine;
  final String difficulty;
  final int prepTimeMinutes;
  final int cookTimeMinutes;
  final int servings;
  final int calories;
  final List<RecipeIngredient> ingredients;
  final List<RecipeInstruction> instructions;
  final String source; // 'themealdb' | 'ai' | 'personal'

  Recipe({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.category,
    required this.cuisine,
    required this.difficulty,
    required this.prepTimeMinutes,
    required this.cookTimeMinutes,
    required this.servings,
    this.calories = 450,
    required this.ingredients,
    required this.instructions,
    required this.source,
  });
}`,
  },
  'api': {
    filename: 'meal_api_service.dart',
    path: 'lib/services/meal_api_service.dart',
    language: 'dart',
    code: `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/recipe.dart';

class MealApiService {
  static const String baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  Future<List<Recipe>> searchRecipes(String query) async {
    final response = await http.get(Uri.parse('$baseUrl/search.php?s=$query'));
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List? meals = data['meals'];
      if (meals == null) return [];
      return meals.map((m) => _parseMeal(m)).toList();
    }
    return [];
  }

  Future<Recipe?> getRandomRecipe() async {
    final response = await http.get(Uri.parse('$baseUrl/random.php'));
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List? meals = data['meals'];
      if (meals != null && meals.isNotEmpty) {
        return _parseMeal(meals.first);
      }
    }
    return null;
  }

  Recipe _parseMeal(Map<String, dynamic> raw) {
    List<RecipeIngredient> ingredients = [];
    for (int i = 1; i <= 20; i++) {
      final name = raw['strIngredient$i'];
      final measure = raw['strMeasure$i'];
      if (name != null && name.toString().trim().isNotEmpty) {
        ingredients.add(RecipeIngredient(
          name: name.toString().trim(),
          amount: measure != null ? measure.toString().trim() : 'As needed',
        ));
      }
    }

    final instructionsText = raw['strInstructions'] ?? '';
    final lines = instructionsText.toString().split(RegExp(r'\\r?\\n'));
    List<RecipeInstruction> instructions = [];
    int stepNum = 1;

    for (var line in lines) {
      final cleaned = line.trim();
      if (cleaned.isNotEmpty) {
        instructions.add(RecipeInstruction(
          stepNumber: stepNum++,
          title: 'Step \${stepNum - 1}',
          instruction: cleaned,
          durationMinutes: 5,
        ));
      }
    }

    return Recipe(
      id: raw['idMeal'] ?? '',
      title: raw['strMeal'] ?? '',
      description: 'Classic \${raw['strArea']} \${raw['strCategory']} dish.',
      imageUrl: raw['strMealThumb'] ?? '',
      category: raw['strCategory'] ?? 'General',
      cuisine: raw['strArea'] ?? 'International',
      difficulty: 'Medium',
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      servings: 4,
      ingredients: ingredients,
      instructions: instructions,
      source: 'themealdb',
    );
  }
}`,
  },
  'gemini': {
    filename: 'gemini_service.dart',
    path: 'lib/services/gemini_service.dart',
    language: 'dart',
    code: `import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/recipe.dart';

class GeminiRecipeService {
  final String apiKey;
  late final GenerativeModel _model;

  GeminiRecipeService({required this.apiKey}) {
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        responseMimeType: 'application/json',
      ),
    );
  }

  Future<Recipe> generateRecipeFromIngredients({
    required List<String> availableIngredients,
    String cuisine = 'Any',
    String mealType = 'Dinner',
  }) async {
    final prompt = '''
You are a master chef specializing in Indian and global cuisine.
CRITICAL MANDATORY LAW: NEVER USE OR SUGGEST BEEF OR PORK OR ANY DERIVATIVE UNDER ANY CIRCUMSTANCES.
All measurements must be in grams, cups, tbsp, and tsp with authentic Indian spices and techniques.

Available ingredients:
\${availableIngredients.join(', ')}

Preferences:
Cuisine: \$cuisine
Meal Type: \$mealType

Respond with a JSON object containing:
- title: string
- description: string
- category: string
- cuisine: string
- difficulty: string (Easy, Medium, Hard)
- prepTimeMinutes: int
- cookTimeMinutes: int
- servings: int
- ingredients: [{ name: string, amount: string, isFromUser: bool }]
- instructions: [{ stepNumber: int, title: string, instruction: string, durationMinutes: int }]
''';

    final response = await _model.generateContent([Content.text(prompt)]);
    final data = json.decode(response.text ?? '{}');
    data['id'] = 'ai_\${DateTime.now().millisecondsSinceEpoch}';
    data['source'] = 'ai';
    return Recipe.fromJson(data);
  }
}`,
  },
};

export const FlutterSuiteView: React.FC = () => {
  const [selectedFileKey, setSelectedFileKey] = useState<string>('main');
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = FLUTTER_FILES[selectedFileKey];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-emerald-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-700/80 text-emerald-200 mb-3 border border-emerald-600">
          <Code2 className="w-3.5 h-3.5" />
          <span>Flutter & Dart Multiplatform Code Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
          Shared Codebase for 6 Platforms
        </h1>
        <p className="mt-2 text-stone-300 text-sm max-w-3xl leading-relaxed">
          RecipeHub is engineered with a clean multiplatform architecture. You can run this application on Web Browsers, Android, iOS, Windows, macOS, and Linux using a single shared Flutter/Dart codebase!
        </p>

        {/* Supported Platforms Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/10 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md">
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
            <span>Android (APK / Bundle)</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md">
            <Smartphone className="w-3.5 h-3.5 text-teal-300" />
            <span>iOS (iPhone / iPad)</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-sky-300" />
            <span>Web Browsers</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md">
            <Monitor className="w-3.5 h-3.5 text-amber-300" />
            <span>Windows Desktop</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md">
            <Monitor className="w-3.5 h-3.5 text-purple-300" />
            <span>macOS Desktop</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md">
            <Monitor className="w-3.5 h-3.5 text-rose-300" />
            <span>Linux Desktop</span>
          </span>
        </div>
      </div>

      {/* Clean Architecture Diagram */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold font-display text-stone-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span>Clean Multiplatform Layer Architecture</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px]">Layer 1</span>
            <h4 className="font-bold text-stone-900 text-sm">Presentation Layer</h4>
            <p className="text-stone-500">
              Material 3 UI widgets, responsive navigation (NavigationRail for Desktop, NavigationBar for Mobile).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-teal-700 uppercase tracking-wider text-[10px]">Layer 2</span>
            <h4 className="font-bold text-stone-900 text-sm">Business Logic Layer</h4>
            <p className="text-stone-500">
              Provider state managers (`RecipeProvider`, `TimerProvider`) handling reactive state and audio timers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px]">Layer 3</span>
            <h4 className="font-bold text-stone-900 text-sm">Services & External APIs</h4>
            <p className="text-stone-500">
              TheMealDB API service, Google Gemini AI (`google_generative_ai`), and Web Audio synthesis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-purple-700 uppercase tracking-wider text-[10px]">Layer 4</span>
            <h4 className="font-bold text-stone-900 text-sm">Data & Persistence</h4>
            <p className="text-stone-500">
              `SharedPreferences` & Cloud Firestore for persistent favourites and personal recipes across sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
        {/* Tab Selector Bar */}
        <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {Object.entries(FLUTTER_FILES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setSelectedFileKey(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedFileKey === key
                    ? 'bg-emerald-600 text-white'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{item.filename}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy File Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-x-auto max-h-[500px] text-xs font-mono text-emerald-300 leading-relaxed bg-stone-900/90 selection:bg-emerald-800">
          <pre>{activeFile.code}</pre>
        </div>
      </div>

      {/* Commands to run on each platform */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>Quick Run Commands for Flutter Multiplatform</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 text-[10px] block font-sans">Run on Web</span>
            <code className="text-emerald-800 font-bold">flutter run -d chrome</code>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 text-[10px] block font-sans">Run on Android</span>
            <code className="text-emerald-800 font-bold">flutter run -d android</code>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 text-[10px] block font-sans">Run on iOS</span>
            <code className="text-emerald-800 font-bold">flutter run -d ios</code>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 text-[10px] block font-sans">Run on Windows Desktop</span>
            <code className="text-emerald-800 font-bold">flutter run -d windows</code>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 text-[10px] block font-sans">Run on macOS Desktop</span>
            <code className="text-emerald-800 font-bold">flutter run -d macos</code>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 text-[10px] block font-sans">Run on Linux Desktop</span>
            <code className="text-emerald-800 font-bold">flutter run -d linux</code>
          </div>
        </div>
      </div>
    </div>
  );
};
