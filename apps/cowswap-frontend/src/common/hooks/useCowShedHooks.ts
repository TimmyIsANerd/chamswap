import { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

export function useCowShedHooks() {
  const { chainId } = useWalletInfo()

  return useSWR([chainId, 'CowShedHooks'], ([chainId]) => {
    return new CowShedHooks(chainId)
  }).data
}
