import { useContext } from 'react';
import { CurrencyContext } from '../contexts/currencyCtx';

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider');
  return ctx;
}
