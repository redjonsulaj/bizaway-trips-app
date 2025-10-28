import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { toast } from 'ngx-sonner';
import { SettingsService } from '../../shared/services/settings.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LocaleCurrencyPipe } from '../../shared/pipes/locale-currency.pipe';
import { LocaleDatePipe } from '../../shared/pipes/locale-date.pipe';
import {
  VerticalTypeConfig,
  LocaleConfig,
  AVAILABLE_LOCALES,
} from '../../shared/models/settings.model';
import { VerticalTypeDialogComponent } from './components/vertical-type-dialog.component';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    LocaleCurrencyPipe,
    LocaleDatePipe,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly localeService = inject(LocaleService);
  private readonly dialog = inject(MatDialog);

  // Expose settings as signals
  protected readonly verticalTypes = this.settingsService.verticalTypes;
  protected readonly currentLocale = this.settingsService.locale;
  protected readonly availableLocales = AVAILABLE_LOCALES;
  protected readonly previewDate = new Date();

  /**
   * Handle locale change
   */
  protected async onLocaleChange(localeCode: string): Promise<void> {
    const locale = this.settingsService.getLocaleByCode(localeCode);

    if (locale) {
      try {
        await this.settingsService.setLocale(locale);
        toast.success(`Locale changed to ${locale.label}`);
      } catch (error) {
        console.error('Error changing locale:', error);
        toast.error('Failed to change locale');
      }
    }
  }

  /**
   * Toggle vertical type enabled status
   */
  protected async onToggleVerticalType(id: string): Promise<void> {
    try {
      await this.settingsService.toggleVerticalType(id);
      const vt = this.settingsService.getVerticalTypeById(id);
      toast.success(
        `${vt?.label} ${vt?.enabled ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      console.error('Error toggling vertical type:', error);
      toast.error('Failed to toggle vertical type');
    }
  }

  /**
   * Open dialog to add new vertical type
   */
  protected openAddVerticalTypeDialog(): void {
    const dialogRef = this.dialog.open(VerticalTypeDialogComponent, {
      width: '500px',
      data: { mode: 'add' },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.settingsService.addVerticalType(result);
          toast.success(`Vertical type "${result.label}" added`);
        } catch (error) {
          console.error('Error adding vertical type:', error);
          toast.error('Failed to add vertical type');
        }
      }
    });
  }

  /**
   * Open dialog to edit existing vertical type
   */
  protected openEditVerticalTypeDialog(verticalType: VerticalTypeConfig): void {
    const dialogRef = this.dialog.open(VerticalTypeDialogComponent, {
      width: '500px',
      data: { mode: 'edit', verticalType },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.settingsService.updateVerticalType(verticalType.id, result);
          toast.success(`Vertical type "${result.label}" updated`);
        } catch (error) {
          console.error('Error updating vertical type:', error);
          toast.error('Failed to update vertical type');
        }
      }
    });
  }

  /**
   * Delete vertical type
   */
  protected async onDeleteVerticalType(verticalType: VerticalTypeConfig): Promise<void> {
    if (confirm(`Are you sure you want to delete "${verticalType.label}"?`)) {
      try {
        await this.settingsService.deleteVerticalType(verticalType.id);
        toast.success(`Vertical type "${verticalType.label}" deleted`);
      } catch (error) {
        console.error('Error deleting vertical type:', error);
        toast.error('Failed to delete vertical type');
      }
    }
  }
}
