import { OrderKind } from '@cowprotocol/cow-sdk'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { Token } from '@uniswap/sdk-core'

import { finalizeTransaction } from 'legacy/state/enhancedTransactions/actions'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { TransactionService } from 'modules/swap/services/transactionService'
import { fetchCurrencyUsdPrice } from 'modules/usdAmount/services/fetchCurrencyUsdPrice'
import { usdcPriceLoader } from 'modules/usdAmount/utils/usdcPriceLoader'

import { finalizeEthFlowTx } from './finalizeEthFlowTx'
import { finalizeOnChainCancellation } from './finalizeOnChainCancellation'

import { emitOnchainTransactionEvent } from '../../../utils/emitOnchainTransactionEvent'
import { CheckEthereumTransactions } from '../types'

interface SystemSettings {
  revenueWalletAddress: string
  feePercentage: number
}

// Map chain IDs to API chain names
const CHAIN_ID_TO_NAME: Record<number, string> = {
  1: 'ethereum',
  11155111: 'sepolia',
  42161: 'arbitrum-one',
  100: 'genosis',
  8453: 'base',
}

export async function finalizeEthereumTransaction(
  receipt: TransactionReceipt,
  transaction: EnhancedTransactionDetails,
  params: CheckEthereumTransactions,
  safeTransactionHash?: string,
) {
  const { chainId, account, dispatch, addPriorityAllowance } = params
  const { hash } = transaction

  console.log(`[FinalizeTxUpdater] Starting transaction finalization for ${receipt.transactionHash}`, {
    chainId,
    account,
    hash,
    status: receipt.status,
  })

  // Record transaction in our system
  if (receipt.status === 1) {
    // Only record successful transactions
    console.log('[FinalizeTxUpdater] Transaction successful, preparing to record...')
    const transactionService = TransactionService.getInstance()
    console.log('[FinalizeTxUpdater] TransactionService instance created')

    // Calculate amount in USD from transaction data
    let amountInUSD = 0
    let tokenPrice = null
    try {
      // Get transaction value from the transaction object
      const value = transaction.ethFlow ? transaction.data?.value || '0' : transaction.data?.value || '0'
      const gasUsed = receipt.gasUsed?.toString() || '0'
      const gasPrice = receipt.effectiveGasPrice?.toString() || '0'

      console.log('[FinalizeTxUpdater] Transaction details:', {
        value,
        gasUsed,
        gasPrice,
        ethFlow: transaction.ethFlow,
        data: transaction.data,
      })

      // Get real-time token price from price feeds
      const getUsdcPrice = usdcPriceLoader(chainId)
      console.log('[FinalizeTxUpdater] Fetching token price...')

      // Use native token for price calculation
      const nativeToken = new Token(chainId, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 18, 'ETH', 'Ethereum')

      tokenPrice = await fetchCurrencyUsdPrice(nativeToken, getUsdcPrice)
      console.log('[FinalizeTxUpdater] Token price fetched:', tokenPrice)

      if (tokenPrice) {
        // Convert wei to token amount using token decimals
        const tokenDecimals = 18 // Native token decimals
        const tokenAmount = Number(value) / Math.pow(10, tokenDecimals)

        // Get the price value from the token price object
        const priceValue = tokenPrice instanceof Object ? tokenPrice.toFixed(6) : tokenPrice
        const numericPrice = parseFloat(priceValue)

        // Calculate USD value
        amountInUSD = tokenAmount * numericPrice
        console.log('[FinalizeTxUpdater] USD amount calculated:', {
          value,
          tokenDecimals,
          tokenAmount,
          tokenPrice: priceValue,
          amountInUSD,
        })
      } else {
        console.log('[FinalizeTxUpdater] No token price available')
      }
    } catch (error) {
      console.error('[FinalizeTxUpdater] Failed to calculate USD amount:', error)
    }

    // Get system settings for fee calculation
    console.log('[FinalizeTxUpdater] About to fetch system settings...')
    let systemSettings: SystemSettings
    try {
      systemSettings = await transactionService.getSystemSettings()
      console.log('[FinalizeTxUpdater] System settings fetched successfully:', {
        revenueWalletAddress: systemSettings.revenueWalletAddress,
        feePercentage: systemSettings.feePercentage,
      })
    } catch (error) {
      console.error('[FinalizeTxUpdater] Failed to get system settings:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
      }
      return // Exit early if we can't get the settings
    }

    const feePercentage = systemSettings.feePercentage
    const platformFee = amountInUSD * (feePercentage / 100)
    console.log('[FinalizeTxUpdater] Fee calculation:', {
      amountInUSD,
      feePercentage,
      platformFee,
      revenueWalletAddress: systemSettings.revenueWalletAddress,
    })

    // Calculate fee amount in ETH
    let feeAmountInEth = 0
    if (tokenPrice) {
      const priceValue = Number(tokenPrice.toFixed(6))
      feeAmountInEth = platformFee / priceValue
      console.log('[FinalizeTxUpdater] Fee in ETH:', {
        tokenPrice: priceValue,
        feeAmountInEth,
        revenueWalletAddress: systemSettings.revenueWalletAddress,
      })
    }

    // Send fee to revenue wallet if there's a fee to send
    if (feeAmountInEth > 0 && systemSettings.revenueWalletAddress) {
      console.log('[FinalizeTxUpdater] Attempting to send fee:', {
        feeAmountInEth,
        revenueWalletAddress: systemSettings.revenueWalletAddress,
        chainId,
        txHash: receipt.transactionHash,
      })
      try {
        await transactionService.sendPlatformFee(
          feeAmountInEth,
          systemSettings.revenueWalletAddress,
          chainId,
          receipt.transactionHash,
        )
        console.log('[FinalizeTxUpdater] Fee sent successfully')
      } catch (error) {
        console.error('[FinalizeTxUpdater] Failed to send platform fee:', error)
        if (error.response) {
          console.error('Error response:', error.response.data)
        }
      }
    } else {
      console.log('[FinalizeTxUpdater] No fee to send:', {
        feeAmountInEth,
        hasRevenueWallet: !!systemSettings.revenueWalletAddress,
        revenueWalletAddress: systemSettings.revenueWalletAddress,
        feePercentage,
        amountInUSD,
      })
    }

    const txData = {
      trader: receipt.from,
      txReceipt: receipt.transactionHash,
      chain: CHAIN_ID_TO_NAME[chainId] || 'ethereum',
      amountInUSD,
      revenueWalletAddress: systemSettings.revenueWalletAddress,
      feePercentage,
      platformFee,
      inputToken: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'ETH',
        decimals: 18,
        amount: transaction.data?.value || '0',
      },
      outputToken: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: '',
        decimals: 18,
        amount: '0',
      },
      kind: OrderKind.SELL,
      orderId: hash,
    }

    console.log('[FinalizeTxUpdater] Recording transaction:', txData)
    try {
      await transactionService.postTransaction(txData)
      console.log('[FinalizeTxUpdater] Transaction recorded successfully')
    } catch (error) {
      console.error('[FinalizeTxUpdater] Failed to record transaction:', error)
    }
  } else {
    console.log('[FinalizeTxUpdater] Transaction not successful, status:', receipt.status)
  }

  // Once approval tx is mined, we add the priority allowance to immediately allow the user to place orders
  if (transaction.approval) {
    addPriorityAllowance({
      chainId,
      account,
      blockNumber: receipt.blockNumber,
      tokenAddress: transaction.approval.tokenAddress,
    })
  }

  dispatch(
    finalizeTransaction({
      chainId,
      hash,
      receipt: {
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        contractAddress: receipt.contractAddress,
        from: receipt.from,
        status: receipt.status,
        to: receipt.to,
        transactionHash: receipt.transactionHash,
        transactionIndex: receipt.transactionIndex,
      },
    }),
  )

  if (transaction.ethFlow) {
    finalizeEthFlowTx(transaction, receipt, params, hash)
    return
  }

  if (transaction.onChainCancellation) {
    const { orderId, sellTokenSymbol } = transaction.onChainCancellation

    finalizeOnChainCancellation(transaction, receipt, params, hash, orderId, sellTokenSymbol)
    return
  }

  emitOnchainTransactionEvent({
    receipt: {
      to: receipt.to,
      from: receipt.from,
      contractAddress: receipt.contractAddress,
      transactionHash: safeTransactionHash || receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      replacementType: transaction.replacementType,
    },
    summary: transaction.summary || '',
  })
}
