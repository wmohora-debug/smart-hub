import { DashboardRepository } from "@/repositories/dashboard.repository";
import { RestaurantRepository } from "@/repositories/restaurant.repository";

export class DashboardService {
  static async getStats(restaurantId?: string) {
    let restaurantName = "All Restaurants";
    if (restaurantId) {
      const restaurant = await RestaurantRepository.findById(restaurantId);
      if (restaurant) {
        restaurantName = restaurant.name;
      }
    }

    const counts = await DashboardRepository.getDashboardCounts(restaurantId);

    return {
      restaurantName,
      ...counts,
    };
  }
}
