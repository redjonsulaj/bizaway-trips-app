import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LocaleService } from '../services/locale.service';
import { Subscription } from 'rxjs';

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
  private readonly cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;
  private lastValue: string = '';
  private lastInput?: number;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  transform(
    value: number | null | undefined,
    display: 'code' | 'symbol' | 'symbol-narrow' = 'symbol',
    digitsInfo?: string
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Check if we need to recalculate
    const shouldUpdate = this.lastInput !== value;

    if (shouldUpdate) {
      this.lastInput = value;
      this.lastValue = this.localeService.formatCurrency(value, display, digitsInfo);
    }

    return this.lastValue;
  }
}
