import { isEmpty } from "./isEmpty"

/** Default price display locale (Germany-first market). */
export const DEFAULT_PRICE_LOCALE = "de-DE"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const getPriceLocale = (countryCode?: string | null): string => {
  if (countryCode === "de") {
    return "de-DE"
  }
  if (countryCode === "fr") {
    return "fr-FR"
  }
  if (countryCode === "it") {
    return "it-IT"
  }
  if (countryCode === "es") {
    return "es-ES"
  }
  return DEFAULT_PRICE_LOCALE
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = DEFAULT_PRICE_LOCALE,
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}
