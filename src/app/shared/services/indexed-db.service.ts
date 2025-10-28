import { Injectable } from '@angular/core';

/**
 * Service for managing IndexedDB storage
 * Generic caching service for future expansion
 */
@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private readonly dbName = 'BizawayTripsDB';
  private readonly dbVersion = 1;
  private readonly storeName = 'cache';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  /**
   * Initialize IndexedDB database
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  /**
   * Get value from IndexedDB by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          console.error('Error getting data from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB get:', error);
      return null;
    }
  }

  /**
   * Set value in IndexedDB
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Error setting data in IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB set:', error);
      throw error;
    }
  }

  /**
   * Delete value from IndexedDB by key
   */
  async delete(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Error deleting data from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB delete:', error);
      throw error;
    }
  }

  /**
   * Clear all data from IndexedDB
   */
  async clear(): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Error clearing IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB clear:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists in IndexedDB
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get all keys from IndexedDB
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };

        request.onerror = () => {
          console.error('Error getting keys from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in IndexedDB getAllKeys:', error);
      return [];
    }
  }
}
