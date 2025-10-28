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
  private lastFormat?: string;

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

    // Check if we need to recalculate
    const shouldUpdate = this.lastInput !== value || this.lastFormat !== format;

    if (shouldUpdate) {
      this.lastInput = value;
      this.lastFormat = format;
      this.lastValue = this.localeService.formatDate(value, format, timezone);
    }

    return this.lastValue;
  }
}
