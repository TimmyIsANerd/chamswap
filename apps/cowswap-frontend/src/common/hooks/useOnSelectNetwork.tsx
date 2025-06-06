import { useCallback } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { isRejectRequestProviderError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAddSnackbar } from '@cowprotocol/snackbars'
import { useSwitchNetwork } from '@cowprotocol/wallet'

import { useCloseModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { useSetWalletConnectionError } from 'modules/wallet/hooks/useSetWalletConnectionError'

import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

export function useOnSelectNetwork(): (chainId: SupportedChainId, skipClose?: boolean) => Promise<void> {
  const addSnackbar = useAddSnackbar()
  const closeModal = useCloseModal(ApplicationModal.NETWORK_SELECTOR)
  const setChainIdToUrl = useLegacySetChainIdToUrl()
  const setWalletConnectionError = useSetWalletConnectionError()
  const switchNetwork = useSwitchNetwork()

  return useCallback(
    async (targetChain: SupportedChainId, skipClose?: boolean) => {
      try {
        setWalletConnectionError(undefined)
        await switchNetwork(targetChain)

        setChainIdToUrl(targetChain)
      } catch (error: any) {
        console.error('Failed to switch networks', error)

        if (isRejectRequestProviderError(error)) {
          return
        }

        addSnackbar({
          id: 'failed-network-switch',
          icon: 'alert',
          content: (
            <>
              Failed to switch networks from the Chameleaon swap Interface. In order to use Chameleaon swap on{' '}
              {getChainInfo(targetChain)?.label}, you must change the network in your wallet.
            </>
          ),
        })

        setWalletConnectionError(error.message)
      }

      if (!skipClose) {
        closeModal()
      }
    },
    [switchNetwork, setWalletConnectionError, addSnackbar, closeModal, setChainIdToUrl]
  )
}
