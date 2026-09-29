import type { StoreBranch, ShoppingItem, ComparisonResult } from '@/types';

export class StoreService {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Filter stores by city
   */
  static filterByCity(branches: StoreBranch[], city: string): StoreBranch[] {
    return branches.filter((branch) => branch.city.toLowerCase() === city.toLowerCase());
  }

  /**
   * Filter stores by distance
   */
  static filterByDistance(
    branches: StoreBranch[],
    userLat: number,
    userLon: number,
    maxDistanceKm: number
  ): StoreBranch[] {
    return branches.filter(
      (branch) => this.calculateDistance(userLat, userLon, branch.latitude, branch.longitude) <= maxDistanceKm
    );
  }

  /**
   * Group branches by store name
   */
  static groupByStoreName(branches: StoreBranch[]): Map<string, StoreBranch[]> {
    const grouped = new Map<string, StoreBranch[]>();
    branches.forEach((branch) => {
      if (!grouped.has(branch.storeName)) {
        grouped.set(branch.storeName, []);
      }
      grouped.get(branch.storeName)!.push(branch);
    });
    return grouped;
  }

  /**
   * Sort branches by distance
   */
  static sortByDistance(
    branches: StoreBranch[],
    userLat: number,
    userLon: number
  ): StoreBranch[] {
    return [...branches].sort((a, b) => {
      const distA = this.calculateDistance(userLat, userLon, a.latitude, a.longitude);
      const distB = this.calculateDistance(userLat, userLon, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  /**
   * Compare shopping list prices across stores
   */
  static compareCartPrices(
    cart: ShoppingItem[],
    storePrice: Map<string, number> // productId -> price mapping
  ): { totalPrice: number; discountedPrice: number } {
    let totalPrice = 0;
    let discountedPrice = 0;

    cart.forEach((item) => {
      const price = storePrice.get(item.productId || item.name) || item.price;
      totalPrice += price * item.quantity;
      const withDiscount = item.discount ? price * (1 - item.discount / 100) : price;
      discountedPrice += withDiscount * item.quantity;
    });

    return { totalPrice, discountedPrice };
  }

  /**
   * Find best store for cart
   */
  static findBestStore(
    cart: ShoppingItem[],
    branches: StoreBranch[],
    storePrices: Map<string, Map<string, number>>, // storeName -> productId -> price
    userLat: number,
    userLon: number
  ): ComparisonResult | null {
    let bestResult: ComparisonResult | null = null;
    let bestValue = Infinity;

    branches.forEach((branch) => {
      const priceMap = storePrices.get(branch.storeName) || new Map();
      const { totalPrice, discountedPrice } = this.compareCartPrices(cart, priceMap);
      const distance = this.calculateDistance(userLat, userLon, branch.latitude, branch.longitude);

      // Consider price + distance as value metric
      const value = discountedPrice + distance * 50; // 50 per km

      if (value < bestValue) {
        bestValue = value;
        bestResult = {
          storeBranch: branch,
          totalPrice,
          discountedPrice,
          distance,
          availableItems: cart.length,
          missingItems: [],
          suggestedReplacements: new Map(),
        };
      }
    });

    return bestResult;
  }
}
