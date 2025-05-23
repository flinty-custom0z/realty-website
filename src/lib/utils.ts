/**
 * Format a phone number to a more readable format with dashes
 * Example: +79385154439 → +7-938-515-44-39
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 11 && digits.startsWith('7')) { // Russian format
    // +7-XXX-XXX-XX-XX
    return `+7-${digits.substr(1, 3)}-${digits.substr(4, 3)}-${digits.substr(7, 2)}-${digits.substr(9, 2)}`;
  }
  
  return phone; // Return original if not matching expected format
}

/**
 * Format a number with thousands separators using Russian locale
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU');
}

/**
 * Format price to Russian ruble format
 * @param price The price to format
 * @param includeCurrency Whether to include the currency symbol (₽), defaults to true
 */
export function formatPrice(price: number, includeCurrency = true): string {
  const formattedNumber = price.toLocaleString('ru-RU');
  return includeCurrency ? `${formattedNumber} ₽` : formattedNumber;
}

/**
 * Format date to Russian format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ru-RU');
}

/**
 * Calculate how long ago a date was
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} ${pluralize(diffDays, ['день', 'дня', 'дней'])} назад`;
  } else if (diffHours > 0) {
    return `${diffHours} ${pluralize(diffHours, ['час', 'часа', 'часов'])} назад`;
  } else if (diffMins > 0) {
    return `${diffMins} ${pluralize(diffMins, ['минуту', 'минуты', 'минут'])} назад`;
  } else {
    return 'только что';
  }
}

/**
 * Russian plural form helper
 */
function pluralize(count: number, forms: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
  return forms[index];
} 