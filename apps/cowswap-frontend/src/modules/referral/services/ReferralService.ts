import { SupportedChainId } from '@cowprotocol/cow-sdk'

import http from 'utils/http'

interface ReferralInfo {
  valid: boolean
  referrerId: string
  referrerName: string
}

interface TraderDetails {
  id: string
  walletAddress: string
  chainId: number
  createdAt: string
  updatedAt: string
}

interface Referral {
  id: string
  referrer: string
  referee: string
  referralCode: string
  status: string
  createdAt: string
}

export class ReferralService {
  private static instance: ReferralService

  private constructor() {}

  public static getInstance(): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService()
    }
    return ReferralService.instance
  }

  async validateReferralCode(code: string): Promise<ReferralInfo> {
    try {
      console.log('[ReferralService] Validating referral code:', code)
      // First try the new API endpoint
      try {
        const { data } = await http.get(`/user/validate_reffer_code/${code}`)
        console.log('[ReferralService] Validation response:', data)
        return {
          valid: data.status === true,
          referrerId: data.referrerId || '',
          referrerName: data.referrerName || '',
        }
      } catch (error) {
        console.warn('[ReferralService] Failed with new endpoint, trying legacy endpoint:', error)
        // Fall back to legacy endpoint
        const { data } = await http.get<ReferralInfo>(`/api/v1/referral/validate/${code}`)
        return data
      }
    } catch (error) {
      console.error('[ReferralService] Failed to validate referral code:', error)
      throw new Error('Invalid referral code')
    }
  }

  async registerReferral(referralCode: string, walletAddress: string): Promise<void> {
    try {
      console.log('[ReferralService] Registering referral:', { referralCode, walletAddress })

      // First try the new API endpoint
      try {
        const response = await http.post('/user/register_referral', {
          reffer_code: referralCode,
          wallet_address: walletAddress,
        })

        console.log('[ReferralService] Registration response:', response.data)

        if (!response.data.status) {
          throw new Error(response.data.message || 'Failed to register referral')
        }
      } catch (error) {
        console.warn('[ReferralService] Failed with new endpoint, trying legacy endpoint:', error)
        // Fall back to legacy endpoint
        await http.post('/api/v1/referral/register', {
          referralCode,
          walletAddress,
        })
      }

      console.log('[ReferralService] Referral registration successful')
    } catch (error) {
      console.error('[ReferralService] Failed to register referral:', error)
      throw error
    }
  }

  async getReferralCode(): Promise<string> {
    try {
      // First try to get from localStorage
      const storedCode = localStorage.getItem('referralCode')
      if (storedCode) {
        return storedCode
      }

      // If no code in localStorage, return empty string
      return ''
    } catch (error) {
      console.error('[ReferralService] Failed to get referral code:', error)
      return ''
    }
  }

  async getReferrals(): Promise<Referral[]> {
    try {
      // Since the endpoints don't exist, return an empty array
      console.warn('[ReferralService] Referrals endpoint not available')
      return []
    } catch (error) {
      console.error('[ReferralService] Failed to get referrals:', error)
      return []
    }
  }

  async getTraderDetails(walletAddress: string): Promise<TraderDetails | null> {
    try {
      const SYSTEM_BEARER_TOKEN = import.meta.env.VITE_SYSTEM_BEARER_TOKEN
      const response = await fetch(`/api/v1/trader/${walletAddress}/base`, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch trader details')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching trader details:', error)
      return null
    }
  }

  async registerTrader(
    walletAddress: string,
    chainId: SupportedChainId,
    referralCode?: string,
  ): Promise<TraderDetails> {
    try {
      const SYSTEM_BEARER_TOKEN = import.meta.env.VITE_SYSTEM_BEARER_TOKEN

      const payload: any = {
        walletAddress,
        chainId,
      }

      // Add referral code if provided
      if (referralCode) {
        payload.referralCode = referralCode
      } else {
        // Try to get stored referral code if none provided
        const storedCode = localStorage.getItem('referralCode')
        if (storedCode) {
          payload.referralCode = storedCode
        }
      }

      console.log('[ReferralService] Registering trader:', payload)

      const response = await fetch('/api/v1/trader', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to register trader')
      }

      return await response.json()
    } catch (error) {
      console.error('[ReferralService] Error registering trader:', error)
      throw error
    }
  }
}
