import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyStore } from '../../../store/currency.store';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-currency-rates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './currency-rates.component.html',
  styleUrl: './currency-rates.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyRatesComponent implements OnInit {
  readonly currencyStore = inject(CurrencyStore);
  private readonly snackBar = inject(MatSnackBar);

  searchTerm = '';

  ngOnInit(): void {
    // Load currencies if not loaded
    if (this.currencyStore.currencies().length === 0) {
      this.currencyStore.loadCurrencies();
    }
    // Load rates
    this.currencyStore.loadRates();
  }

  filteredRates(): { code: string; rate: number }[] {
    const rates = this.currencyStore.ratesArray();
    if (!this.searchTerm) return rates;

    const term = this.searchTerm.toLowerCase();
    return rates.filter((r) => r.code.toLowerCase().includes(term));
  }

  onBaseCurrencyChange(currency: string): void {
    this.currencyStore.setBaseCurrency(currency);
    this.currencyStore.loadRates(currency);
  }

  refresh(): void {
    this.currencyStore.loadRates();
  }

  copyRate(rate: { code: string; rate: number }): void {
    const text = `1 ${this.currencyStore.baseCurrency()} = ${rate.rate} ${rate.code}`;
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Rate copied to clipboard', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    });
  }

  formatLastUpdated(): string {
    const lastUpdated = this.currencyStore.lastUpdated();
    if (!lastUpdated) return '';
    return formatDistanceToNow(new Date(lastUpdated), { addSuffix: true });
  }
}
