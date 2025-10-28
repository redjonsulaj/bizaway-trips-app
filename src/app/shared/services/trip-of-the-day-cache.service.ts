import { Injectable, inject } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Trip } from '../models';

interface CachedTripOfTheDay {
  trip: Trip;
  date: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Service for managing Trip of the Day cache
 * Uses IndexedDB to persist data across sessions
 */
@Injectable({
  providedIn: 'root',
})
export class TripOfTheDayCacheService {
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly cacheKey = 'trip-of-the-day';

  /**
   * Get current date in YYYY-MM-DD format
   */
  private getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get cached trip of the day if it exists and date matches
   * Returns null if cache is invalid or doesn't exist
   */
  async getCachedTrip(): Promise<Trip | null> {
    try {
      const cached = await this.indexedDbService.get<CachedTripOfTheDay>(
        this.cacheKey
      );

      if (!cached) {
        return null;
      }

      const currentDate = this.getCurrentDate();

      // Check if cached date matches current date
      if (cached.date === currentDate) {
        console.log('Using cached trip of the day from IndexedDB');
        return cached.trip;
      } else {
        console.log('Cached trip of the day is outdated, will fetch new one');
        // Date doesn't match, delete old cache
        await this.indexedDbService.delete(this.cacheKey);
        return null;
      }
    } catch (error) {
      console.error('Error reading trip of the day from cache:', error);
      return null;
    }
  }

  /**
   * Cache trip of the day with current date
   */
  async cacheTrip(trip: Trip): Promise<void> {
    try {
      const currentDate = this.getCurrentDate();
      const cacheData: CachedTripOfTheDay = {
        trip,
        date: currentDate,
      };

      await this.indexedDbService.set(this.cacheKey, cacheData);
      console.log('Trip of the day cached successfully');
    } catch (error) {
      console.error('Error caching trip of the day:', error);
      throw error;
    }
  }

  /**
   * Clear cached trip of the day
   */
  async clearCache(): Promise<void> {
    try {
      await this.indexedDbService.delete(this.cacheKey);
      console.log('Trip of the day cache cleared');
    } catch (error) {
      console.error('Error clearing trip of the day cache:', error);
      throw error;
    }
  }

  /**
   * Check if cached trip exists and is valid for today
   */
  async hasCachedTrip(): Promise<boolean> {
    const trip = await this.getCachedTrip();
    return trip !== null;
  }
}
