import { ReactNode } from 'react'

import { Provider } from 'lib/i18n'

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>
}
