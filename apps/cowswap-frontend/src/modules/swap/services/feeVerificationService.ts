import { JsonRpcProvider } from '@ethersproject/providers'
import { formatEther } from '@ethersproject/units'

export class FeeVerificationService {
  private static instance: FeeVerificationService
  private provider: JsonRpcProvider

  private constructor() {
    // Initialize with default provider
    this.provider = new JsonRpcProvider(window.ethereum as any)
  }

  static getInstance(): FeeVerificationService {
    if (!FeeVerificationService.instance) {
      FeeVerificationService.instance = new FeeVerificationService()
    }
    return FeeVerificationService.instance
  }

  /**
   * Verify a fee transaction by checking if it was sent to the revenue wallet
   */
  async verifyFeeTransaction(txHash: string, expectedRevenueWallet: string): Promise<boolean> {
    try {
      const tx = await this.provider.getTransaction(txHash)
      if (!tx) {
        console.error(`[FeeVerificationService] Transaction not found: ${txHash}`)
        return false
      }

      const receipt = await this.provider.getTransactionReceipt(txHash)
      if (!receipt || receipt.status === 0) {
        console.error(`[FeeVerificationService] Transaction failed: ${txHash}`)
        return false
      }

      // Check if the transaction was sent to the revenue wallet
      const isToRevenueWallet = tx.to?.toLowerCase() === expectedRevenueWallet.toLowerCase()

      console.log(`[FeeVerificationService] Transaction ${txHash} verification:`, {
        isToRevenueWallet,
        from: tx.from,
        to: tx.to,
        value: formatEther(tx.value),
        status: receipt.status ? 'Success' : 'Failed',
      })

      return isToRevenueWallet && receipt.status === 1
    } catch (error) {
      console.error(`[FeeVerificationService] Error verifying transaction ${txHash}:`, error)
      return false
    }
  }
}

export const feeVerificationService = FeeVerificationService.getInstance()
