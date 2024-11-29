export const countryOptions = [
  { flag: '🇨🇳', label: '中国', value: 'CN' },
  { flag: '🇺🇸', label: '美国', value: 'US' },
  { flag: '🇵🇭', label: '菲律宾', value: 'PH' },
  { flag: '🇲🇾', label: '马来西亚', value: 'MY' },
  { flag: '🇮🇩', label: '印度尼西亚', value: 'ID' },
  { flag: '🇹🇭', label: '泰国', value: 'TH' },
  { flag: '🇻🇳', label: '越南', value: 'VN' },
  { flag: '🇸🇬', label: '新加坡', value: 'SG' },
] as const;

export type CountryOption = (typeof countryOptions)[number];
export type CountryCode = CountryOption['value'];

export const countryMap = Object.fromEntries(
  countryOptions.map((country) => [country.value, country]),
) as Record<CountryCode, CountryOption>;
