import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toast } from 'ngx-sonner';
import { TripsApiService, TripsService, TripDetailCacheService } from '../../shared/services';
import { Trip, TripWithScore } from '../../shared/models';
import { LocaleCurrencyPipe } from '../../shared/pipes/locale-currency.pipe';
import { LocaleDatePipe } from '../../shared/pipes/locale-date.pipe';

@Component({
  selector: 'app-trip-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    LocaleCurrencyPipe,
    LocaleDatePipe,
  ],
  templateUrl: 'trip-detail.component.html',
  styleUrl: 'trip-detail.component.scss',
})
export class TripDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tripsApiService = inject(TripsApiService);
  private readonly tripsService = inject(TripsService);
  private readonly tripDetailCacheService = inject(TripDetailCacheService);

  protected readonly loading = signal<boolean>(false);
  protected readonly trip = signal<Trip | null>(null);
  protected readonly tripWithScore = signal<TripWithScore | null>(null);

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('id');

    if (tripId) {
      this.loadTrip(tripId);
    } else {
      this.router.navigate(['/home']);
    }
  }

  private async loadTrip(id: string): Promise<void> {
    this.loading.set(true);

    try {
      // First, check cache
      const cachedTrip = await this.tripDetailCacheService.getCachedTrip(id);

      if (cachedTrip) {
        // Use cached trip
        this.setTripData(cachedTrip);
        this.loading.set(false);
        toast.success('Trip loaded from cache');
      } else {
        // No cache, fetch from API
        this.tripsApiService.getTripById(id).subscribe({
          next: async (trip) => {
            this.setTripData(trip);

            // Cache the trip for future use
            try {
              await this.tripDetailCacheService.cacheTrip(trip);
            } catch (error) {
              console.warn('Failed to cache trip:', error);
            }

            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error loading trip:', error);
            toast.error('Failed to load trip details');
            this.loading.set(false);
            this.trip.set(null);
          },
        });
      }
    } catch (error) {
      console.error('Error in loadTrip:', error);
      this.loading.set(false);
      toast.error('Failed to load trip details');
    }
  }

  private setTripData(trip: Trip): void {
    this.trip.set(trip);

    // Calculate score for the trip
    const listItem = this.tripsService.convertToListItems([trip])[0];
    const [tripWithScore] = this.tripsService.addScoresToTrips([listItem]);
    this.tripWithScore.set(tripWithScore);
  }

  protected goBack(): void {
    this.router.navigate(['/home']);
  }

  protected getScoreIcon(): string {
    const tier = this.tripWithScore()?.scoreTier;
    switch (tier) {
      case 'awesome':
        return 'star';
      case 'good':
        return 'thumb_up';
      case 'average':
        return 'check_circle';
      default:
        return 'check_circle';
    }
  }
}
