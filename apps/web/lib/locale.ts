import { cookies } from "next/headers";
import { dictionary, isSupportedLocale, localeCookieName, type Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeCookieName)?.value;
  return isSupportedLocale(value) ? value : "en";
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionary[locale] };
}
