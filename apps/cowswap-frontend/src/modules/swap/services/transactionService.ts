import { EnrichedOrder, OrderKind } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'
import { CurrencyAmount, Currency, Token } from '@uniswap/sdk-core'

import { orderBookApi } from 'cowSdk'
import { BigNumber, utils as ethersUtils } from 'ethers'

import { SystemSettings } from 'modules/system/services/systemSettings'
import { SystemSettingsService } from 'modules/system/services/systemSettingsService'
import { fetchCurrencyUsdPrice } from 'modules/usdAmount/services/fetchCurrencyUsdPrice'
import { usdcPriceLoader } from 'modules/usdAmount/utils/usdcPriceLoader'

import http from 'utils/http'

interface TransactionData {
  trader: string
  txReceipt: string
  chain: string
  amountInUSD: number
  revenueWalletAddress: string
  feePercentage: number
  platformFee: number
}

interface TransactionResponse {
  message: string
}

const SYSTEM_BEARER_TOKEN = import.meta.env.VITE_SYSTEM_BEARER_TOKEN

// Extend EnrichedOrder type to include our custom properties
interface ExtendedEnrichedOrder extends EnrichedOrder {
  feePercentage?: number
  revenueWalletAddress?: string
}

export class TransactionService {
  private static instance: TransactionService
  private systemSettingsService: SystemSettingsService

