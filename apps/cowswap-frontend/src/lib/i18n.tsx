import { ReactNode, useEffect } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from '@cowprotocol/common-const'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import {
  af, ar, ca, cs, da, de, el, en, es, fi, fr, he, hu,
  id, it, ja, ko, nl, no, pl, pt, ro, ru, sr, sv, sw, tr, uk, vi, zh,
} from 'make-plural/plurals'
import { PluralCategory } from 'make-plural/plurals'

type LocalePlural = {
  [key in SupportedLocale]: (n: number | string, ord?: boolean) => PluralCategory
}

const plurals: LocalePlural = {
  'af-ZA': af,
  'ar-SA': ar,
  'ca-ES': ca,
  'cs-CZ': cs,
  'da-DK': da,
  'de-DE': de,
  'el-GR': el,
  'en-US': en,
  'es-ES': es,
  'fi-FI': fi,
  'fr-FR': fr,
  'he-IL': he,
  'hu-HU': hu,
  'id-ID': id,
  'it-IT': it,
  'ja-JP': ja,
  'ko-KR': ko,
  'nl-NL': nl,
  'no-NO': no,
  'pl-PL': pl,
  'pt-BR': pt,
  'pt-PT': pt,
  'ro-RO': ro,
  'ru-RU': ru,
  'sr-SP': sr,
  'sv-SE': sv,
  'sw-TZ': sw,
  'tr-TR': tr,
  'uk-UA': uk,
  'vi-VN': vi,
  'zh-CN': zh,
  'zh-TW': zh,
  pseudo: en,
}

// Import all .po files dynamically (lazy-load compatible with all Vite setups)
const localeFiles = import.meta.glob('../locales/*.po')

export async function dynamicActivate(locale: SupportedLocale) {
  // i18n.loadLocaleData(locale, { plurals: plurals[locale] })

  try {
    const importPath = `../locales/${locale}.po`
    const loader = localeFiles[importPath]
    if (!loader) throw new Error(`Locale file not found: ${importPath}`)

    const catalogModule = await loader() as { messages?: object; default?: { messages?: object } }
    const messages = catalogModule.messages || catalogModule.default?.messages || {}

    i18n.load(locale, messages)
    i18n.activate(locale)
  } catch (error) {
    console.error('Could not load locale file: ' + locale, error)
  }
}

interface ProviderProps {
  locale: SupportedLocale
  onActivate?: (locale: SupportedLocale) => void
  children: ReactNode
}

export function Provider({ locale, onActivate, children }: ProviderProps) {
  useEffect(() => {
    dynamicActivate(locale)
      .then(() => onActivate?.(locale))
      .catch((error) => {
        console.error('Failed to activate locale', locale, error)
      })
  }, [locale, onActivate])

  if (i18n.locale === undefined && locale === DEFAULT_LOCALE) {
    i18n.loadLocaleData(DEFAULT_LOCALE, { plurals: plurals[DEFAULT_LOCALE] })
    i18n.load(DEFAULT_LOCALE, {})
    i18n.activate(DEFAULT_LOCALE)
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
