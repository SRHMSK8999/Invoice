// List of currencies with codes and names
export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
];

// Import getDefaultCurrency from useUserPreferences hook
import { getDefaultCurrency } from "@/hooks/useUserPreferences";

// Format currency amount based on currency code or user preferences
export const formatCurrency = (amount: number, currencyCode?: string) => {
  // Use provided currency or get from user preferences
  const currency = currencyCode || getDefaultCurrency();
  
  console.log(`Formatting ${amount} with currency: ${currency}`);
  
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // Fallback if currency code is invalid
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Get currency symbol for a given currency code
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = currencies.find((c) => c.code === currencyCode);
  return currency?.symbol || currencyCode;
};

// Convert amount from one currency to another (placeholder, would require exchange rate API)
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  // In a real implementation, this would call an exchange rate API
  // For now, we'll just return the original amount
  console.warn("Currency conversion is not implemented yet. Using 1:1 exchange rate.");
  return amount;
};