  private constructor() {
    console.log('[TransactionService] Initializing TransactionService')
    this.systemSettingsService = SystemSettingsService.getInstance()
  }

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      console.log('[TransactionService] Creating new TransactionService instance')
      TransactionService.instance = new TransactionService()
    }
    return TransactionService.instance
  }

  async getSystemSettings(): Promise<SystemSettings> {
    console.log('[TransactionService] getSystemSettings called')
    return this.systemSettingsService.getSystemSettings()
  }

  async postTransaction(data: TransactionData): Promise<TransactionResponse> {
    console.log('Attempting to post transaction with data:', data)

    if (!data.txReceipt) {
      console.error('Transaction receipt is missing')
      throw new Error('Transaction receipt is required')
    }

    if (!data.trader) {
      console.error('Trader address is missing')
      throw new Error('Trader address is required')
    }

    try {
      const response = await http.post<TransactionResponse>('/api/v1/tx', data, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      console.log('Transaction posted successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to post transaction. Error details:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      throw error
    }
  }

  async recordSwapTransaction(
    orderId: string,
    trader: string,
    chainId: number,
    inputAmount: CurrencyAmount<Currency>,
    outputAmount: CurrencyAmount<Currency>,
    kind: OrderKind,
    txHash: string,
  ): Promise<void> {
    // Get order details from orderBookApi
    const order = (await orderBookApi.getOrder(orderId, { chainId })) as ExtendedEnrichedOrder

    if (!order) {
      console.error('[TransactionService] Order not found:', orderId)
      return
    }

    // Get system settings
    const systemSettings = await this.getSystemSettings()

    // Calculate USD amount based on the input token
    let amountInUSD = 0
    try {
      // Determine which amount to use for USD calculation based on order kind
      const amountForUsdCalculation = kind === OrderKind.SELL ? inputAmount : outputAmount

      // Handle native currency (ETH, etc.)
      const token = amountForUsdCalculation.currency.isNative
        ? new Token(chainId, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 18, 'ETH', 'Ethereum')
        : (amountForUsdCalculation.currency as Token)

      // Get USD price using the same method as the UI
      const getUsdcPrice = usdcPriceLoader(chainId)
      const tokenPrice = await fetchCurrencyUsdPrice(token, getUsdcPrice)

      if (tokenPrice) {
        const tokenAmount = Number(amountForUsdCalculation.toExact())
        const priceValue = Number(tokenPrice.toFixed(6))
        amountInUSD = tokenAmount * priceValue
      }
    } catch (error) {
      console.error('[TransactionService] Failed to calculate USD amount:', error)
    }

    // Use fee percentage from system settings
    const feePercentage = systemSettings.feePercentage || 0
    const platformFee = amountInUSD * (feePercentage / 100)

    const txData: TransactionData = {
      trader,
      txReceipt: txHash,
      chain: this.getChainName(chainId),
      amountInUSD,
      revenueWalletAddress: systemSettings.revenueWalletAddress || '0x0000000000000000000000000000000000000000',
      feePercentage,
      platformFee,
    }

    console.log('[TransactionService] Final transaction data:', txData)
    await this.postTransaction(txData)
  }

  async sendPlatformFee(
    feeAmount: number,
    feeAddress: string,
    chainId: number,
    originalTxHash: string,
  ): Promise<string | undefined> {
    if (feeAmount <= 0) {
      console.log('[TransactionService] No fee to send')
      return
    }

    try {
      console.log('[TransactionService] Starting platform fee transfer:', {
        feeAmount,
        feeAddress,
        chainId,
        originalTxHash,
      })

      // Get the provider
      const provider = new JsonRpcProvider(window.ethereum as any)
      const signer = provider.getSigner()
      const signerAddress = await signer.getAddress()
      console.log('[TransactionService] Using signer address:', signerAddress)

      // Get the signer's balance
      const balance = await provider.getBalance(signerAddress)
      console.log('[TransactionService] Signer balance:', formatEther(balance))

      // Convert fee amount to wei (ETH amount)
      const feeAmountInWei = BigInt(Math.floor(feeAmount * 1e18))
      console.log('[TransactionService] Fee amount in wei:', feeAmountInWei.toString())

      // Check if we have enough balance
      if (balance.toBigInt() < feeAmountInWei) {
        console.error('[TransactionService] Insufficient balance for fee payment', {
          required: formatEther(feeAmountInWei.toString()),
          available: formatEther(balance),
        })
        throw new Error(
          `Insufficient balance. Required: ${formatEther(feeAmountInWei.toString())}, Available: ${formatEther(balance)}`,
        )
      }

      // Send the ETH
      console.log('[TransactionService] Sending fee transaction...')
      const tx = await signer.sendTransaction({
        to: feeAddress,
        value: feeAmountInWei,
        gasLimit: 21000, // Standard gas limit for ETH transfer
      })
      console.log('[TransactionService] Fee transaction sent:', tx.hash)

      // Wait for the transaction to be mined
      console.log('[TransactionService] Waiting for fee transaction to be mined...')
      const receipt = await tx.wait()
      console.log('[TransactionService] Fee transaction mined:', {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString(),
      })

      // Create a transaction data object for the fee
      const feeTransactionData: TransactionData = {
        trader: signerAddress,
        txReceipt: receipt.transactionHash,
        chain: this.getChainName(chainId),
        amountInUSD: feeAmount,
        revenueWalletAddress: feeAddress,
        feePercentage: 0, // Not needed for the fee transaction itself
        platformFee: feeAmount,
      }

      // Record the fee transaction
      await this.postTransaction(feeTransactionData)

      return receipt.transactionHash
    } catch (error) {
      console.error('[TransactionService] Failed to send platform fee:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
      }
      // Don't throw the error, just log it and return undefined
      // This allows the main swap flow to continue even if fee sending fails
      return undefined
    }
  }

  private getChainName(chainId: number): string {
    const chainMap: Record<number, string> = {
      1: 'ethereum',
      11155111: 'sepolia',
      42161: 'arbitrum-one',
      100: 'genosis',
      8453: 'base',
    }
    return chainMap[chainId] || 'ethereum'
  }
}

function formatEther(balance: BigNumber | string): string {
  // Accepts either a BigNumber or a string (hex or decimal)
  if (BigNumber.isBigNumber(balance)) {
    return ethersUtils.formatEther(balance)
  }
  // If it's a string, convert to BigNumber first
  return ethersUtils.formatEther(BigNumber.from(balance))
}
