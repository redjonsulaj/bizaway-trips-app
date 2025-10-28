import { Injectable, inject } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { Trip } from '../models';

interface CachedTrip {
  trip: Trip;
  timestamp: number;
}

interface TripCacheData {
  cache: Map<string, CachedTrip>;
  accessOrder: string[]; // LRU order, most recent at the end
}

/**
 * Service for managing Trip Detail cache with LRU eviction
 * Caches the last 5 accessed trip details
 */
@Injectable({
  providedIn: 'root',
})
export class TripDetailCacheService {
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly cacheKey = 'trip-details-cache';
  private readonly maxCacheSize = 50;
  private memoryCache: Map<string, CachedTrip> = new Map();
  private accessOrder: string[] = [];

  constructor() {
    this.loadCacheFromDb();
  }

  /**
   * Load cache from IndexedDB into memory on service initialization
   */
  private async loadCacheFromDb(): Promise<void> {
    try {
      const cached = await this.indexedDbService.get<TripCacheData>(this.cacheKey);

      if (cached) {
        // Convert plain object back to Map
        this.memoryCache = new Map(Object.entries(cached.cache || {}));
        this.accessOrder = cached.accessOrder || [];
        console.log('Trip cache loaded from IndexedDB:', this.accessOrder);
      }
    } catch (error) {
      console.error('Error loading trip cache from IndexedDB:', error);
    }
  }

  /**
   * Save current cache state to IndexedDB
   */
  private async saveCacheToDb(): Promise<void> {
    try {
      const cacheData: TripCacheData = {
        cache: Object.fromEntries(this.memoryCache) as any,
        accessOrder: this.accessOrder,
      };

      await this.indexedDbService.set(this.cacheKey, cacheData);
    } catch (error) {
      console.error('Error saving trip cache to IndexedDB:', error);
    }
  }

  /**
   * Get cached trip by ID
   * Updates LRU order when accessed
   */
  async getCachedTrip(id: string): Promise<Trip | null> {
    const cached = this.memoryCache.get(id);

    if (cached) {
      // Update access order (move to end = most recently used)
      this.accessOrder = this.accessOrder.filter(cachedId => cachedId !== id);
      this.accessOrder.push(id);
      await this.saveCacheToDb();

      console.log(`Trip ${id} found in cache`);
      return cached.trip;
    }

    console.log(`Trip ${id} not found in cache`);
    return null;
  }

  /**
   * Cache a trip with LRU eviction
   */
  async cacheTrip(trip: Trip): Promise<void> {
    try {
      const tripId = trip.id;

      // If already in cache, update it
      if (this.memoryCache.has(tripId)) {
        this.memoryCache.set(tripId, {
          trip,
          timestamp: Date.now(),
        });

        // Update access order
        this.accessOrder = this.accessOrder.filter(id => id !== tripId);
        this.accessOrder.push(tripId);
      } else {
        // Check if cache is full
        if (this.accessOrder.length >= this.maxCacheSize) {
          // Remove least recently used (first in order)
          const lruId = this.accessOrder.shift();
          if (lruId) {
            this.memoryCache.delete(lruId);
            console.log(`Evicted trip ${lruId} from cache (LRU)`);
          }
        }

        // Add new trip
        this.memoryCache.set(tripId, {
          trip,
          timestamp: Date.now(),
        });
        this.accessOrder.push(tripId);
      }

      await this.saveCacheToDb();
      console.log(`Trip ${tripId} cached. Current cache order:`, this.accessOrder);
    } catch (error) {
      console.error('Error caching trip:', error);
    }
  }

  /**
   * Check if a trip is cached
   */
  hasCachedTrip(id: string): boolean {
    return this.memoryCache.has(id);
  }

  /**
   * Clear all cached trips
   */
  async clearCache(): Promise<void> {
    try {
      this.memoryCache.clear();
      this.accessOrder = [];
      await this.indexedDbService.delete(this.cacheKey);
      console.log('Trip cache cleared');
    } catch (error) {
      console.error('Error clearing trip cache:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; order: string[] } {
    return {
      size: this.memoryCache.size,
      order: [...this.accessOrder],
    };
  }
}
