// Convert request
export interface ConvertRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

// Convert response
export interface ConvertResponse {
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: Date;
}

// Batch convert request
export interface BatchConvertRequest {
  conversions: ConvertRequest[];
}

// Batch convert response
export interface BatchConvertResponse {
  conversions: ConvertResponse[];
  successCount: number;
  failedCount: number;
  errors?: string[];
}

// Conversion history DTO
export interface ConversionHistoryDto {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  status: 'Completed' | 'Failed';
  createdAt: Date;
}

// Favorite currency pair
export interface FavoritePair {
  fromCurrency: string;
  toCurrency: string;
}

// Conversion state for store
export interface ConversionState {
  recentConversions: ConvertResponse[];
  history: ConversionHistoryDto[];
  favorites: FavoritePair[];
  isLoading: boolean;
  isConverting: boolean;
  error: string | null;
  totalHistoryCount: number;
  currentPage: number;
  pageSize: number;
}

// Initial conversion state
export const initialConversionState: ConversionState = {
  recentConversions: [],
  history: [],
  favorites: [],
  isLoading: false,
  isConverting: false,
  error: null,
  totalHistoryCount: 0,
  currentPage: 1,
  pageSize: 10,
};

// Conversion history filter
export interface ConversionHistoryFilter {
  startDate?: Date;
  endDate?: Date;
  fromCurrency?: string;
  toCurrency?: string;
  minAmount?: number;
  maxAmount?: number;
}
