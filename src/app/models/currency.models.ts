// Currency DTO
export interface CurrencyDto {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  country?: string;
}

// Exchange rate DTO
export interface ExchangeRateDto {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  lastUpdated: Date;
  source: string;
}

// Exchange rates response (bulk rates)
export interface ExchangeRatesResponse {
  baseCurrency: string;
  lastUpdated: Date;
  rates: Record<string, number>;
}

// Currency state for store
export interface CurrencyState {
  currencies: CurrencyDto[];
  rates: ExchangeRatesResponse | null;
  baseCurrency: string;
  selectedCurrencies: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Initial currency state
export const initialCurrencyState: CurrencyState = {
  currencies: [],
  rates: null,
  baseCurrency: 'USD',
  selectedCurrencies: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Currency filter options
export interface CurrencyFilter {
  search?: string;
  codes?: string[];
}
