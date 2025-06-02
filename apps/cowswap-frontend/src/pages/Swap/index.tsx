import { useState, useEffect } from 'react'

import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Navigate, useLocation, useParams } from 'react-router-dom'

import { ReferralPopup } from 'modules/referral/components/ReferralPopup'
import { SwapUpdaters, SwapWidget } from 'modules/swap'
import { getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'

export function SwapPage() {
  const params = useParams()
  const location = useLocation()
  const [showReferralPopup, setShowReferralPopup] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      setShowReferralPopup(true)
    }
  }, [location.search])

  if (!params.chainId) {
    return <SwapPageRedirect />
  }

  return (
    <>
      <SwapUpdaters />
      <SwapWidget />
      {showReferralPopup && referralCode && (
        <ReferralPopup referralCode={referralCode} onClose={() => setShowReferralPopup(false)} />
      )}
    </>
  )
}

function SwapPageRedirect() {
  const { chainId } = useWalletInfo()
  const location = useLocation()

  if (!chainId) return null

  const defaultState = getDefaultTradeRawState(chainId)
  const searchParams = new URLSearchParams(location.search)
  const inputCurrencyId = searchParams.get('inputCurrency') || defaultState.inputCurrencyId || WETH[chainId]?.symbol
  const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId || undefined

  searchParams.delete('inputCurrency')
  searchParams.delete('outputCurrency')
  searchParams.delete('chain')

  const pathname = parameterizeTradeRoute(
    {
      chainId: String(chainId),
      inputCurrencyId,
      outputCurrencyId,
      inputCurrencyAmount: undefined,
      outputCurrencyAmount: undefined,
      orderKind: undefined,
    },
    Routes.SWAP,
  )

  return <Navigate to={{ ...location, pathname, search: searchParams.toString() }} />
}
