import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConversionStore } from '../../../store/conversion.store';
import { CurrencyStore } from '../../../store/currency.store';
import { ConversionHistoryFilter, PaginationParams } from '../../../models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { format } from 'date-fns';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit {
  readonly conversionStore = inject(ConversionStore);
  readonly currencyStore = inject(CurrencyStore);

  displayedColumns = ['createdAt', 'fromCurrency', 'originalAmount', 'toCurrency', 'convertedAmount', 'exchangeRate', 'status'];

  filters: ConversionHistoryFilter = {};

  ngOnInit(): void {
    // Load currencies for filter dropdowns
    if (this.currencyStore.currencies().length === 0) {
      this.currencyStore.loadCurrencies();
    }

    // Load history
    this.loadHistory();
  }

  loadHistory(): void {
    const params: PaginationParams = {
      pageNumber: this.conversionStore.currentPage(),
      pageSize: this.conversionStore.pageSize(),
    };
    this.conversionStore.loadHistory({ params, filters: this.filters });
  }

  applyFilters(): void {
    this.conversionStore.setPage(1);
    this.loadHistory();
  }

  clearFilters(): void {
    this.filters = {};
    this.applyFilters();
  }

  refresh(): void {
    this.loadHistory();
  }

  onPageChange(event: PageEvent): void {
    this.conversionStore.setPage(event.pageIndex + 1);
    this.conversionStore.setPageSize(event.pageSize);
    this.loadHistory();
  }

  formatDate(date: Date | string): string {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  }

  exportToCsv(): void {
    const history = this.conversionStore.history();
    if (history.length === 0) return;

    const headers = ['Date', 'From', 'Amount', 'To', 'Result', 'Rate', 'Status'];
    const rows = history.map((item) => [
      this.formatDate(item.createdAt),
      item.fromCurrency,
      item.originalAmount,
      item.toCurrency,
      item.convertedAmount,
      item.exchangeRate,
      item.status,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversion-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
