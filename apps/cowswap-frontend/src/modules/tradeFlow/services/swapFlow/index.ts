import { getAddress, reportPermitWithDefaultSigner, getWrappedToken } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { UiOrderType } from '@cowprotocol/types'
import { Percent, Token } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { emitPostedOrderEvent } from 'modules/orders'
import { callDataContainsPermitSigner, handlePermit } from 'modules/permit'
import { FeeVerificationService } from 'modules/swap/services/feeVerificationService'
import { TransactionService } from 'modules/swap/services/transactionService'
import { SystemSettingsService } from 'modules/system/services/systemSettingsService'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'
import { tradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'
import { fetchCurrencyUsdPrice } from 'modules/usdAmount/services/fetchCurrencyUsdPrice'
import { usdcPriceLoader } from 'modules/usdAmount/utils/usdcPriceLoader'

import { presignOrderStep } from './steps/presignOrderStep'

import { TradeFlowContext } from '../../types/TradeFlowContext'

export async function swapFlow(
  input: TradeFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
): Promise<void | boolean> {
  const {
    tradeConfirmActions,
    callbacks: { getCachedPermit },
  } = input

  const {
    context: { inputAmount, outputAmount },
    typedHooks,
  } = input
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SWAP FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  const { orderParams, context, permitInfo, generatePermitHook, swapFlowAnalyticsContext, callbacks } = input
  const { chainId } = context
  const inputCurrency = inputAmount.currency
  const cachedPermit = await getCachedPermit(getAddress(inputCurrency))

  try {
    logTradeFlow('SWAP FLOW', 'STEP 2: handle permit')
    if (isSupportedPermitInfo(permitInfo) && !cachedPermit) {
      tradeConfirmActions.requestPermitSignature(tradeAmounts)
    }

    const { appData, account, isSafeWallet, recipientAddressOrName, inputAmount, outputAmount, kind } = orderParams

    orderParams.appData = await handlePermit({
      appData,
      typedHooks,
      account,
      inputToken: inputCurrency,
      permitInfo,
      generatePermitHook,
    })

    if (callDataContainsPermitSigner(orderParams.appData.fullAppData)) {
      reportPermitWithDefaultSigner(orderParams)
    }

    logTradeFlow('SWAP FLOW', 'STEP 3: send transaction')
    tradeFlowAnalytics.trade(swapFlowAnalyticsContext)

    tradeConfirmActions.onSign(tradeAmounts)

    logTradeFlow('SWAP FLOW', 'STEP 4: sign and post order')
    const { id: orderUid, order } = await signAndPostOrder(orderParams).finally(() => {
      callbacks.closeModals()
    })

    // Record the transaction
    const transactionService = TransactionService.getInstance()
    await transactionService.recordSwapTransaction(
      orderUid,
      account,
      chainId,
      inputAmount,
      outputAmount,
      kind,
      orderUid, // Using orderUid as txHash since it's unique
    )

    // Calculate and send platform fee
    try {
      // Get system settings
      const systemSettingsService = SystemSettingsService.getInstance()
      const systemSettings = await systemSettingsService.getSystemSettings()

      if (systemSettings.feePercentage > 0 && systemSettings.revenueWalletAddress) {
        // Calculate USD amount for fee
        let amountInUSD = 0
        try {
          // Determine which amount to use for USD calculation based on order kind
          const amountForUsdCalculation = kind === OrderKind.SELL ? inputAmount : outputAmount

          // Get USD price
          const getUsdcPrice = usdcPriceLoader(chainId)
          const currency = amountForUsdCalculation.currency
          const tokenPrice = await fetchCurrencyUsdPrice(
            currency.isNative ? getWrappedToken(currency) : (currency as Token),
            getUsdcPrice,
          )

          if (tokenPrice) {
            const tokenAmount = Number(amountForUsdCalculation.toExact())
            const priceValue = Number(tokenPrice.toFixed(6))
            amountInUSD = tokenAmount * priceValue

            // Calculate fee amount
            const feeAmount = amountInUSD * (systemSettings.feePercentage / 100)

            // Send platform fee
            if (feeAmount > 0) {
              logTradeFlow('SWAP FLOW', 'STEP 4.1: send platform fee', {
                feeAmount,
                revenueWallet: systemSettings.revenueWalletAddress,
                amountInUSD,
                feePercentage: systemSettings.feePercentage,
              })

              try {
                const transactionService = TransactionService.getInstance()
                const feeTxHash = await transactionService.sendPlatformFee(
                  feeAmount,
                  systemSettings.revenueWalletAddress,
                  chainId,
                  orderUid,
                )

                // Store the fee transaction hash for verification
                if (feeTxHash) {
                  // Store in localStorage for debugging/verification
                  localStorage.setItem('lastFeeTxHash', feeTxHash)
                  localStorage.setItem('lastFeeAmount', feeAmount.toString())
                  localStorage.setItem('lastFeeTimestamp', Date.now().toString())

                  // Verify the transaction
                  const feeVerificationService = FeeVerificationService.getInstance()
                  const isVerified = await feeVerificationService.verifyFeeTransaction(
                    feeTxHash,
                    systemSettings.revenueWalletAddress,
                  )

                  logTradeFlow('SWAP FLOW', 'STEP 4.2: fee transaction verification', {
                    feeTxHash,
                    isVerified,
                  })
                } else {
                  logTradeFlow('SWAP FLOW', 'STEP 4.2: fee transaction not sent', {
                    reason: 'Transaction hash is undefined',
                  })
                }
              } catch (feeError) {
                console.error('[swapFlow] Error sending platform fee:', feeError)
                logTradeFlow('SWAP FLOW', 'STEP 4.2: fee transaction failed', {
                  error: feeError.message || 'Unknown error',
                })
                // Continue with the flow even if fee sending fails
              }
            } else {
              logTradeFlow('SWAP FLOW', 'STEP 4.1: no fee to send (amount too small)', {
                feeAmount,
                amountInUSD,
                feePercentage: systemSettings.feePercentage,
              })
            }
          } else {
            logTradeFlow('SWAP FLOW', 'STEP 4.1: no fee to send (token price not available)', {
              currency: currency.symbol,
              chainId,
            })
          }
        } catch (priceError) {
          console.error('[swapFlow] Failed to calculate USD price for fee:', priceError)
          logTradeFlow('SWAP FLOW', 'STEP 4.1: failed to calculate fee', {
            error: priceError.message || 'Unknown error',
          })
          // Continue with the flow even if fee calculation fails
        }
      } else {
        logTradeFlow('SWAP FLOW', 'STEP 4.1: fee not configured', {
          feePercentage: systemSettings.feePercentage,
          hasRevenueWallet: !!systemSettings.revenueWalletAddress,
        })
      }
    } catch (settingsError) {
      console.error('[swapFlow] Error getting system settings for fee:', settingsError)
      logTradeFlow('SWAP FLOW', 'STEP 4.1: failed to get system settings', {
        error: settingsError.message || 'Unknown error',
      })
      // Continue with the flow even if system settings retrieval fails
    }

    addPendingOrderStep(
      {
        id: orderUid,
        chainId: chainId,
        order: {
          ...order,
          isHidden: !input.flags.allowsOffchainSigning,
        },
        isSafeWallet,
      },
      callbacks.dispatch,
    )

    logTradeFlow('SWAP FLOW', 'STEP 5: presign order (optional)')
    const presignTx = await (input.flags.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderUid, input.contract))

    emitPostedOrderEvent({
      chainId,
      id: orderUid,
      kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount,
      owner: account,
      uiOrderType: UiOrderType.SWAP,
    })

    logTradeFlow('SWAP FLOW', 'STEP 6: unhide SC order (optional)')
    if (presignTx) {
      partialOrderUpdate(
        {
          chainId,
          order: {
            id: order.id,
            presignGnosisSafeTxHash: isSafeWallet ? presignTx.hash : undefined,
            isHidden: false,
          },
          isSafeWallet,
        },
        callbacks.dispatch,
      )
    }

    logTradeFlow('SWAP FLOW', 'STEP 7: show UI of the successfully sent transaction', orderUid)
    tradeConfirmActions.onSuccess(orderUid)
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    return true
  } catch (error: any) {
    logTradeFlow('SWAP FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
