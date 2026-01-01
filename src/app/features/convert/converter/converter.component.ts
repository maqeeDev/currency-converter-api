import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyStore } from '../../../store/currency.store';
import { ConversionStore } from '../../../store/conversion.store';
import { ConvertRequest, ConvertResponse } from '../../../models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatListModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './converter.component.html',
  styleUrl: './converter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  readonly currencyStore = inject(CurrencyStore);
  readonly conversionStore = inject(ConversionStore);

  convertForm!: FormGroup;
  lastResult = signal<ConvertResponse | null>(null);
  selectedBatchCurrencies = signal<string[]>([]);
  batchResults = signal<ConvertResponse[]>([]);

  popularCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];

  isFavorite = computed(() => {
    const from = this.convertForm?.get('fromCurrency')?.value;
    const to = this.convertForm?.get('toCurrency')?.value;
    if (!from || !to) return false;
    return this.conversionStore.isFavorite()(from, to);
  });

  ngOnInit(): void {
    this.convertForm = this.fb.group({
      fromCurrency: ['USD', Validators.required],
      toCurrency: ['EUR', Validators.required],
      amount: [100, [Validators.required, Validators.min(0.01)]],
    });

    // Load currencies if not loaded
    if (this.currencyStore.currencies().length === 0) {
      this.currencyStore.loadCurrencies();
    }

    // Check for query params (from favorites or history)
    const from = this.route.snapshot.queryParamMap.get('from');
    const to = this.route.snapshot.queryParamMap.get('to');
    if (from) this.convertForm.patchValue({ fromCurrency: from });
    if (to) this.convertForm.patchValue({ toCurrency: to });
  }

  onConvert(): void {
    if (this.convertForm.valid) {
      const request: ConvertRequest = this.convertForm.value;
      this.conversionStore.convert(request);

      // Update last result after conversion
      setTimeout(() => {
        const recent = this.conversionStore.recentConversions();
        if (recent.length > 0) {
          this.lastResult.set(recent[0]);
        }
      }, 500);
    }
  }

  swapCurrencies(): void {
    const from = this.convertForm.get('fromCurrency')?.value;
    const to = this.convertForm.get('toCurrency')?.value;
    this.convertForm.patchValue({
      fromCurrency: to,
      toCurrency: from,
    });
  }

  toggleFavorite(): void {
    const from = this.convertForm.get('fromCurrency')?.value;
    const to = this.convertForm.get('toCurrency')?.value;
    this.conversionStore.toggleFavorite(from, to);
  }

  copyResult(): void {
    const result = this.lastResult();
    if (result) {
      const text = `${result.originalAmount} ${result.fromCurrency} = ${result.convertedAmount} ${result.toCurrency}`;
      navigator.clipboard.writeText(text).then(() => {
        this.snackBar.open('Copied to clipboard', 'Close', { duration: 2000 });
      });
    }
  }

  toggleBatchCurrency(currency: string): void {
    const current = this.selectedBatchCurrencies();
    if (current.includes(currency)) {
      this.selectedBatchCurrencies.set(current.filter((c) => c !== currency));
    } else {
      this.selectedBatchCurrencies.set([...current, currency]);
    }
  }

  batchConvert(): void {
    const amount = this.convertForm.get('amount')?.value;
    const fromCurrency = this.convertForm.get('fromCurrency')?.value;
    const currencies = this.selectedBatchCurrencies();

    if (amount && fromCurrency && currencies.length > 0) {
      const conversions = currencies.map((toCurrency) => ({
        fromCurrency,
        toCurrency,
        amount,
      }));

      this.conversionStore.batchConvert({ conversions });

      // Update batch results
      setTimeout(() => {
        const recent = this.conversionStore.recentConversions();
        this.batchResults.set(recent.slice(0, currencies.length));
      }, 500);
    }
  }

  repeatConversion(conversion: ConvertResponse): void {
    this.convertForm.patchValue({
      fromCurrency: conversion.fromCurrency,
      toCurrency: conversion.toCurrency,
      amount: conversion.originalAmount,
    });
  }

  selectFavorite(from: string, to: string): void {
    this.convertForm.patchValue({
      fromCurrency: from,
      toCurrency: to,
    });
  }
}
