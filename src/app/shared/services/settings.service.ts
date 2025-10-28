import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  VerticalTypeConfig,
  LocaleConfig,
  AVAILABLE_LOCALES,
} from '../models/settings.model';

/**
 * Service for managing application settings
 * Persists settings to IndexedDB and provides reactive state
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly settingsKey = 'app-settings';

  // Settings state
  private readonly settingsSignal = signal<AppSettings>(DEFAULT_SETTINGS);

  // Public read-only signals
  readonly settings = this.settingsSignal.asReadonly();
  readonly verticalTypes = computed(() => this.settingsSignal().verticalTypes);
  readonly locale = computed(() => this.settingsSignal().locale);
  readonly enabledVerticalTypes = computed(() =>
    this.settingsSignal().verticalTypes.filter((vt) => vt.enabled)
  );

  constructor() {
    // Load settings on initialization
    this.loadSettings();

    // Auto-save settings when they change
    effect(() => {
      const settings = this.settingsSignal();
      // Skip saving default settings on initialization
      if (settings !== DEFAULT_SETTINGS) {
        this.saveSettings(settings);
      }
    });
  }

  /**
   * Load settings from IndexedDB
   */
  private async loadSettings(): Promise<void> {
    try {
      const cached = await this.indexedDbService.get<AppSettings>(this.settingsKey);

      if (cached) {
        // Validate and merge with defaults (in case of version updates)
        const merged = this.mergeWithDefaults(cached);
        this.settingsSignal.set(merged);
        console.log('Settings loaded from IndexedDB');
      } else {
        // No cached settings, use defaults
        await this.saveSettings(DEFAULT_SETTINGS);
        console.log('Using default settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // On error, use defaults
      this.settingsSignal.set(DEFAULT_SETTINGS);
    }
  }

  /**
   * Save settings to IndexedDB
   */
  private async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await this.indexedDbService.set(this.settingsKey, settings);
      console.log('Settings saved to IndexedDB');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Merge cached settings with defaults (for version migrations)
   */
  private mergeWithDefaults(cached: AppSettings): AppSettings {
    // Future-proof: handle version migrations here
    return {
      ...DEFAULT_SETTINGS,
      ...cached,
      version: DEFAULT_SETTINGS.version,
    };
  }

  /**
   * Update locale configuration
   */
  async setLocale(locale: LocaleConfig): Promise<void> {
    const currentSettings = this.settingsSignal();
    this.settingsSignal.set({
      ...currentSettings,
      locale,
    });
  }

  /**
   * Get locale by code
   */
  getLocaleByCode(code: string): LocaleConfig | undefined {
    return AVAILABLE_LOCALES.find((l) => l.code === code);
  }

  /**
   * Add new vertical type
   */
  async addVerticalType(verticalType: Omit<VerticalTypeConfig, 'order'>): Promise<void> {
    const currentSettings = this.settingsSignal();
    const maxOrder = Math.max(...currentSettings.verticalTypes.map((vt) => vt.order), 0);

    const newVerticalType: VerticalTypeConfig = {
      ...verticalType,
      order: maxOrder + 1,
    };

    this.settingsSignal.set({
      ...currentSettings,
      verticalTypes: [...currentSettings.verticalTypes, newVerticalType],
    });
  }

  /**
   * Update existing vertical type
   */
  async updateVerticalType(id: string, updates: Partial<VerticalTypeConfig>): Promise<void> {
    const currentSettings = this.settingsSignal();
    const verticalTypes = currentSettings.verticalTypes.map((vt) =>
      vt.id === id ? { ...vt, ...updates } : vt
    );

    this.settingsSignal.set({
      ...currentSettings,
      verticalTypes,
    });
  }

  /**
   * Delete vertical type
   */
  async deleteVerticalType(id: string): Promise<void> {
    const currentSettings = this.settingsSignal();
    const verticalTypes = currentSettings.verticalTypes.filter((vt) => vt.id !== id);

    this.settingsSignal.set({
      ...currentSettings,
      verticalTypes,
    });
  }

  /**
   * Reorder vertical types
   */
  async reorderVerticalTypes(verticalTypes: VerticalTypeConfig[]): Promise<void> {
    const currentSettings = this.settingsSignal();

    // Update order property based on new position
    const reordered = verticalTypes.map((vt, index) => ({
      ...vt,
      order: index + 1,
    }));

    this.settingsSignal.set({
      ...currentSettings,
      verticalTypes: reordered,
    });
  }

  /**
   * Toggle vertical type enabled status
   */
  async toggleVerticalType(id: string): Promise<void> {
    const currentSettings = this.settingsSignal();
    const verticalTypes = currentSettings.verticalTypes.map((vt) =>
      vt.id === id ? { ...vt, enabled: !vt.enabled } : vt
    );

    this.settingsSignal.set({
      ...currentSettings,
      verticalTypes,
    });
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    this.settingsSignal.set(DEFAULT_SETTINGS);
    await this.saveSettings(DEFAULT_SETTINGS);
  }

  /**
   * Check if a vertical type ID is valid (enabled)
   */
  isValidVerticalType(id: string): boolean {
    return this.enabledVerticalTypes().some((vt) => vt.id === id);
  }

  /**
   * Get vertical type by ID
   */
  getVerticalTypeById(id: string): VerticalTypeConfig | undefined {
    return this.verticalTypes().find((vt) => vt.id === id);
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.settingsSignal(), null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(json: string): Promise<void> {
    try {
      const settings = JSON.parse(json) as AppSettings;
      const merged = this.mergeWithDefaults(settings);
      this.settingsSignal.set(merged);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Invalid settings JSON');
    }
  }
}
