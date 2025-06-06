import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import ms from 'ms.macro'
import useSWR, { SWRResponse } from 'swr'

import { useWalletInfo } from '../hooks'

export type WalletCapabilities = {
  atomicBatch?: { supported: boolean }
}

const requestTimeout = ms`10s`

export function useWalletCapabilities(): SWRResponse<WalletCapabilities | undefined> {
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()

  return useSWR(
    provider && account && chainId ? [provider, account, chainId] : null,
    ([provider, account, chainId]) => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(undefined)
        }, requestTimeout)

        provider
          .send('wallet_getCapabilities', [account])
          .then((result: { [chainIdHex: string]: WalletCapabilities }) => {
            clearInterval(timeout)

            if (!result) {
              resolve(undefined)
              return
            }

            const chainIdHex = '0x' + (+chainId).toString(16)

            resolve(result[chainIdHex])
          })
          .catch(() => {
            clearInterval(timeout)
            resolve(undefined)
          })
      })
    },
    SWR_NO_REFRESH_OPTIONS,
  )
}
