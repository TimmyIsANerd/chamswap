import '@reach/dialog/styles.css'
import 'inter-ui'
import './sentry'
import { Provider as AtomProvider } from 'jotai'
import { ReactNode, StrictMode } from 'react'

import { CowAnalyticsProvider } from '@cowprotocol/analytics'
import { nodeRemoveChildFix } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SnackbarsWidget } from '@cowprotocol/snackbars'
import { Web3Provider } from '@cowprotocol/wallet'

import { LanguageProvider } from 'i18n'
import { createRoot } from 'react-dom/client'
import SvgCacheProvider from 'react-inlinesvg/provider'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import * as serviceWorkerRegistration from 'serviceWorkerRegistration'
import { ThemedGlobalStyle, ThemeProvider } from 'theme'

import { cowSwapStore } from 'legacy/state'
import { useAppSelector } from 'legacy/state/hooks'

import { cowAnalytics } from 'modules/analytics'
import { App } from 'modules/application/containers/App'
import { Updaters } from 'modules/application/containers/App/Updaters'
import { WithLDProvider } from 'modules/application/containers/WithLDProvider'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { APP_HEADER_ELEMENT_ID } from '../common/constants/common'
import { WalletUnsupportedNetworkBanner } from '../common/containers/WalletUnsupportedNetworkBanner'
import { BlockNumberProvider } from '../common/hooks/useBlockNumber'

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function Main() {
  return (
    <StrictMode>
      <SvgCacheProvider>
        <Provider store={cowSwapStore}>
          <AtomProvider store={jotaiStore}>
            <BrowserRouter>
              <LanguageProvider>
                <Web3ProviderInstance>
                  <ThemeProvider>
                    <ThemedGlobalStyle />
                    <BlockNumberProvider>
                      <WithLDProvider>
                        <CowAnalyticsProvider cowAnalytics={cowAnalytics}>
                          <WalletUnsupportedNetworkBanner />
                          <Updaters />

                          <Toasts />
                          <App />
                        </CowAnalyticsProvider>
                      </WithLDProvider>
                    </BlockNumberProvider>
                  </ThemeProvider>
                </Web3ProviderInstance>
              </LanguageProvider>
            </BrowserRouter>
          </AtomProvider>
        </Provider>
      </SvgCacheProvider>
    </StrictMode>
  )
}

function Web3ProviderInstance({ children }: { children: ReactNode }) {
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)
  const { standaloneMode } = useInjectedWidgetParams()

  return (
    <Web3Provider standaloneMode={standaloneMode} selectedWallet={selectedWallet}>
      {children}
    </Web3Provider>
  )
}

function Toasts() {
  const { disableToastMessages = false } = useInjectedWidgetParams()

  return <SnackbarsWidget hidden={disableToastMessages} anchorElementId={APP_HEADER_ELEMENT_ID} />
}

const container = document.getElementById('root')
if (container !== null) {
  const root = createRoot(container)
  root.render(<Main />)
} else {
  console.error('Failed to find the root element')
}

if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
  serviceWorkerRegistration.register()
}
