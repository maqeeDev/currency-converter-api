import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';
import { CacheStats } from '../../../models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-admin-cache',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './admin-cache.component.html',
  styleUrl: './admin-cache.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCacheComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  stats = signal<CacheStats | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.adminService.getCacheStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load cache statistics');
        this.isLoading.set(false);
      },
    });
  }

  confirmClearAll(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Clear All Caches',
      message: 'Are you sure you want to clear all cached data? This may temporarily impact performance.',
      confirmText: 'Clear All',
      confirmColor: 'warn',
      icon: 'delete_sweep',
    };

    this.dialog.open(ConfirmDialogComponent, { data: dialogData }).afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.clearAllCaches();
      }
    });
  }

  clearAllCaches(): void {
    this.adminService.clearAllCaches().subscribe({
      next: () => {
        this.snackBar.open('All caches cleared successfully', 'Close', { duration: 3000 });
        this.refresh();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to clear caches', 'Close', { duration: 5000 });
      },
    });
  }

  clearExchangeRates(): void {
    this.adminService.clearCache('rates:*').subscribe({
      next: () => {
        this.snackBar.open('Exchange rates cache cleared', 'Close', { duration: 3000 });
        this.refresh();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to clear cache', 'Close', { duration: 5000 });
      },
    });
  }

  clearCurrencies(): void {
    this.adminService.clearCache('currencies:*').subscribe({
      next: () => {
        this.snackBar.open('Currencies cache cleared', 'Close', { duration: 3000 });
        this.refresh();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to clear cache', 'Close', { duration: 5000 });
      },
    });
  }

  syncRates(): void {
    this.adminService.syncRates().subscribe({
      next: () => {
        this.snackBar.open('Exchange rates synced successfully', 'Close', { duration: 3000 });
        this.refresh();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to sync rates', 'Close', { duration: 5000 });
      },
    });
  }

  getHitRateColor(rate: number): 'primary' | 'accent' | 'warn' {
    if (rate >= 0.8) return 'primary';
    if (rate >= 0.5) return 'accent';
    return 'warn';
  }

  formatDate(date: Date | string): string {
    return format(new Date(date), 'MMM dd, HH:mm');
  }
}
