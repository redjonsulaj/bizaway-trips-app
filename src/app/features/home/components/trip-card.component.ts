import {Component, input, output, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TripWithScore } from '../../../shared/models';

@Component({
  selector: 'app-trip-card',
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card class="trip-card" (click)="cardClick.emit()">
      <div class="trip-image-container">
        <img
          mat-card-image
          [src]="getImageUrl()"
          [alt]="trip().title"
          class="trip-image"
          (error)="onImageError()"
          loading="lazy"
        />
        <div class="score-badge" [class]="'score-' + trip().scoreTier">
          <mat-icon>{{ getScoreIcon() }}</mat-icon>
          <span>{{ trip().scoreTier }}</span>
        </div>
      </div>

      <mat-card-header>
        <mat-card-title>{{ trip().title }}</mat-card-title>
        <mat-card-subtitle>{{ trip().verticalType | titlecase }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="trip-details">
          <div class="detail-item">
            <mat-icon>attach_money</mat-icon>
            <span>{{ trip().price | currency }}</span>
          </div>

          <div class="detail-item">
            <mat-icon>star</mat-icon>
            <span>{{ trip().rating }} ({{ trip().nrOfRatings }} reviews)</span>
          </div>

          <div class="detail-item">
            <mat-icon>eco</mat-icon>
            <span>{{ trip().co2 }} kg CO₂</span>
          </div>
        </div>

        @if (trip().tags.length) {
          <div class="tags-container">
            <mat-chip-set>
              @for (tag of trip().tags; track tag) {
                <mat-chip>{{ tag }}</mat-chip>
              }
            </mat-chip-set>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .trip-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
    }

    .trip-image-container {
      position: relative;
    }

    .trip-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .score-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 12px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      font-size: 0.875rem;
      backdrop-filter: blur(4px);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.score-awesome {
        background-color: rgba(76, 175, 80, 0.9);
        color: white;
      }

      &.score-good {
        background-color: rgba(33, 150, 243, 0.9);
        color: white;
      }

      &.score-average {
        background-color: rgba(158, 158, 158, 0.9);
        color: white;
      }
    }

    mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .trip-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      span {
        font-size: 0.875rem;
      }
    }

    .tags-container {
      margin-top: auto;

      mat-chip-set {
        display: flex;
        flex-wrap: wrap;
      }
    }
  `,
})
export class TripCardComponent {
  trip = input.required<TripWithScore>();
  cardClick = output<void>();

  protected getScoreIcon(): string {
    const tier = this.trip().scoreTier;
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

  protected imageError = signal<boolean>(false);
  protected readonly fallbackImage = 'https://fastly.picsum.photos/id/454/200/200.jpg?hmac=N13wDge6Ku6Eg_LxRRsrfzC1A4ZkpCScOEp-hH-PwHg';

  protected onImageError(): void {
    this.imageError.set(true);
  }

  protected getImageUrl(): string {
    return this.imageError() ? this.fallbackImage : this.trip().thumbnailUrl;
  }
}
