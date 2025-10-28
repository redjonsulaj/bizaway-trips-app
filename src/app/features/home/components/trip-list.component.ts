import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TripWithScore } from '../../../shared/models';
import { TripCardComponent } from './trip-card.component';

@Component({
  selector: 'app-trip-list',
  imports: [CommonModule, MatProgressSpinnerModule, TripCardComponent],
  template: `
    @if (loading()) {
      <div class="loading-container">
        <mat-spinner />
        <p>Loading trips...</p>
      </div>
    } @else if (trips().length === 0) {
      <div class="empty-state">
        <p>No trips found matching your criteria.</p>
      </div>
    } @else {
      <div class="trips-grid">
        @for (trip of trips(); track trip.id) {
          <app-trip-card [trip]="trip" (cardClick)="tripClick.emit(trip)" />
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;

      p {
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;

      p {
        font-size: 1.125rem;
        color: var(--mat-sys-on-surface-variant);
      }
    }

    .trips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      padding: 8px;
    }

    @media (max-width: 768px) {
      .trips-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class TripListComponent {
  trips = input.required<TripWithScore[]>();
  loading = input<boolean>(false);
  tripClick = output<TripWithScore>();
}
