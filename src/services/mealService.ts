import type { Meal, Recipe, Ingredient } from '@/types';

export class MealService {
  /**
   * Get all ingredients from meals
   */
  static getIngredientsFromMeals(meals: Meal[]): Ingredient[] {
    const ingredientMap = new Map<string, Ingredient>();

    meals.forEach((meal) => {
      meal.ingredients.forEach((ingredientName) => {
        if (ingredientMap.has(ingredientName)) {
          const existing = ingredientMap.get(ingredientName)!;
          existing.quantity += 1;
        } else {
          ingredientMap.set(ingredientName, {
            name: ingredientName,
            quantity: 1,
            unit: 'шт.',
          });
        }
      });
    });

    return Array.from(ingredientMap.values());
  }

  /**
   * Calculate total nutrition for meals
   */
  static calculateNutrition(meals: Meal[]) {
    return {
      calories: meals.reduce((sum, m) => sum + m.calories, 0),
      protein: meals.reduce((sum, m) => sum + m.protein, 0),
      fat: meals.reduce((sum, m) => sum + m.fat, 0),
      carbs: meals.reduce((sum, m) => sum + m.carbs, 0),
    };
  }

  /**
   * Calculate total cost
   */
  static calculateCost(meals: Meal[]): number {
    return meals.reduce((sum, m) => sum + m.cost, 0);
  }

  /**
   * Filter meals by type
   */
  static filterByType(meals: Meal[], type: string): Meal[] {
    return meals.filter((meal) => meal.type === type);
  }

  /**
   * Mark meal as done
   */
  static markAsDone(meals: Meal[], mealId: string): Meal[] {
    return meals.map((meal) => (meal.id === mealId ? { ...meal, done: true } : meal));
  }

  /**
   * Toggle favorite
   */
  static toggleFavorite(meals: Meal[], mealId: string): Meal[] {
    return meals.map((meal) => (meal.id === mealId ? { ...meal, favorite: !meal.favorite } : meal));
  }

  /**
   * Replace meal with random from same type
   */
  static replaceMeal(meals: Meal[], mealId: string, availableMeals: Meal[]): Meal[] {
    const mealToReplace = meals.find((m) => m.id === mealId);
    if (!mealToReplace) return meals;

    const sametype = availableMeals.filter((m) => m.type === mealToReplace.type);
    if (sametype.length === 0) return meals;

    const randomMeal = sametype[Math.floor(Math.random() * sametype.length)];

    return meals.map((meal) =>
      meal.id === mealId ? { ...randomMeal, id: mealId } : meal
    );
  }
}
