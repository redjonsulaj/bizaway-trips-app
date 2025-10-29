import {Component, output, OnDestroy, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TripsStateService } from '../../../shared/services/trips-state.service';
import { SettingsService } from '../../../shared/services/settings.service';

@Component({
  selector: 'app-trip-filters',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
  ],
  template: `
    <div class="filters-container">
      <!-- Search and Sort Row -->
      <div class="main-filters">
        <mat-form-field class="search-field">
          <mat-label>Search trips</mat-label>
          <input
            matInput
            [ngModel]="state.titleFilter()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search by title..."
          />
          <mat-icon matPrefix>search</mat-icon>
          @if (state.titleFilter()) {
            <button
              matSuffix
              mat-icon-button
              (click)="clearSearch()"
              aria-label="Clear search"
            >
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field>
          <mat-label>Sort by</mat-label>
          <mat-select
            [(ngModel)]="state.sortBy"
            (ngModelChange)="onSortChange()"
          >
            <mat-option [value]="undefined">None</mat-option>
            <mat-option value="title">Title</mat-option>
            <mat-option value="price">Price</mat-option>
            <mat-option value="rating">Rating</mat-option>
            <mat-option value="creationDate">Date Created</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Order</mat-label>
          <mat-select
            [(ngModel)]="state.sortOrder"
            (ngModelChange)="onSortChange()"
            [disabled]="!state.sortBy()"
          >
            <mat-option value="ASC">Ascending</mat-option>
            <mat-option value="DESC">Descending</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Advanced Filters (Expandable) -->
      <mat-expansion-panel class="advanced-filters">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>filter_list</mat-icon>
            Advanced Filters
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="filter-row">
          <mat-form-field>
            <mat-label>Min Price</mat-label>
            <input
              matInput
              type="number"
              [(ngModel)]="state.minPrice"
              (ngModelChange)="onFilterChange()"
              placeholder="0"
            />
            <mat-icon matPrefix>attach_money</mat-icon>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Max Price</mat-label>
            <input
              matInput
              type="number"
              [(ngModel)]="state.maxPrice"
              (ngModelChange)="onFilterChange()"
              placeholder="10000"
            />
            <mat-icon matPrefix>attach_money</mat-icon>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Min Rating</mat-label>
            <mat-select
              [(ngModel)]="state.minRating"
              (ngModelChange)="onFilterChange()"
            >
              <mat-option [value]="undefined">Any</mat-option>
              <mat-option [value]="1">1+ Stars</mat-option>
              <mat-option [value]="2">2+ Stars</mat-option>
              <mat-option [value]="3">3+ Stars</mat-option>
              <mat-option [value]="4">4+ Stars</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Tags</mat-label>
            <input
              matInput
              [ngModel]="state.tags()"
              (ngModelChange)="onTagsChange($event)"
              placeholder="food, culture, history..."
            />
            <mat-icon matPrefix>label</mat-icon>
          </mat-form-field>


          @if (clientSideFilterEnabled()) {
            <mat-form-field>
              <mat-label>Vertical Type</mat-label>
              <mat-select
                [(ngModel)]="selectedVerticalType"
                (ngModelChange)="verticalTypeChange.emit($event)"
              >
                <mat-option [value]="undefined">All Types</mat-option>
                @for (vt of availableVerticalTypes(); track vt.id) {
                  <mat-option [value]="vt.id">{{ vt.label }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>category</mat-icon>
            </mat-form-field>
          }
        </div>

        <div class="filter-actions">
          <button mat-stroked-button (click)="resetFilters()">
            <mat-icon>clear</mat-icon>
            Reset Filters
          </button>
        </div>
      </mat-expansion-panel>
    </div>
  `,
  styles: `
    .filters-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .main-filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    mat-form-field {
      min-width: 150px;
    }

    .advanced-filters {
      .filter-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      .filter-actions {
        display: flex;
        justify-content: flex-end;
      }
    }

    mat-icon {
      color: var(--mat-sys-on-surface-variant);
    }

    @media (max-width: 768px) {
      .main-filters {
        flex-direction: column;

        mat-form-field {
          width: 100%;
        }
      }

      .advanced-filters .filter-row {
        flex-direction: column;

        mat-form-field {
          width: 100%;
        }
      }
    }
  `,
})
export class TripFiltersComponent implements OnDestroy {
  // Direct access to state service signals
  protected readonly state = inject(TripsStateService);
  private readonly settingsService = inject(SettingsService);

  // Only vertical type filter needs local state (client-side only)
  protected selectedVerticalType = signal<string | undefined>(undefined);

  // Settings computed signals
  protected readonly clientSideFilterEnabled = this.settingsService.clientSideVerticalTypeFilter;
  protected readonly availableVerticalTypes = this.settingsService.enabledVerticalTypes;

  verticalTypeChange = output<string | undefined>();

  // Search debouncing
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  // Tags debouncing
  private tagsSubject = new Subject<string>();
  private tagsSubscription: Subscription;

  constructor() {
    // Search debouncing - wait 400ms after user stops typing
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((searchValue) => {
        // Check if input contains ONLY whitespace (no actual characters)
        const isOnlyWhitespace = searchValue.trim() === '' && searchValue.length > 0;

        if (isOnlyWhitespace) {
          searchValue = '';
        }

        this.state.titleFilter.set(searchValue);
        this.state.resetPage();
      });

    // Tags debouncing - wait 400ms after user stops typing
    this.tagsSubscription = this.tagsSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((tagsValue) => {
        const isOnlyWhitespace = tagsValue.trim() === '' && tagsValue.length > 0;

        if (isOnlyWhitespace) {
          tagsValue = '';
        }

        this.state.tags.set(tagsValue);
        this.state.resetPage();
      });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.searchSubscription?.unsubscribe();
    this.tagsSubscription?.unsubscribe();
  }

  protected onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  protected onTagsChange(value: string): void {
    this.tagsSubject.next(value);
  }

  protected clearSearch(): void {
    this.state.titleFilter.set('');
    this.state.resetPage();
  }

  protected onSortChange(): void {
    this.state.resetPage();
  }

  protected onFilterChange(): void {
    this.state.resetPage();
  }

  protected resetFilters(): void {
    this.state.resetFilters();
    this.selectedVerticalType.set(undefined);
    this.verticalTypeChange.emit(undefined);
  }
}
