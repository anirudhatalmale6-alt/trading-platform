export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}`
}

export function formatChangePercent(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Sample Indian stocks for demo/search
export const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', token: '2885' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', token: '11536' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', token: '1333' },
  { symbol: 'INFY', name: 'Infosys', exchange: 'NSE', token: '1594' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE', token: '4963' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE', token: '1394' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', token: '3045' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE', token: '10604' },
  { symbol: 'ITC', name: 'ITC', exchange: 'NSE', token: '1660' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', token: '1922' },
  { symbol: 'LT', name: 'Larsen & Toubro', exchange: 'NSE', token: '11483' },
  { symbol: 'AXISBANK', name: 'Axis Bank', exchange: 'NSE', token: '5900' },
  { symbol: 'WIPRO', name: 'Wipro', exchange: 'NSE', token: '3787' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', token: '3456' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', exchange: 'NSE', token: '10999' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', exchange: 'NSE', token: '3351' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', exchange: 'NSE', token: '317' },
  { symbol: 'TITAN', name: 'Titan Company', exchange: 'NSE', token: '3506' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', exchange: 'NSE', token: '236' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', exchange: 'NSE', token: '7229' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', exchange: 'NSE', token: '25' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', exchange: 'NSE', token: '3499' },
  { symbol: 'NTPC', name: 'NTPC', exchange: 'NSE', token: '11630' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp', exchange: 'NSE', token: '14977' },
  { symbol: 'ONGC', name: 'ONGC', exchange: 'NSE', token: '2475' },
  { symbol: 'TECHM', name: 'Tech Mahindra', exchange: 'NSE', token: '13538' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', exchange: 'NSE', token: '11532' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', exchange: 'NSE', token: '11723' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', exchange: 'NSE', token: '2031' },
  { symbol: 'COALINDIA', name: 'Coal India', exchange: 'NSE', token: '20374' },
]

// NSE Market indices
export const MARKET_INDICES = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50', token: '99926000', exchange: 'NSE' },
  { symbol: 'SENSEX', name: 'SENSEX', token: '99919000', exchange: 'BSE' },
  { symbol: 'NIFTY BANK', name: 'NIFTY BANK', token: '99926009', exchange: 'NSE' },
  { symbol: 'NIFTY IT', name: 'NIFTY IT', token: '99926013', exchange: 'NSE' },
]
