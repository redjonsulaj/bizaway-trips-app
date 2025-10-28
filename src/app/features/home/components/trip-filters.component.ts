import { Component, output, signal, OnDestroy, effect } from '@angular/core';
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
import { TripSortCriteria, SortOrder } from '../../../shared/models';

export interface SortChangeEvent {
  sortBy: TripSortCriteria | undefined;
  sortOrder: SortOrder;
}

export interface FilterChangeEvent {
  titleFilter?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string;
}

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
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchTextChange($event)"
            placeholder="Search by title..."
          />
          <mat-icon matPrefix>search</mat-icon>
          @if (searchText()) {
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
          <mat-select [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
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
            [(ngModel)]="sortOrder"
            (ngModelChange)="onSortChange()"
            [disabled]="!sortBy()"
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
              [(ngModel)]="minPrice"
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
              [(ngModel)]="maxPrice"
              (ngModelChange)="onFilterChange()"
              placeholder="10000"
            />
            <mat-icon matPrefix>attach_money</mat-icon>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Min Rating</mat-label>
            <mat-select [(ngModel)]="minRating" (ngModelChange)="onFilterChange()">
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
              [(ngModel)]="tags"
              (ngModelChange)="onTagsChange($event)"
              placeholder="food, culture, history..."
            />
            <mat-icon matPrefix>label</mat-icon>
          </mat-form-field>
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
  sortChange = output<SortChangeEvent>();
  filterChange = output<FilterChangeEvent>();
  resetAll = output<void>();

  protected searchText = signal<string>('');
  protected sortBy = signal<TripSortCriteria | undefined>(undefined);
  protected sortOrder = signal<SortOrder>('ASC');
  protected minPrice = signal<number | undefined>(undefined);
  protected maxPrice = signal<number | undefined>(undefined);
  protected minRating = signal<number | undefined>(undefined);
  protected tags = signal<string>('');

  // Search debouncing
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  // Tags debouncing
  private tagsSubject = new Subject<string>();
  private tagsSubscription: Subscription;

  constructor() {
    // Set up search debouncing - wait 400ms after user stops typing
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(400), // Wait 400ms after last keystroke
        distinctUntilChanged() // Only emit if value has changed
      )
      .subscribe((searchValue) => {
        // Check if input contains ONLY whitespace (no actual characters)
        const isOnlyWhitespace = searchValue.trim() === '' && searchValue.length > 0;

        if (isOnlyWhitespace) {
          // User typed only spaces, clear the input field
          this.searchText.set('');
          searchValue = ''; // Send empty string to API
        }

        this.filterChange.emit({
          titleFilter: searchValue,
          minPrice: this.minPrice(),
          maxPrice: this.maxPrice(),
          minRating: this.minRating(),
          tags: this.tags(),
        });
      });

    // Set up tags debouncing - wait 400ms after user stops typing
    this.tagsSubscription = this.tagsSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((tagsValue) => {
        const isOnlyWhitespace = tagsValue.trim() === '' && tagsValue.length > 0;

        if (isOnlyWhitespace) {
          // User typed only spaces, clear the input field
          this.tags.set('');
          tagsValue = '';
        }

        this.filterChange.emit({
          titleFilter: this.searchText(),
          minPrice: this.minPrice(),
          maxPrice: this.maxPrice(),
          minRating: this.minRating(),
          tags: tagsValue,
        });
      });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.searchSubscription?.unsubscribe();
    this.tagsSubscription?.unsubscribe();
  }

  protected onSearchTextChange(value: string): void {
    // Push the search text to the subject
    this.searchSubject.next(value);
  }

  protected onTagsChange(value: string): void {
    // Push the tags text to the subject
    this.tagsSubject.next(value);
  }

  protected clearSearch(): void {
    this.searchText.set('');
    // Immediately emit the change when clearing
    this.filterChange.emit({
      titleFilter: '',
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      minRating: this.minRating(),
      tags: this.tags(),
    });
  }

  protected onSortChange(): void {
    this.sortChange.emit({
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    });
  }

  protected onFilterChange(): void {
    this.filterChange.emit({
      titleFilter: this.searchText(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      minRating: this.minRating(),
      tags: this.tags(),
    });
  }

  protected resetFilters(): void {
    this.searchText.set('');
    this.sortBy.set(undefined);
    this.sortOrder.set('ASC');
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
    this.minRating.set(undefined);
    this.tags.set('');
    this.resetAll.emit();
  }
}
