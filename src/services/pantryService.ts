import type { PantryItem, Product } from '@/types';

export class PantryService {
  /**
   * Add or update pantry item
   */
  static addOrUpdate(
    pantry: PantryItem[],
    product: Product,
    quantity: number,
    unit: string
  ): PantryItem[] {
    const existingIndex = pantry.findIndex((item) => item.productId === product.id);

    if (existingIndex >= 0) {
      const updated = [...pantry];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
      return updated;
    }

    const newItem: PantryItem = {
      id: `pantry-${Date.now()}`,
      productId: product.id,
      name: product.name,
      quantity,
      unit,
    };

    return [...pantry, newItem];
  }

  /**
   * Remove item from pantry
   */
  static removeItem(pantry: PantryItem[], itemId: string): PantryItem[] {
    return pantry.filter((item) => item.id !== itemId);
  }

  /**
   * Update item quantity
   */
  static updateQuantity(pantry: PantryItem[], itemId: string, quantity: number): PantryItem[] {
    return pantry.map((item) =>
      item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
    );
  }

  /**
   * Check if item is in pantry
   */
  static hasItem(pantry: PantryItem[], itemName: string): boolean {
    return pantry.some((item) => item.name.toLowerCase() === itemName.toLowerCase());
  }

  /**
   * Get item by name
   */
  static getItem(pantry: PantryItem[], itemName: string): PantryItem | undefined {
    return pantry.find((item) => item.name.toLowerCase() === itemName.toLowerCase());
  }

  /**
   * Calculate pantry value
   */
  static calculateValue(pantry: PantryItem[], priceMap: Map<string, number>): number {
    return pantry.reduce((sum, item) => {
      const price = priceMap.get(item.productId) || 0;
      return sum + price * item.quantity;
    }, 0);
  }

  /**
   * Export pantry as formatted string
   */
  static exportAsText(pantry: PantryItem[]): string {
    return pantry.map((item) => `${item.name} — ${item.quantity} ${item.unit}`).join('\n');
  }
}
