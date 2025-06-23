import { useEffect, useState, useCallback } from 'react'

import { ButtonPrimary } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import http from 'utils/http'

interface ReferralPopupProps {
  referralCode: string
  onClose: () => void
}

export function ReferralPopup({ referralCode, onClose }: ReferralPopupProps) {
  // Use useWalletInfo instead of useWeb3React to match the navbar implementation
  const { account } = useWalletInfo()
  const toggleWalletModal = useToggleWalletModal()
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  // Store referral code in localStorage when popup opens
  useEffect(() => {
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode)
      console.log('[ReferralPopup] Stored referral code:', referralCode)
    }
  }, [referralCode])

  // Check if wallet is connected
  const isWalletConnected = Boolean(account)

  // Register referral directly with API when wallet is connected
  const registerReferral = useCallback(async () => {
    if (!account || !referralCode || isRegistering || registrationComplete) {
      return
    }

    try {
      setIsRegistering(true)
      setRegistrationError(null)
      console.log('[ReferralPopup] Registering referral for account:', account)

      // Use the same API endpoint as in Web3Status
      try {
        const response = await http.post(
          '/connect_wallet',
          {
            wallet_address: account,
            reffer_by: referralCode,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (response?.status === 200) {
          console.log('[ReferralPopup] Wallet connected successfully with referral')
          setRegistrationComplete(true)

          // Store registration status in localStorage to avoid duplicate registrations
          localStorage.setItem('referralRegistered', 'true')
          localStorage.setItem('referralRegisteredAt', Date.now().toString())
        } else {
          console.warn('[ReferralPopup] Unexpected response from connect_wallet endpoint')
          setRegistrationError('Unexpected response from server')
        }
      } catch (err) {
        console.error('[ReferralPopup] Failed to connect wallet:', err)
        let errorMsg = 'Failed to register referral'
        if (err && typeof err === 'object') {
          if ('message' in err && typeof (err as any).message === 'string') {
            errorMsg = (err as any).message
          } else if ('response' in err && (err as any).response?.data?.message) {
            errorMsg = (err as any).response.data.message
          }
        }
        setRegistrationError(errorMsg)
      }
    } finally {
      setIsRegistering(false)
    }
  }, [account, referralCode, isRegistering, registrationComplete])

  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (!isWalletConnected) {
      // If wallet is not connected, open the wallet modal
      console.log('[ReferralPopup] Opening wallet modal')
      toggleWalletModal()
    } else if (registrationComplete) {
      // If registration is complete, close the popup
      console.log('[ReferralPopup] Registration complete, closing popup')
      onClose()
    } else {
      // If wallet is connected but registration is not complete, register the referral
      console.log('[ReferralPopup] Initiating registration')
      registerReferral()
    }
  }, [isWalletConnected, toggleWalletModal, registrationComplete, onClose, registerReferral])

  // Attempt to register referral when wallet is connected
  useEffect(() => {
    if (isWalletConnected && !registrationComplete && !isRegistering) {
      registerReferral()
    }
  }, [isWalletConnected, registrationComplete, isRegistering, registerReferral])

  // Close popup when registration is complete
  useEffect(() => {
    if (registrationComplete && isWalletConnected) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000) // Close after 2 seconds to show success state

      return () => clearTimeout(timer)
    }

    return
  }, [registrationComplete, isWalletConnected, onClose])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
          backgroundColor: 'var(--cow-color-paper)',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--cow-color-text)',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
        >
          ✕
        </button>

        <h2
          style={{
            color: 'var(--cow-color-text)',
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: '600',
          }}
        >
          {registrationComplete ? 'Referral Registration Complete!' : 'Referral Code Detected'}
        </h2>

        {!registrationComplete && (
          <>
            <p
              style={{
                color: 'var(--cow-color-secondary)',
                marginBottom: '24px',
                fontSize: '16px',
                lineHeight: 1.5,
              }}
            >
              You've been invited to join with referral code: <strong>{referralCode}</strong>
            </p>
            <p
              style={{
                color: 'var(--cow-color-secondary)',
                marginBottom: '24px',
                fontSize: '16px',
                lineHeight: 1.5,
              }}
            >
              {isWalletConnected
                ? 'Click the button below to register your wallet with this referral code'
                : 'Connect your wallet to complete the referral registration and start earning rewards!'}
            </p>
          </>
        )}

        {registrationComplete && (
          <p
            style={{
              color: 'var(--cow-color-success)',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: 1.5,
            }}
          >
            Your wallet has been successfully registered with the referral code. You can now start earning rewards!
          </p>
        )}

        {registrationError && (
          <p
            style={{
              color: 'var(--cow-color-danger)',
              marginBottom: '24px',
              fontSize: '14px',
              lineHeight: 1.5,
              padding: '12px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderRadius: '8px',
            }}
          >
            Error: {registrationError}
          </p>
        )}

        <ButtonPrimary
          onClick={handleButtonClick}
          disabled={isRegistering}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            opacity: isRegistering ? 0.7 : 1,
          }}
        >
          {!isWalletConnected
            ? 'Connect Wallet'
            : registrationComplete
              ? 'Close'
              : isRegistering
                ? 'Registering...'
                : 'Register Referral'}
        </ButtonPrimary>
      </div>
    </div>
  )
}
