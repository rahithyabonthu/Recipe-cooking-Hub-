class RecipeIngredient {
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
  final String? chefAdvice;

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
    this.chefAdvice,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'imageUrl': imageUrl,
    'category': category,
    'cuisine': cuisine,
    'difficulty': difficulty,
    'prepTimeMinutes': prepTimeMinutes,
    'cookTimeMinutes': cookTimeMinutes,
    'servings': servings,
    'calories': calories,
    'ingredients': ingredients.map((i) => i.toJson()).toList(),
    'instructions': instructions.map((i) => i.toJson()).toList(),
    'source': source,
    'chefAdvice': chefAdvice,
  };

  factory Recipe.fromJson(Map<String, dynamic> json) => Recipe(
    id: json['id'] ?? '',
    title: json['title'] ?? '',
    description: json['description'] ?? '',
    imageUrl: json['imageUrl'] ?? '',
    category: json['category'] ?? 'General',
    cuisine: json['cuisine'] ?? 'International',
    difficulty: json['difficulty'] ?? 'Medium',
    prepTimeMinutes: json['prepTimeMinutes'] ?? 15,
    cookTimeMinutes: json['cookTimeMinutes'] ?? 30,
    servings: json['servings'] ?? 4,
    calories: json['calories'] ?? 450,
    ingredients: (json['ingredients'] as List? ?? [])
        .map((i) => RecipeIngredient.fromJson(i))
        .toList(),
    instructions: (json['instructions'] as List? ?? [])
        .map((i) => RecipeInstruction.fromJson(i))
        .toList(),
    source: json['source'] ?? 'themealdb',
    chefAdvice: json['chefAdvice'],
  );
}
