import React, { useState, useEffect } from 'react';
import { CurrencyContext } from './currencyCtx';

const RATE = 41.5; // 1 USD = 41.5 UAH (adjust as needed)

export default function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'UAH' : 'USD');
  };

  const convert = (price) => {
    const numeric = typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : Number(price);
    if (isNaN(numeric)) return null;
    if (currency === 'UAH') return numeric * RATE;
    return numeric;
  };

  const format = (price) => {
    const converted = convert(price);
    if (converted === null) return '';
    const symbol = currency === 'UAH' ? '₴' : '$';
    return `${converted.toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}
