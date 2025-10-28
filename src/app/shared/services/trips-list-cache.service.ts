import { Injectable, inject } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { TripsApiResponse, TripsQueryParams } from '../models';

interface CachedTripsResponse {
  data: TripsApiResponse;
  timestamp: number;
  queryParams: TripsQueryParams;
}

interface TripsListCacheData {
  cache: Record<string, CachedTripsResponse>;
  accessOrder: string[]; // LRU order, most recent at the end
}

/**
 * Service for managing Trips List cache with LRU eviction and TTL
 * Caches the last 5 trips list API responses based on query parameters
 */
@Injectable({
  providedIn: 'root',
})
export class TripsListCacheService {
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly cacheKey = 'trips-list-cache';
  private readonly maxCacheSize = 20;
  private readonly defaultTtlSeconds = 180; // 180 seconds default TTL

  private memoryCache: Map<string, CachedTripsResponse> = new Map();
  private accessOrder: string[] = [];

  constructor() {
    this.loadCacheFromDb();
  }

  /**
   * Generate a unique cache key from query parameters
   */
  private generateCacheKey(params: TripsQueryParams): string {
    // Sort keys to ensure consistent cache keys for same params
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        const value = params[key as keyof TripsQueryParams];
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

    return JSON.stringify(sortedParams);
  }

  /**
   * Load cache from IndexedDB into memory on service initialization
   */
  private async loadCacheFromDb(): Promise<void> {
    try {
      const cached = await this.indexedDbService.get<TripsListCacheData>(this.cacheKey);

      if (cached) {
        // Convert plain object back to Map
        this.memoryCache = new Map(Object.entries(cached.cache || {}));
        this.accessOrder = cached.accessOrder || [];

        // Clean up expired entries
        this.removeExpiredEntries();

        console.log('Trips list cache loaded from IndexedDB:', this.accessOrder);
      }
    } catch (error) {
      console.error('Error loading trips list cache from IndexedDB:', error);
    }
  }

  /**
   * Save current cache state to IndexedDB
   */
  private async saveCacheToDb(): Promise<void> {
    try {
      const cacheData: TripsListCacheData = {
        cache: Object.fromEntries(this.memoryCache) as any,
        accessOrder: this.accessOrder,
      };

      await this.indexedDbService.set(this.cacheKey, cacheData);
    } catch (error) {
      console.error('Error saving trips list cache to IndexedDB:', error);
    }
  }

  /**
   * Remove expired entries from cache
   */
  private removeExpiredEntries(): void {
    const now = Date.now();
    const ttlMs = this.defaultTtlSeconds * 1000;

    const expiredKeys: string[] = [];

    this.memoryCache.forEach((cached, key) => {
      if (now - cached.timestamp > ttlMs) {
        expiredKeys.push(key);
      }
    });

    if (expiredKeys.length > 0) {
      expiredKeys.forEach(key => {
        this.memoryCache.delete(key);
        this.accessOrder = this.accessOrder.filter(k => k !== key);
      });

      console.log(`Removed ${expiredKeys.length} expired cache entries`);
      this.saveCacheToDb();
    }
  }

  /**
   * Check if cached data is still valid (not expired)
   */
  private isCacheValid(cached: CachedTripsResponse): boolean {
    const now = Date.now();
    const ttlMs = this.defaultTtlSeconds * 1000;
    return (now - cached.timestamp) <= ttlMs;
  }

  /**
   * Get cached trips response by query parameters
   * Returns null if not found or expired
   */
  async getCachedTrips(params: TripsQueryParams): Promise<TripsApiResponse | null> {
    // Clean up expired entries first
    this.removeExpiredEntries();

    const cacheKey = this.generateCacheKey(params);
    const cached = this.memoryCache.get(cacheKey);

    if (cached) {
      // Check if cache is still valid
      if (this.isCacheValid(cached)) {
        // Update access order (move to end = most recently used)
        this.accessOrder = this.accessOrder.filter(k => k !== cacheKey);
        this.accessOrder.push(cacheKey);
        await this.saveCacheToDb();

        const age = Math.floor((Date.now() - cached.timestamp) / 1000);
        console.log(`Trips list found in cache (age: ${age}s)`);
        return cached.data;
      } else {
        // Cache expired, remove it
        this.memoryCache.delete(cacheKey);
        this.accessOrder = this.accessOrder.filter(k => k !== cacheKey);
        console.log('Cached trips list expired, removing');
        await this.saveCacheToDb();
      }
    }

    console.log('Trips list not found in cache or expired');
    return null;
  }

  /**
   * Cache trips response with LRU eviction
   */
  async cacheTrips(params: TripsQueryParams, data: TripsApiResponse): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(params);

      // If already in cache, update it
      if (this.memoryCache.has(cacheKey)) {
        this.memoryCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          queryParams: params,
        });

        // Update access order
        this.accessOrder = this.accessOrder.filter(k => k !== cacheKey);
        this.accessOrder.push(cacheKey);
      } else {
        // Check if cache is full
        if (this.accessOrder.length >= this.maxCacheSize) {
          // Remove least recently used (first in order)
          const lruKey = this.accessOrder.shift();
          if (lruKey) {
            this.memoryCache.delete(lruKey);
            console.log(`Evicted trips list cache entry (LRU)`);
          }
        }

        // Add new entry
        this.memoryCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          queryParams: params,
        });
        this.accessOrder.push(cacheKey);
      }

      await this.saveCacheToDb();
      console.log(`Trips list cached. Cache size: ${this.memoryCache.size}`);
    } catch (error) {
      console.error('Error caching trips list:', error);
    }
  }

  /**
   * Check if trips for given params are cached and valid
   */
  async hasCachedTrips(params: TripsQueryParams): Promise<boolean> {
    const cacheKey = this.generateCacheKey(params);
    const cached = this.memoryCache.get(cacheKey);

    if (!cached) {
      return false;
    }

    return this.isCacheValid(cached);
  }

  /**
   * Clear all cached trips
   */
  async clearCache(): Promise<void> {
    try {
      this.memoryCache.clear();
      this.accessOrder = [];
      await this.indexedDbService.delete(this.cacheKey);
      console.log('Trips list cache cleared');
    } catch (error) {
      console.error('Error clearing trips list cache:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ params: TripsQueryParams; age: number }>;
    maxSize: number;
    ttlSeconds: number;
  } {
    const entries = Array.from(this.memoryCache.values()).map(cached => ({
      params: cached.queryParams,
      age: Math.floor((Date.now() - cached.timestamp) / 1000),
    }));

    return {
      size: this.memoryCache.size,
      entries,
      maxSize: this.maxCacheSize,
      ttlSeconds: this.defaultTtlSeconds,
    };
  }

  /**
   * Manually set TTL (for future configuration feature)
   * Note: This only affects new cache checks, existing entries keep their original timestamp
   */
  setTtl(seconds: number): void {
    if (seconds > 0) {
      (this as any).defaultTtlSeconds = seconds;
      console.log(`Cache TTL updated to ${seconds} seconds`);
    }
  }
}
