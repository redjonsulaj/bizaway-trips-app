import { Pipe, PipeTransform, inject, OnDestroy } from '@angular/core';
import { LocaleService } from '../services/locale.service';

/**
 * Custom date pipe that uses the app's locale settings
 * Automatically updates when locale changes
 */
@Pipe({
  name: 'localeDate',
  pure: false, // Impure to react to locale changes
})
export class LocaleDatePipe implements PipeTransform, OnDestroy {
  private readonly localeService = inject(LocaleService);
  private lastValue: string = '';
  private lastInput?: string | number | Date;
  private lastLocale?: string;
  private lastFormat?: string;
  private lastTimezone?: string;

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  transform(
    value: string | number | Date | null | undefined,
    format?: string,
    timezone?: string
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const currentLocale = this.localeService.localeCode();

    // Check if we need to recalculate
    const shouldUpdate =
      this.lastInput !== value ||
      this.lastLocale !== currentLocale ||
      this.lastFormat !== format ||
      this.lastTimezone !== timezone;

    if (shouldUpdate) {
      this.lastInput = value;
      this.lastLocale = currentLocale;
      this.lastFormat = format;
      this.lastTimezone = timezone;
      this.lastValue = this.localeService.formatDate(value, format, timezone);
    }

    return this.lastValue;
  }
}
