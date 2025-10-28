import { Component, inject, signal, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatButton, MatButtonModule} from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { toast } from 'ngx-sonner';
import {
  TripsApiService,
  TripsService,
  TripsStateService,
  TripOfTheDayCacheService, TripDetailCacheService, TripsListCacheService
} from '../../shared/services';
import { TripWithScore } from '../../shared/models';
import { TripFiltersComponent, SortChangeEvent, FilterChangeEvent } from './components/trip-filters.component';
import { TripListComponent } from './components/trip-list.component';
import { TripOfTheDayComponent } from './components/trip-of-the-day.component';
import { PaginationComponent, PaginationInfo } from './components/pagination.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    MatIcon,
    MatButton,
    TripOfTheDayComponent,
    TripFiltersComponent,
    TripListComponent,
    PaginationComponent
  ]
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly tripsApiService = inject(TripsApiService);
  private readonly tripsService = inject(TripsService);
  private readonly tripsStateService = inject(TripsStateService);
  private readonly tripOfTheDayCacheService = inject(TripOfTheDayCacheService);
  private readonly tripDetailCacheService = inject(TripDetailCacheService);
  private readonly tripsListCacheService = inject(TripsListCacheService);

  protected readonly loading = signal<boolean>(false);
  protected readonly trips = signal<TripWithScore[]>([]);
  protected readonly paginationInfo = signal<PaginationInfo | null>(null);
  protected readonly tripOfTheDay = signal<TripWithScore | null>(null);
  protected readonly showTripOfDay = signal<boolean>(false);

  // Computed signal for trips with scores
  protected readonly tripsWithScores = computed(() => this.trips());

  constructor() {
    // Load trips when query params change
    effect(
      () => {
        const params = this.tripsStateService.queryParams();
        this.loadTrips();
      },
      { allowSignalWrites: true }
    );
  }

  private async loadTrips(): Promise<void> {
    this.loading.set(true);
    const params = this.tripsStateService.queryParams();

    try {
      // First, check cache
      const cachedResponse = await this.tripsListCacheService.getCachedTrips(params);

      if (cachedResponse) {
        // Use cached response
        const tripsWithScores = this.tripsService.addScoresToTrips(cachedResponse.items);
        this.trips.set(tripsWithScores);
        this.paginationInfo.set(cachedResponse.pagination);
        this.loading.set(false);
        // Don't show toast for cache hits to avoid noise
      } else {
        // No valid cache, fetch from API
        this.tripsApiService.getTrips(params).subscribe({
          next: async (response) => {
            // Add scores to trips
            const tripsWithScores = this.tripsService.addScoresToTrips(response.items);
            this.trips.set(tripsWithScores);

            // Update pagination info
            this.paginationInfo.set(response.pagination);

            // Cache the response
            try {
              await this.tripsListCacheService.cacheTrips(params, response);
            } catch (error) {
              console.warn('Failed to cache trips list:', error);
            }

            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error loading trips:', error);
            toast.error('Failed to load trips. Please try again.');
            this.loading.set(false);
          },
        });
      }
    } catch (error) {
      console.error('Error in loadTrips:', error);
      this.loading.set(false);
      toast.error('Failed to load trips. Please try again.');
    }
  }

  protected async loadTripOfTheDay(): Promise<void> {
    this.showTripOfDay.set(true);

    try {
      // First, try to get from cache
      const cachedTrip = await this.tripOfTheDayCacheService.getCachedTrip();

      if (cachedTrip) {
        // Use cached trip
        const listItem = this.tripsService.convertToListItems([cachedTrip])[0];
        const [tripWithScore] = this.tripsService.addScoresToTrips([listItem]);
        this.tripOfTheDay.set(tripWithScore);
        toast.success('Trip of the Day loaded from cache!');
      } else {
        // No valid cache, fetch from API
        this.tripsApiService.getTripOfTheDay().subscribe({
          next: async (trip) => {
            // Cache the trip for today
            try {
              await this.tripOfTheDayCacheService.cacheTrip(trip);
            } catch (error) {
              console.warn('Failed to cache trip of the day:', error);
            }

            // Display the trip
            const listItem = this.tripsService.convertToListItems([trip])[0];
            const [tripWithScore] = this.tripsService.addScoresToTrips([listItem]);
            this.tripOfTheDay.set(tripWithScore);
            toast.success('Trip of the Day loaded!');
          },
          error: (error) => {
            console.error('Error loading trip of the day:', error);
            toast.error('Failed to load Trip of the Day');
            this.showTripOfDay.set(false);
          },
        });
      }
    } catch (error) {
      console.error('Error in loadTripOfTheDay:', error);
      toast.error('Failed to load Trip of the Day');
      this.showTripOfDay.set(false);
    }
  }

  protected onSortChange(event: SortChangeEvent): void {
    this.tripsStateService.setSorting(event.sortBy, event.sortOrder);
  }

  protected onFilterChange(event: FilterChangeEvent): void {
    if (event.titleFilter !== undefined) {
      this.tripsStateService.setTitleFilter(event.titleFilter);
    }

    if (event.minPrice !== undefined || event.maxPrice !== undefined) {
      this.tripsStateService.setPriceRange(event.minPrice, event.maxPrice);
    }

    if (event.minRating !== undefined) {
      this.tripsStateService.setMinRating(event.minRating);
    }

    if (event.tags !== undefined) {
      this.tripsStateService.setTags(event.tags);
    }
  }

  protected onResetFilters(): void {
    this.tripsStateService.resetFilters();
  }

  protected onPageChange(page: number): void {
    this.tripsStateService.setPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected onLimitChange(limit: number): void {
    this.tripsStateService.setLimit(limit);
  }

  protected async onViewTripDetail(trip: TripWithScore): Promise<void> {
    // Show loading toast
    toast.loading('Loading trip details...');

    // Check if trip is already in cache
    const isCached = this.tripDetailCacheService.hasCachedTrip(trip.id);

    if (!isCached) {
      // Prefetch and cache before navigation for better UX
      this.tripsApiService.getTripById(trip.id).subscribe({
        next: async (fullTrip) => {
          try {
            await this.tripDetailCacheService.cacheTrip(fullTrip);
            toast.dismiss();
            toast.success('Trip loaded!');
          } catch (error) {
            console.warn('Failed to cache trip during prefetch:', error);
          }

          // Navigate after caching
          this.router.navigate(['/trip', trip.id]);
        },
        error: (error) => {
          console.error('Error prefetching trip:', error);
          toast.dismiss();
          // Navigate anyway, the detail page will handle the error
          this.router.navigate(['/trip', trip.id]);
        },
      });
    } else {
      // Already cached, navigate immediately
      toast.dismiss();
      this.router.navigate(['/trip', trip.id]);
    }
  }


}
