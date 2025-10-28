import { Injectable, inject, LOCALE_ID, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SettingsService } from './settings.service';

/**
 * Service for managing locale-specific formatting
 * Provides reactive pipes that update based on locale settings
 */
@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  private readonly settingsService = inject(SettingsService);

  // Computed locale properties
  readonly currentLocale = computed(() => this.settingsService.locale());
  readonly localeCode = computed(() => this.currentLocale().code);
  readonly currencyCode = computed(() => this.currentLocale().currency);
  readonly dateFormat = computed(() => this.currentLocale().dateFormat);

  /**
   * Format currency based on current locale
   */
  formatCurrency(
    value: number,
    display: 'code' | 'symbol' | 'symbol-narrow' = 'symbol',
    digitsInfo?: string
  ): string {
    const locale = this.localeCode();
    const currency = this.currencyCode();

    const pipe = new CurrencyPipe(locale);
    return pipe.transform(value, currency, display, digitsInfo) || '';
  }

  /**
   * Format date based on current locale
   */
  formatDate(
    value: string | number | Date,
    format?: string,
    timezone?: string
  ): string {
    const locale = this.localeCode();
    const dateFormat = format || this.dateFormat();

    const pipe = new DatePipe(locale);
    return pipe.transform(value, dateFormat, timezone) || '';
  }

  /**
   * Format number based on current locale
   */
  formatNumber(value: number, digitsInfo?: string): string {
    const locale = this.localeCode();

    try {
      const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return formatter.format(value);
    } catch (error) {
      console.error('Error formatting number:', error);
      return value.toString();
    }
  }

  /**
   * Get currency symbol for current locale
   */
  getCurrencySymbol(): string {
    const locale = this.localeCode();
    const currency = this.currencyCode();

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      });

      const parts = formatter.formatToParts(0);
      const currencyPart = parts.find((part) => part.type === 'currency');
      return currencyPart?.value || currency;
    } catch (error) {
      console.error('Error getting currency symbol:', error);
      return currency;
    }
  }

  /**
   * Get localized date format pattern
   */
  getDateFormatPattern(): string {
    const locale = this.localeCode();

    try {
      const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      // Get format parts to build pattern
      const parts = formatter.formatToParts(new Date());
      return parts
        .map((part) => {
          switch (part.type) {
            case 'year':
              return 'YYYY';
            case 'month':
              return 'MM';
            case 'day':
              return 'DD';
            default:
              return part.value;
          }
        })
        .join('');
    } catch (error) {
      console.error('Error getting date format pattern:', error);
      return 'MM/DD/YYYY';
    }
  }
}
