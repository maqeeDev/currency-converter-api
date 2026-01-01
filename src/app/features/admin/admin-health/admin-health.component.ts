import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { HealthStatus, HealthEntry } from '../../../models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-admin-health',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './admin-health.component.html',
  styleUrl: './admin-health.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHealthComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private refreshSubscription?: Subscription;

  health = signal<HealthStatus | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  lastChecked = signal<Date | null>(null);
  autoRefresh = false;

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.adminService.getHealth().subscribe({
      next: (data) => {
        this.health.set(data);
        this.lastChecked.set(new Date());
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to check health status');
        this.isLoading.set(false);
      },
    });
  }

  toggleAutoRefresh(): void {
    if (this.autoRefresh) {
      this.refreshSubscription = interval(30000).subscribe(() => {
        this.refresh();
      });
    } else {
      this.refreshSubscription?.unsubscribe();
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'check_circle';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'help';
    }
  }

  getComponentIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('database') || lower.includes('sql')) return 'storage';
    if (lower.includes('redis') || lower.includes('cache')) return 'memory';
    if (lower.includes('api') || lower.includes('external')) return 'cloud';
    return 'settings';
  }

  formatLastChecked(): string {
    const checked = this.lastChecked();
    if (!checked) return '';
    return formatDistanceToNow(checked, { addSuffix: true });
  }
}
