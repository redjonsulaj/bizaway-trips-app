/**
 * Settings models for application configuration
 */

/**
 * Vertical type configuration
 */
export interface VerticalTypeConfig {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  order: number;
}

/**
 * Locale configuration
 */
export interface LocaleConfig {
  code: string; // e.g., 'en-US', 'es-ES', 'fr-FR'
  label: string; // e.g., 'English (United States)'
  currency: string; // e.g., 'USD', 'EUR', 'GBP'
  dateFormat: string; // e.g., 'short', 'medium', 'long'
}

/**
 * Application settings
 */
export interface AppSettings {
  verticalTypes: VerticalTypeConfig[];
  locale: LocaleConfig;
  version: number; // For future migrations
}

/**
 * Default vertical types
 */
export const DEFAULT_VERTICAL_TYPES: VerticalTypeConfig[] = [
  {
    id: 'hotel',
    label: 'Hotel',
    icon: 'hotel',
    enabled: true,
    order: 1,
  },
  {
    id: 'flight',
    label: 'Flight',
    icon: 'flight',
    enabled: true,
    order: 2,
  },
  {
    id: 'car_rental',
    label: 'Car Rental',
    icon: 'directions_car',
    enabled: true,
    order: 3,
  },
  {
    id: 'train',
    label: 'Train',
    icon: 'train',
    enabled: true,
    order: 4,
  },
];

/**
 * Available locales
 */
export const AVAILABLE_LOCALES: LocaleConfig[] = [
  {
    code: 'en-US',
    label: 'English (United States)',
    currency: 'USD',
    dateFormat: 'short',
  },
  {
    code: 'en-GB',
    label: 'English (United Kingdom)',
    currency: 'GBP',
    dateFormat: 'short',
  },
  {
    code: 'es-ES',
    label: 'Spanish (Spain)',
    currency: 'EUR',
    dateFormat: 'short',
  },
  {
    code: 'fr-FR',
    label: 'French (France)',
    currency: 'EUR',
    dateFormat: 'short',
  },
  {
    code: 'de-DE',
    label: 'German (Germany)',
    currency: 'EUR',
    dateFormat: 'short',
  },
  {
    code: 'it-IT',
    label: 'Italian (Italy)',
    currency: 'EUR',
    dateFormat: 'short',
  },
  {
    code: 'pt-BR',
    label: 'Portuguese (Brazil)',
    currency: 'BRL',
    dateFormat: 'short',
  },
  {
    code: 'ja-JP',
    label: 'Japanese (Japan)',
    currency: 'JPY',
    dateFormat: 'short',
  },
  {
    code: 'zh-CN',
    label: 'Chinese (Simplified)',
    currency: 'CNY',
    dateFormat: 'short',
  },
];

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  verticalTypes: DEFAULT_VERTICAL_TYPES,
  locale: AVAILABLE_LOCALES[0], // Default to en-US
  version: 1,
};
