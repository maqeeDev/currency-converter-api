import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyStore } from '../../../store/currency.store';
import { CurrencyDto } from '../../../models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-currency-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './currency-list.component.html',
  styleUrl: './currency-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyListComponent implements OnInit {
  readonly currencyStore = inject(CurrencyStore);

  displayedColumns = ['code', 'symbol', 'name', 'country', 'decimalPlaces'];
  searchTerm = '';
  pageSize = signal(20);
  pageIndex = signal(0);
  sortField = signal<string>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  filteredCurrencies = computed(() => {
    let currencies = [...this.currencyStore.currencies()];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      currencies = currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(term) ||
          c.name.toLowerCase().includes(term) ||
          c.country?.toLowerCase().includes(term)
      );
    }

    // Sort
    const field = this.sortField() as keyof CurrencyDto;
    const direction = this.sortDirection();
    currencies.sort((a, b) => {
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';
      const comparison = String(aVal).localeCompare(String(bVal));
      return direction === 'asc' ? comparison : -comparison;
    });

    return currencies;
  });

  paginatedCurrencies = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredCurrencies().slice(start, end);
  });

  ngOnInit(): void {
    if (this.currencyStore.currencies().length === 0) {
      this.currencyStore.loadCurrencies();
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.pageIndex.set(0);
  }

  sortChange(sort: Sort): void {
    this.sortField.set(sort.active || 'code');
    this.sortDirection.set((sort.direction as 'asc' | 'desc') || 'asc');
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  refresh(): void {
    this.currencyStore.loadCurrencies();
  }
}
