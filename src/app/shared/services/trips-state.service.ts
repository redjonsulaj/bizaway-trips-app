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
  private readonly sortBySignal = signal<TripSortCriteria | undefined>(undefined);
  private readonly sortOrderSignal = signal<SortOrder>('ASC');
  private readonly titleFilterSignal = signal<string>('');
  private readonly minPriceSignal = signal<number | undefined>(undefined);
  private readonly maxPriceSignal = signal<number | undefined>(undefined);
  private readonly minRatingSignal = signal<number | undefined>(undefined);
  private readonly tagsSignal = signal<string>('');
  private readonly pageSignal = signal<number>(1);
  private readonly limitSignal = signal<number>(10);

  // Computed query params
  readonly queryParams = computed<TripsQueryParams>(() => {
    const params: TripsQueryParams = {
      page: this.pageSignal(),
      limit: this.limitSignal(),
    };

    if (this.sortBySignal()) {
      params.sortBy = this.sortBySignal();
      params.sortOrder = this.sortOrderSignal();
    }

    if (this.titleFilterSignal()) {
      params.titleFilter = this.titleFilterSignal();
    }

    if (this.minPriceSignal() !== undefined) {
      params.minPrice = this.minPriceSignal();
    }

    if (this.maxPriceSignal() !== undefined) {
      params.maxPrice = this.maxPriceSignal();
    }

    if (this.minRatingSignal() !== undefined) {
      params.minRating = this.minRatingSignal();
    }

    if (this.tagsSignal()) {
      params.tags = this.tagsSignal();
    }

    return params;
  });

  // Read-only signals for components
  readonly sortBy = this.sortBySignal.asReadonly();
  readonly sortOrder = this.sortOrderSignal.asReadonly();
  readonly titleFilter = this.titleFilterSignal.asReadonly();
  readonly minPrice = this.minPriceSignal.asReadonly();
  readonly maxPrice = this.maxPriceSignal.asReadonly();
  readonly minRating = this.minRatingSignal.asReadonly();
  readonly tags = this.tagsSignal.asReadonly();
  readonly page = this.pageSignal.asReadonly();
  readonly limit = this.limitSignal.asReadonly();

  /**
   * Sets the sorting criteria
   */
  setSorting(sortBy: TripSortCriteria | undefined, sortOrder: SortOrder = 'ASC'): void {
    this.sortBySignal.set(sortBy);
    this.sortOrderSignal.set(sortOrder);
    this.pageSignal.set(1); // Reset to first page when sorting changes
  }

  /**
   * Sets the title filter
   */
  setTitleFilter(filter: string): void {
    this.titleFilterSignal.set(filter);
    this.pageSignal.set(1); // Reset to first page when filter changes
  }

  /**
   * Sets price range filter
   */
  setPriceRange(min: number | undefined, max: number | undefined): void {
    this.minPriceSignal.set(min);
    this.maxPriceSignal.set(max);
    this.pageSignal.set(1);
  }

  /**
   * Sets minimum rating filter
   */
  setMinRating(rating: number | undefined): void {
    this.minRatingSignal.set(rating);
    this.pageSignal.set(1);
  }

  /**
   * Sets tags filter
   */
  setTags(tags: string): void {
    this.tagsSignal.set(tags);
    this.pageSignal.set(1);
  }

  /**
   * Sets the current page
   */
  setPage(page: number): void {
    this.pageSignal.set(page);
  }

  /**
   * Sets the items per page limit
   */
  setLimit(limit: number): void {
    // Ensure limit doesn't exceed 100
    const validLimit = Math.min(Math.max(1, limit), 100);
    this.limitSignal.set(validLimit);
    this.pageSignal.set(1);
  }

  /**
   * Resets all filters and sorting
   */
  resetFilters(): void {
    this.sortBySignal.set(undefined);
    this.sortOrderSignal.set('ASC');
    this.titleFilterSignal.set('');
    this.minPriceSignal.set(undefined);
    this.maxPriceSignal.set(undefined);
    this.minRatingSignal.set(undefined);
    this.tagsSignal.set('');
    this.pageSignal.set(1);
  }
}
