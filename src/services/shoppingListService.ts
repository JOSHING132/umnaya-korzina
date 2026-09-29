import type { ShoppingItem, Ingredient, PantryItem } from '@/types';

export class ShoppingListService {
  /**
   * Generate shopping list from ingredients, deducting pantry items
   */
  static generateFromIngredients(
    ingredients: Ingredient[],
    pantry: PantryItem[]
  ): ShoppingItem[] {
    const pantryMap = new Map<string, PantryItem>();
    pantry.forEach((item) => {
      pantryMap.set(item.name.toLowerCase(), item);
    });

    return ingredients
      .map((ingredient) => {
        const pantryItem = pantryMap.get(ingredient.name.toLowerCase());
        let quantityNeeded = ingredient.quantity;

        if (pantryItem && pantryItem.unit === ingredient.unit) {
          quantityNeeded = Math.max(0, ingredient.quantity - pantryItem.quantity);
        }

        return {
          id: `item-${Date.now()}-${Math.random()}`,
          name: ingredient.name,
          category: 'Неизвестно',
          quantity: quantityNeeded,
          unit: ingredient.unit,
          bought: false,
          price: 0,
          store: '',
        };
      })
      .filter((item) => item.quantity > 0);
  }

  /**
   * Calculate total price for shopping list
   */
  static calculateTotal(items: ShoppingItem[]): number {
    return items.reduce((sum, item) => {
      const basePrice = item.price * item.quantity;
      const discountedPrice = item.discount ? basePrice * (1 - item.discount / 100) : basePrice;
      return sum + discountedPrice;
    }, 0);
  }

  /**
   * Calculate savings from discounts
   */
  static calculateSavings(items: ShoppingItem[]): number {
    return items.reduce((sum, item) => {
      if (item.discount) {
        return sum + item.price * item.quantity * (item.discount / 100);
      }
      return sum;
    }, 0);
  }

  /**
   * Group items by store
   */
  static groupByStore(items: ShoppingItem[]): Map<string, ShoppingItem[]> {
    const grouped = new Map<string, ShoppingItem[]>();
    items.forEach((item) => {
      const store = item.store || 'Неизвестно';
      if (!grouped.has(store)) {
        grouped.set(store, []);
      }
      grouped.get(store)!.push(item);
    });
    return grouped;
  }

  /**
   * Group items by category
   */
  static groupByCategory(items: ShoppingItem[]): Map<string, ShoppingItem[]> {
    const grouped = new Map<string, ShoppingItem[]>();
    items.forEach((item) => {
      const category = item.category || 'Другое';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });
    return grouped;
  }

  /**
   * Mark item as bought/unbought
   */
  static toggleItemBought(items: ShoppingItem[], itemId: string): ShoppingItem[] {
    return items.map((item) => (item.id === itemId ? { ...item, bought: !item.bought } : item));
  }

  /**
   * Remove item from list
   */
  static removeItem(items: ShoppingItem[], itemId: string): ShoppingItem[] {
    return items.filter((item) => item.id !== itemId);
  }

  /**
   * Add custom item to list
   */
  static addCustomItem(
    items: ShoppingItem[],
    name: string,
    quantity: number = 1,
    unit: string = 'шт.'
  ): ShoppingItem[] {
    const newItem: ShoppingItem = {
      id: `custom-${Date.now()}`,
      name,
      category: 'Другое',
      quantity,
      unit,
      bought: false,
      price: 0,
      store: '',
    };
    return [...items, newItem];
  }
}
