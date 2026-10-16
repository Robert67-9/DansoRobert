import { useCallback, useEffect, useState } from 'react';
import { FALLBACK_PRICING, normalizePricing } from './usePricing';
import type { PricingInfo } from './usePricing';

/**
 * Admin view of the resume-unlock discount. The server keeps the public price
 * and the admin discount in the same place, so applying a change here returns
 * the exact pricing payload the portfolio should now display.
 */
export interface AdminPricing extends PricingInfo {
  updatedAt?: string;
}

export const MAX_DISCOUNT_PERCENT = 90;

const toAdminPricing = (payload: unknown): AdminPricing => {
  const base = normalizePricing(payload);
  const record = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  return {
    ...base,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
  };
};

interface UseAdminDiscountOptions {
  /** Whether the owner session is active; the admin endpoints require it. */
  enabled: boolean;
}

/**
 * Loads, applies and clears the resume-unlock discount through the owner-only
 * pricing endpoints. Every successful write returns the fresh pricing payload,
 * which the caller forwards to `refreshPricing` so the whole portfolio updates.
 */
export const useAdminDiscount = ({ enabled }: UseAdminDiscountOptions) => {
  const [pricing, setPricing] = useState<AdminPricing>(FALLBACK_PRICING);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDiscount = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/pricing', { headers: { Accept: 'application/json' } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Could not load the discount (${response.status}).`);
      setPricing(toAdminPricing(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the discount.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const saveDiscount = useCallback(async (discountPercent: number, discountActive: boolean) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercent, discountActive }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Could not save the discount (${response.status}).`);
      const next = toAdminPricing(data);
      setPricing(next);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the discount.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clearDiscount = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/pricing', { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Could not remove the discount (${response.status}).`);
      const next = toAdminPricing(data);
      setPricing(next);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the discount.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    void loadDiscount();
  }, [loadDiscount]);

  return { pricing, isLoading, isSaving, error, loadDiscount, saveDiscount, clearDiscount };
};
