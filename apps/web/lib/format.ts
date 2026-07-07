import { toIntlLocale, type Locale } from "./i18n";

export function formatCompactNumber(value: number, locale: Locale = "en") {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDate(value: string, locale: Locale = "en") {
  if (value === "Not synced") {
    return locale === "zh" ? "未同步" : value;
  }

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
