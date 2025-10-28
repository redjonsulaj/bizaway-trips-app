import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule],
  template: `
    @if (pagination()) {
      <div class="pagination-container">
        <div class="pagination-info">
          <span>
            Showing
            {{ getStartItem() }}-{{ getEndItem() }}
            of {{ pagination()!.totalItems }} trips
          </span>
        </div>

        <div class="pagination-controls">
          <button
            mat-icon-button
            [disabled]="pagination()!.currentPage === 1"
            (click)="pageChange.emit(1)"
            aria-label="First page"
          >
            <mat-icon>first_page</mat-icon>
          </button>

          <button
            mat-icon-button
            [disabled]="pagination()!.currentPage === 1"
            (click)="pageChange.emit(pagination()!.currentPage - 1)"
            aria-label="Previous page"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>

          <span class="page-indicator">
            Page {{ pagination()!.currentPage }} of {{ pagination()!.totalPages }}
          </span>

          <button
            mat-icon-button
            [disabled]="isLastPage()"
            (click)="pageChange.emit(pagination()!.currentPage + 1)"
            aria-label="Next page"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>

          <button
            mat-icon-button
            [disabled]="pagination()!.currentPage === pagination()!.totalPages"
            (click)="pageChange.emit(pagination()!.totalPages)"
            aria-label="Last page"
          >
            <mat-icon>last_page</mat-icon>
          </button>
        </div>

        <div class="items-per-page">
          <label>Items per page:</label>
          <mat-select
            [value]="pagination()!.itemsPerPage"
            (valueChange)="limitChange.emit($event)"
          >
            <mat-option [value]="10">10</mat-option>
            <mat-option [value]="20">20</mat-option>
            <mat-option [value]="50">50</mat-option>
            <mat-option [value]="100">100</mat-option>
          </mat-select>
        </div>
      </div>
    }
  `,
  styles: `
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-top: 24px;
      background-color: var(--mat-sys-surface-container);
      border-radius: 8px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .pagination-info {
      flex: 1;
      min-width: 200px;

      span {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;

      .page-indicator {
        padding: 0 16px;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }
    }

    .items-per-page {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }

      mat-select {
        width: 80px;
      }
    }

    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        align-items: stretch;

        .pagination-info,
        .pagination-controls,
        .items-per-page {
          justify-content: center;
        }
      }
    }
  `,
})
export class PaginationComponent {
  pagination = input<PaginationInfo | null>();
  pageChange = output<number>();
  limitChange = output<number>();

  protected getStartItem(): number {
    const p = this.pagination();
    if (!p) return 0;
    return (p.currentPage - 1) * p.itemsPerPage + 1;
  }

  protected getEndItem(): number {
    const p = this.pagination();
    if (!p) return 0;
    return Math.min(p.currentPage * p.itemsPerPage, p.totalItems);
  }

  protected isLastPage(): boolean {
    const p = this.pagination();
    if (!p) return true;

    // If we're on the declared total pages, or if current page items equal limit but we're on last page
    return p.currentPage >= p.totalPages;
  }
}
