import 'package:flutter/material.dart';
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
    // Material 3 Cream & Fresh Emerald Green Theme
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
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFFAF8F5),
          surfaceTintColor: Colors.transparent,
          elevation: 0,
        ),
        cardTheme: CardTheme(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFFE7E5E4)),
          ),
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
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.restaurant_menu, color: Colors.white, size: 24),
                    ),
                    if (isDesktop) ...[
                      const SizedBox(width: 10),
                      Text(
                        'RecipeHub',
                        style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.w800,
                          fontSize: 18,
                          color: const Color(0xFF1C1917),
                        ),
                      ),
                    ]
                  ],
                ),
              ),
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: Text('Home')),
                NavigationRailDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: Text('Explore')),
                NavigationRailDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome), label: Text('AI Chef')),
                NavigationRailDestination(icon: Icon(Icons.favorite_outline), selectedIcon: Icon(Icons.favorite), label: Text('Favourites')),
                NavigationRailDestination(icon: Icon(Icons.book_outlined), selectedIcon: Icon(Icons.book), label: Text('My Recipes')),
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
        backgroundColor: Colors.white,
        elevation: 3,
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
}
