import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { updateAppDataWithFeeInfo } from '../services/feeAppDataService'
import { appDataInfoAtom } from '../state/atoms'
import { AppDataInfo } from '../types'

/**
 * Hook to manually update AppData with fee information
 */
export function useFeeAppData() {
  const appDataInfo = useAtomValue(appDataInfoAtom)
  const setAppDataInfo = useSetAtom(appDataInfoAtom)

  const updateWithFeeInfo = useCallback(
    async (feeAddress: string, feePercentage: number): Promise<AppDataInfo | null> => {
      if (!appDataInfo) {
        console.warn('[useFeeAppData] No AppData available to update')
        return null
      }

      try {
        const updatedAppData = await updateAppDataWithFeeInfo(appDataInfo, feeAddress, feePercentage)

        // Update the global AppData state
        setAppDataInfo(updatedAppData)

        return updatedAppData
      } catch (error) {
        console.error('[useFeeAppData] Failed to update AppData with fee info:', error)
        return null
      }
    },
    [appDataInfo, setAppDataInfo],
  )

  return {
    updateWithFeeInfo,
    hasAppData: !!appDataInfo,
  }
}
