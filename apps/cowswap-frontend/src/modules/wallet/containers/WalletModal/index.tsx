import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { errorToString } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, useActivateConnector, ConnectionType } from '@cowprotocol/wallet'

import { useCloseModal, useModalIsOpen } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'
import { useAppDispatch } from 'legacy/state/hooks'
import { updateSelectedWallet } from 'legacy/state/user/reducer'

import { useAccountModalState } from 'modules/account'
import { ReferralService } from 'modules/referral/services/ReferralService'

import { useSetWalletConnectionError } from '../../hooks/useSetWalletConnectionError'
import { useWalletConnectionError } from '../../hooks/useWalletConnectionError'
import { WalletModal as WalletModalPure, WalletModalView } from '../../pure/WalletModal'
import { toggleAccountSelectorModalAtom } from '../AccountSelectorModal/state'

export function WalletModal() {
  const dispatch = useAppDispatch()
  const { account, chainId } = useWalletInfo()
  const setWalletConnectionError = useSetWalletConnectionError()

  const [walletView, setWalletView] = useState<WalletModalView>('options')
  const isPendingView = walletView === 'pending'

  const pendingError = useWalletConnectionError()

  const walletModalOpen = useModalIsOpen(ApplicationModal.WALLET)
  const closeWalletModal = useCloseModal(ApplicationModal.WALLET)
  const toggleAccountSelectorModal = useSetAtom(toggleAccountSelectorModalAtom)

  const openOptions = useCallback(() => setWalletView('options'), [setWalletView])

  const { isOpen: isAccountModalOpen } = useAccountModalState()
  // Wallet changing currently is only possible through the account modal
  const isWalletChangingFlow = isAccountModalOpen

  // Register trader and close modal when wallet is connected
  useEffect(() => {
    if (account && chainId && walletModalOpen) {
      const referralService = ReferralService.getInstance()
      const referralCode = localStorage.getItem('referralCode')

      // Register trader with referral code if available
      referralService
        .registerTrader(account, chainId as SupportedChainId, referralCode || undefined)
        .then(() => {
          console.log('[WalletModal] Trader registered successfully, closing modal')
          closeWalletModal()
        })
        .catch((error) => {
          console.error('[WalletModal] Error registering trader:', error)
          // Still close the modal even if registration fails
          closeWalletModal()
        })
    }
  }, [account, chainId, walletModalOpen, closeWalletModal])

  // Update wallet view when modal opens or account changes
  useEffect(() => {
    if (walletModalOpen) {
      setWalletView(account ? 'account' : 'options')
    }
  }, [walletModalOpen, setWalletView, account])

  // Close modal if account is detected
  useEffect(() => {
    if (account && walletModalOpen && !isPendingView) {
      closeWalletModal()
    }
  }, [account, walletModalOpen, closeWalletModal, isPendingView])

  useEffect(() => {
    if (!isPendingView) {
      setWalletConnectionError(undefined)
    }
  }, [isPendingView, setWalletConnectionError])

  const { tryActivation, retryPendingActivation } = useActivateConnector(
    useMemo(
      () => ({
        skipNetworkChanging: isWalletChangingFlow,
        beforeActivation() {
          setWalletView('pending')
          setWalletConnectionError(undefined)
        },
        afterActivation(isHardWareWallet: boolean, connectionType: ConnectionType) {
          dispatch(updateSelectedWallet({ wallet: connectionType }))

          if (isHardWareWallet) {
            toggleAccountSelectorModal()
          }

          closeWalletModal()
          setWalletView('account')
        },
        onActivationError(error: any) {
          dispatch(updateSelectedWallet({ wallet: undefined }))
          setWalletConnectionError(errorToString(error))
        },
      }),
      [isWalletChangingFlow, closeWalletModal, dispatch, setWalletConnectionError, toggleAccountSelectorModal],
    ),
  )

  return (
    <WalletModalPure
      isOpen={walletModalOpen}
      onDismiss={closeWalletModal}
      openOptions={openOptions}
      pendingError={pendingError}
      tryActivation={tryActivation}
      tryConnection={retryPendingActivation}
      view={walletView}
      account={account}
    />
  )
}
