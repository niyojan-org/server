export interface FeeConfig {
  platformFeePercent?: number;
  platformFeeFlat?: number;
  gatewayFeePercent?: number;
  gatewayFeeFlat?: number;
  taxPercent?: number;
  taxFlat?: number;
}

export interface FeeBreakdown {
  gatewayFee: number;
  platformFee: number;
  tax: number;
}
