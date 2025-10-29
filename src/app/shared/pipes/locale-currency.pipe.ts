import { Pipe, PipeTransform, inject, OnDestroy } from '@angular/core';
import { LocaleService } from '../services/locale.service';

/**
 * Custom currency pipe that uses the app's locale settings
 * Automatically updates when locale changes
 */
@Pipe({
  name: 'localeCurrency',
  pure: false, // Impure to react to locale changes
})
export class LocaleCurrencyPipe implements PipeTransform, OnDestroy {
  private readonly localeService = inject(LocaleService);
  private lastValue: string = '';
  private lastInput?: number;
  private lastLocale?: string;
  private lastDisplay?: 'code' | 'symbol' | 'symbol-narrow';
  private lastDigitsInfo?: string;

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  transform(
    value: number | null | undefined,
    display: 'code' | 'symbol' | 'symbol-narrow' = 'symbol',
    digitsInfo?: string
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const currentLocale = this.localeService.localeCode();

    // Check if we need to recalculate
    const shouldUpdate =
      this.lastInput !== value ||
      this.lastLocale !== currentLocale ||
      this.lastDisplay !== display ||
      this.lastDigitsInfo !== digitsInfo;

    if (shouldUpdate) {
      this.lastInput = value;
      this.lastLocale = currentLocale;
      this.lastDisplay = display;
      this.lastDigitsInfo = digitsInfo;
      this.lastValue = this.localeService.formatCurrency(value, display, digitsInfo);
    }

    return this.lastValue;
  }
}
