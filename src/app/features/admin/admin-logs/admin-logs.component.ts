import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';
import { LogEntry, LogFilter, PaginationParams } from '../../../models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './admin-logs.component.html',
  styleUrl: './admin-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLogsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  logs = signal<LogEntry[]>([]);
  totalCount = signal(0);
  pageSize = signal(25);
  pageIndex = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  filters: LogFilter = {};

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: PaginationParams = {
      pageNumber: this.pageIndex() + 1,
      pageSize: this.pageSize(),
    };

    this.adminService.getLogs(params, this.filters).subscribe({
      next: (response) => {
        this.logs.set(response.items);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load logs');
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.loadLogs();
  }

  clearFilters(): void {
    this.filters = {};
    this.applyFilters();
  }

  refresh(): void {
    this.loadLogs();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadLogs();
  }

  confirmClearLogs(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Clear All Logs',
      message: 'Are you sure you want to delete all logs? This action cannot be undone.',
      confirmText: 'Clear All',
      confirmColor: 'warn',
      icon: 'delete_forever',
    };

    this.dialog.open(ConfirmDialogComponent, { data: dialogData }).afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.clearLogs();
      }
    });
  }

  clearLogs(): void {
    this.adminService.clearLogs().subscribe({
      next: () => {
        this.snackBar.open('Logs cleared successfully', 'Close', { duration: 3000 });
        this.loadLogs();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to clear logs', 'Close', { duration: 5000 });
      },
    });
  }

  exportLogs(): void {
    this.adminService.exportLogs(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to export logs', 'Close', { duration: 5000 });
      },
    });
  }

  getLevelClass(level: string): string {
    return level.toLowerCase();
  }

  formatDate(date: Date | string): string {
    return format(new Date(date), 'MMM dd, yyyy HH:mm:ss');
  }
}
