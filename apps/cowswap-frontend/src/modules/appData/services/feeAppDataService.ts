import { stringifyDeterministic } from '@cowprotocol/app-data'
import { keccak256 } from '@ethersproject/keccak256'
import { toUtf8Bytes } from '@ethersproject/strings'

import http from 'utils/http'

import { AppDataInfo } from '../types'

interface SystemFeeSettings {
  feeAddress: string
  feePercentage: number
}

/**
 * Fetches system fee settings from the backend and adds them to the AppData
 * @param appDataInfo The original AppData information
 * @returns Promise with updated AppData information
 */
export async function addFeeInfoToAppData(appDataInfo: AppDataInfo): Promise<AppDataInfo> {
  try {
    const token = localStorage.getItem('token')
    // Fetch fee settings from backend
    const { data } = await http.get<SystemFeeSettings>('/api/v1/system/get-settings', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    return updateAppDataWithFeeInfo(appDataInfo, data.feeAddress, data.feePercentage)
  } catch (error) {
    console.error('[FeeAppDataService] Failed to fetch fee settings:', error)
    // Return original AppData if there's an error
    return appDataInfo
  }
}

/**
 * Updates AppData with fee information
 * @param appDataInfo Original AppData
 * @param feeAddress Revenue wallet address
 * @param feePercentage Fee percentage
 * @returns Updated AppData
 */
export async function updateAppDataWithFeeInfo(
  appDataInfo: AppDataInfo,
  feeAddress: string,
  feePercentage: number,
): Promise<AppDataInfo> {
  // Clone the original doc
  const updatedDoc = {
    ...appDataInfo.doc,
    metadata: {
      ...appDataInfo.doc.metadata,
      // Add or update partnerFee
      partnerFee: {
        bps: Math.round(feePercentage * 100), // Convert percentage to basis points
        recipient: feeAddress,
      },
    },
  }

  // Generate new fullAppData and hash
  const fullAppData = await stringifyDeterministic(updatedDoc)
  const appDataKeccak256 = keccak256(toUtf8Bytes(fullAppData))

  return {
    doc: updatedDoc,
    fullAppData,
    appDataKeccak256,
    env: appDataInfo.env,
  }
}

// Helper function to simulate API call (for testing)
export async function simulateFeeSettingsFetch(): Promise<SystemFeeSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        feeAddress: '0x1234567890123456789012345678901234567890',
        feePercentage: 0.5, // 0.5%
      })
    }, 100)
  })
}
