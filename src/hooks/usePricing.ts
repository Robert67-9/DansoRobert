import { useCallback, useEffect, useState } from 'react';

/**
 * Resume-unlock pricing as served by the API. The admin discount lives on the
 * server so the public price shown here always matches what checkout charges.
 */
export interface PricingInfo {
  basePriceUsd: number;
  discountPercent: number;
  discountActive: boolean;
  finalPriceUsd: number;
  hasDiscount: boolean;
}

export const FALLBACK_PRICING: PricingInfo = {
  basePriceUsd: 0.5,
  discountPercent: 0,
  discountActive: false,
  finalPriceUsd: 0.5,
  hasDiscount: false,
};

/** Format a USD amount the way the portfolio displays it (e.g. "$0.50", "$1.13"). */
export const formatUsd = (amount: number): string => {
  const rounded = Math.round(amount * 100) / 100;
  const decimals = Number.isInteger(rounded) ? 0 : 2;
  return `$${rounded.toFixed(decimals)}`;
};

export const normalizePricing = (payload: unknown): PricingInfo => {
  if (!payload || typeof payload !== 'object') return FALLBACK_PRICING;
  const record = payload as Record<string, unknown>;
  const basePriceUsd = typeof record.basePriceUsd === 'number' ? record.basePriceUsd : FALLBACK_PRICING.basePriceUsd;
  const discountPercent = typeof record.discountPercent === 'number' ? record.discountPercent : 0;
  const finalPriceUsd = typeof record.finalPriceUsd === 'number'
    ? record.finalPriceUsd
    : Math.max(0, Math.round(basePriceUsd * (1 - discountPercent / 100) * 100) / 100);
  return {
    basePriceUsd,
    discountPercent,
    discountActive: record.discountActive === true && discountPercent > 0,
    finalPriceUsd,
    hasDiscount: record.hasDiscount === true && discountPercent > 0,
  };
};

/**
 * Loads the active resume-unlock price and exposes a refresh callback so the
 * admin discount manager can update the price shown across the portfolio.
 */
export const usePricing = () => {
  const [pricing, setPricing] = useState<PricingInfo>(FALLBACK_PRICING);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPricing = useCallback(async () => {
    try {
      const response = await fetch('/api/pricing', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Pricing request failed (${response.status})`);
      const payload: unknown = await response.json();
      setPricing(normalizePricing(payload));
    } catch {
      setPricing(FALLBACK_PRICING);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPricing();
  }, [refreshPricing]);

  return { pricing, isLoading, refreshPricing };
};
