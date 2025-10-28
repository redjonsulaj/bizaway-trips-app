import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TripWithScore } from '../../../shared/models';
import { LocaleCurrencyPipe } from '../../../shared/pipes/locale-currency.pipe';

@Component({
  selector: 'app-trip-of-the-day',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, LocaleCurrencyPipe],
  template: `
    @if (trip()) {
      <mat-card class="trip-of-day-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="title-icon">wb_sunny</mat-icon>
            Trip of the Day
          </mat-card-title>
        </mat-card-header>

        <div class="card-content">
          <img
            [src]="trip()!.thumbnailUrl"
            [alt]="trip()!.title"
            class="trip-image"
          />

          <mat-card-content class="trip-info">
            <div class="header-section">
              <h2>{{ trip()!.title }}</h2>
              <div class="score-badge" [class]="'score-' + trip()!.scoreTier">
                <mat-icon>{{ getScoreIcon() }}</mat-icon>
                <span>{{ trip()!.scoreTier }}</span>
              </div>
            </div>

            <p class="vertical-type">{{ trip()!.verticalType | titlecase }}</p>

            <div class="details-grid">
              <div class="detail-item">
                <mat-icon>attach_money</mat-icon>
                <div class="detail-content">
                  <span class="detail-label">Price</span>
                  <span class="detail-value">{{ trip()!.price | localeCurrency }}</span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>star</mat-icon>
                <div class="detail-content">
                  <span class="detail-label">Rating</span>
                  <span class="detail-value">
                    {{ trip()!.rating }} ({{ trip()!.nrOfRatings }} reviews)
                  </span>
                </div>
              </div>

              <div class="detail-item">
                <mat-icon>eco</mat-icon>
                <div class="detail-content">
                  <span class="detail-label">CO₂ Emissions</span>
                  <span class="detail-value">{{ trip()!.co2 }} kg</span>
                </div>
              </div>
            </div>

            @if (trip()!.tags.length) {
              <div class="tags-section">
                <mat-chip-set>
                  @for (tag of trip()!.tags; track tag) {
                    <mat-chip>{{ tag }}</mat-chip>
                  }
                </mat-chip-set>
              </div>
            }

            <button
              mat-raised-button
              color="primary"
              class="view-button"
              (click)="viewTrip.emit(trip()!)"
            >
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
          </mat-card-content>
        </div>
      </mat-card>
    }
  `,
  styles: `
    .trip-of-day-card {
      margin-bottom: 32px;
      background: linear-gradient(135deg, var(--mat-sys-primary-container) 0%, var(--mat-sys-secondary-container) 100%);

      mat-card-header {
        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.5rem;
          color: var(--mat-sys-on-primary-container);

          .title-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }
      }
    }

    .card-content {
      display: flex;
      gap: 24px;

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .trip-image {
      width: 300px;
      height: 300px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

      @media (max-width: 768px) {
        width: 100%;
        height: 250px;
      }
    }

    .trip-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;

      h2 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }
    }

    .score-badge {
      padding: 6px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.score-awesome {
        background-color: #4caf50;
        color: white;
      }

      &.score-good {
        background-color: #2196f3;
        color: white;
      }

      &.score-average {
        background-color: #9e9e9e;
        color: white;
      }
    }

    .vertical-type {
      color: var(--mat-sys-on-surface-variant);
      font-size: 1rem;
      margin: 0;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 8px 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: var(--mat-sys-surface-variant);
      border-radius: 8px;

      mat-icon {
        color: var(--mat-sys-primary);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .detail-content {
      display: flex;
      flex-direction: column;

      .detail-label {
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        font-size: 1rem;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }
    }

    .tags-section {
      mat-chip-set {
        display: flex;
        flex-wrap: wrap;
      }
    }

    .view-button {
      align-self: flex-start;
      margin-top: auto;

      mat-icon {
        margin-right: 8px;
      }
    }
  `,
})
export class TripOfTheDayComponent {
  trip = input<TripWithScore | null>();
  viewTrip = output<TripWithScore>();

  protected getScoreIcon(): string {
    const tier = this.trip()?.scoreTier;
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
