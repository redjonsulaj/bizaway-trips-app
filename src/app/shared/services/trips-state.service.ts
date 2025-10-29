import { Injectable, signal, computed } from '@angular/core';
import { TripsQueryParams, TripSortCriteria, SortOrder } from '../models/trip.model';

/**
 * Service responsible for managing trips state (sorting, filtering, pagination)
 * Following Single Responsibility Principle - handles state management
 */
@Injectable({
  providedIn: 'root',
})
export class TripsStateService {
  readonly sortBy = signal<TripSortCriteria | undefined>(undefined);
  readonly sortOrder = signal<SortOrder>('ASC');
  readonly titleFilter = signal<string>('');
  readonly minPrice = signal<number | undefined>(undefined);
  readonly maxPrice = signal<number | undefined>(undefined);
  readonly minRating = signal<number | undefined>(undefined);
  readonly tags = signal<string>('');
  readonly page = signal<number>(1);
  readonly limit = signal<number>(10);

  // Computed query params - automatically updates when any signal changes
  readonly queryParams = computed<TripsQueryParams>(() => {
    const params: TripsQueryParams = {
      page: this.page(),
      limit: this.limit(),
    };

    if (this.sortBy()) {
      params.sortBy = this.sortBy();
      params.sortOrder = this.sortOrder();
    }

    if (this.titleFilter()) {
      params.titleFilter = this.titleFilter();
    }

    if (this.minPrice() !== undefined) {
      params.minPrice = this.minPrice();
    }

    if (this.maxPrice() !== undefined) {
      params.maxPrice = this.maxPrice();
    }

    if (this.minRating() !== undefined) {
      params.minRating = this.minRating();
    }

    if (this.tags()) {
      params.tags = this.tags();
    }

    return params;
  });

  /**
   * Helper method to reset page when filters change
   * Call this after updating any filter signal
   */
  resetPage(): void {
    this.page.set(1);
  }

  /**
   * Resets all filters and sorting
   */
  resetFilters(): void {
    this.sortBy.set(undefined);
    this.sortOrder.set('ASC');
    this.titleFilter.set('');
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
    this.minRating.set(undefined);
    this.tags.set('');
    this.page.set(1);
  }
}
