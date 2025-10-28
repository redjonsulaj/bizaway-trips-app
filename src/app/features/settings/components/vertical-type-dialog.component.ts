import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { VerticalTypeConfig } from '../../../shared/models/settings.model';

interface DialogData {
  mode: 'add' | 'edit';
  verticalType?: VerticalTypeConfig;
}

/**
 * Common Material icons for vertical types
 */
const AVAILABLE_ICONS = [
  'hotel',
  'flight',
  'directions_car',
  'train',
  'directions_boat',
  'directions_bus',
  'local_taxi',
  'two_wheeler',
  'directions_bike',
  'hiking',
  'restaurant',
  'local_activity',
  'beach_access',
  'ski_resort',
  'sports_tennis',
  'golf_course',
  'casino',
  'nightlife',
  'shopping_cart',
  'spa',
];

@Component({
  selector: 'app-vertical-type-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'add' ? 'Add' : 'Edit' }} Vertical Type
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="vertical-type-form">
        <mat-form-field appearance="outline">
          <mat-label>ID</mat-label>
          <input
            matInput
            formControlName="id"
            placeholder="e.g., hotel, flight, car_rental"
            [readonly]="data.mode === 'edit'"
          />
          <mat-icon matPrefix>fingerprint</mat-icon>
          @if (form.get('id')?.hasError('required')) {
            <mat-error>ID is required</mat-error>
          }
          @if (form.get('id')?.hasError('pattern')) {
            <mat-error>
              ID must be lowercase letters, numbers, and underscores only
            </mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Label</mat-label>
          <input
            matInput
            formControlName="label"
            placeholder="e.g., Hotel, Flight, Car Rental"
          />
          <mat-icon matPrefix>label</mat-icon>
          @if (form.get('label')?.hasError('required')) {
            <mat-error>Label is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Icon</mat-label>
          <mat-select formControlName="icon">
            @for (icon of availableIcons; track icon) {
              <mat-option [value]="icon">
                <div class="icon-option">
                  <mat-icon>{{ icon }}</mat-icon>
                  <span>{{ icon }}</span>
                </div>
              </mat-option>
            }
          </mat-select>
          <mat-icon matPrefix>{{ selectedIcon() }}</mat-icon>
          @if (form.get('icon')?.hasError('required')) {
            <mat-error>Icon is required</mat-error>
          }
        </mat-form-field>

        <mat-slide-toggle formControlName="enabled">
          Enabled
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="form.invalid"
      >
        {{ data.mode === 'add' ? 'Add' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .vertical-type-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding: 16px 0;
    }

    mat-form-field {
      width: 100%;
    }

    .icon-option {
      display: flex;
      align-items: center;
      gap: 12px;

      mat-icon {
        color: var(--mat-sys-primary);
      }

      span {
        font-family: monospace;
      }
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `,
})
export class VerticalTypeDialogComponent implements OnInit {
  protected readonly dialogRef = inject(MatDialogRef<VerticalTypeDialogComponent>);
  protected readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  protected readonly availableIcons = AVAILABLE_ICONS;
  protected readonly selectedIcon = signal<string>('hotel');

  protected readonly form = this.fb.group({
    id: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-z0-9_]+$/), // lowercase, numbers, underscores only
      ],
    ],
    label: ['', Validators.required],
    icon: ['', Validators.required],
    enabled: [true],
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.verticalType) {
      const vt = this.data.verticalType;
      this.form.patchValue({
        id: vt.id,
        label: vt.label,
        icon: vt.icon,
        enabled: vt.enabled,
      });
      this.selectedIcon.set(vt.icon);
    }

    // Update selected icon when form value changes
    this.form.get('icon')?.valueChanges.subscribe((icon) => {
      if (icon) {
        this.selectedIcon.set(icon);
      }
    });
  }

  protected onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
