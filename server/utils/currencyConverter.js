const axios = require('axios');

// Cache for exchange rates
let exchangeRateCache = {};
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Get exchange rates from API
const getExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Check if cache is still valid
    if (cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION && exchangeRateCache[baseCurrency]) {
      return exchangeRateCache[baseCurrency];
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (response.data && response.data.rates) {
      exchangeRateCache[baseCurrency] = response.data.rates;
      cacheTimestamp = Date.now();
      return response.data.rates;
    }
    
    throw new Error('Invalid response from exchange rate API');
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    
    // Return cached data if available, even if expired
    if (exchangeRateCache[baseCurrency]) {
      console.log('Using cached exchange rates');
      return exchangeRateCache[baseCurrency];
    }
    
    // Fallback to basic conversion rates (approximate)
    const fallbackRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      INR: 75,
      BRL: 5.2,
      MXN: 20,
      KRW: 1180,
      SGD: 1.35,
      HKD: 7.8,
      NOK: 8.5,
      SEK: 8.7,
      DKK: 6.3,
      PLN: 3.9,
      CZK: 21.5,
      HUF: 300,
      RUB: 75,
      TRY: 8.5,
      ZAR: 15,
      ILS: 3.2,
      AED: 3.67,
      SAR: 3.75,
      QAR: 3.64,
      KWD: 0.30,
      BHD: 0.38,
      OMR: 0.38,
      JOD: 0.71,
      LBP: 1500,
      EGP: 15.7,
      MAD: 9.1,
      TND: 2.8,
      DZD: 135,
      LYD: 4.5,
      SDG: 55,
      ETB: 45,
      KES: 110,
      UGX: 3500,
      TZS: 2300,
      ZMW: 18,
      BWP: 11,
      SZL: 15,
      LSL: 15,
      MUR: 42,
      SCR: 13.5,
      KMF: 440,
      DJF: 178,
      SOS: 580,
      ERN: 15,
      AOA: 650,
      MZN: 64,
      MWK: 820,
      BIF: 2000,
      RWF: 1000,
      CDF: 2000,
      XAF: 550,
      XOF: 550,
      GMD: 52,
      GNF: 10200,
      SLL: 10200,
      LRD: 155,
      CVE: 100,
      STN: 22,
      GHS: 6.1,
      NGN: 410,
      XAF: 550,
      XOF: 550
    };
    
    console.log('Using fallback exchange rates');
    return fallbackRates;
  }
};

// Convert amount from one currency to another
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return {
        amount: parseFloat(amount),
        rate: 1,
        convertedAmount: parseFloat(amount)
      };
    }

    const rates = await getExchangeRates(fromCurrency);
    
    if (!rates[toCurrency]) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    const rate = rates[toCurrency];
    const convertedAmount = parseFloat(amount) * rate;

    return {
      amount: parseFloat(amount),
      rate: rate,
      convertedAmount: Math.round(convertedAmount * 100) / 100 // Round to 2 decimal places
    };
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    throw new Error(`Failed to convert currency: ${error.message}`);
  }
};

// Get list of supported currencies
const getSupportedCurrencies = () => {
  return [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL',
    'MXN', 'KRW', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF',
    'RUB', 'TRY', 'ZAR', 'ILS', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR',
    'JOD', 'LBP', 'EGP', 'MAD', 'TND', 'DZD', 'LYD', 'SDG', 'ETB', 'KES',
    'UGX', 'TZS', 'ZMW', 'BWP', 'SZL', 'LSL', 'MUR', 'SCR', 'KMF', 'DJF',
    'SOS', 'ERN', 'AOA', 'MZN', 'MWK', 'BIF', 'RWF', 'CDF', 'XAF', 'XOF',
    'GMD', 'GNF', 'SLL', 'LRD', 'CVE', 'STN', 'GHS', 'NGN'
  ];
};

// Format currency amount
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error.message);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

module.exports = {
  getExchangeRates,
  convertCurrency,
  getSupportedCurrencies,
  formatCurrency
};

