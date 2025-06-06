import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

import { AppCodeWithWidgetMetadata } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'
import { UtmParams } from 'modules/utm'

import { addFeeInfoToAppData } from '../services/feeAppDataService'
import { appDataInfoAtom } from '../state/atoms'
import { AppDataOrderClass, AppDataPartnerFee, TypedAppDataHooks } from '../types'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'

export type UseAppDataParams = {
  appCodeWithWidgetMetadata: AppCodeWithWidgetMetadata | null
  chainId: SupportedChainId
  slippageBips: number
  isSmartSlippage?: boolean
  orderClass: AppDataOrderClass
  utm: UtmParams | undefined
  typedHooks?: TypedAppDataHooks
  volumeFee?: AppDataPartnerFee
  replacedOrderUid?: string
  includeFeeInfo?: boolean // New parameter to control fee info inclusion
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
export function AppDataInfoUpdater({
  appCodeWithWidgetMetadata,
  chainId,
  slippageBips,
  isSmartSlippage,
  orderClass,
  utm,
  typedHooks,
  volumeFee,
  replacedOrderUid,
  includeFeeInfo = true, // Default to true to include fee info
}: UseAppDataParams): void {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useSetAtom(appDataInfoAtom)

  const updateAppDataPromiseRef = useRef(Promise.resolve())

  useEffect(() => {
    if (!appCodeWithWidgetMetadata) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    const { appCode, environment, widget } = appCodeWithWidgetMetadata
    const params: BuildAppDataParams = {
      chainId,
      slippageBips,
      isSmartSlippage,
      appCode,
      environment,
      orderClass,
      utm,
      typedHooks,
      partnerFee: volumeFee,
      widget,
      replacedOrderUid,
    }

    const updateAppData = async (): Promise<void> => {
      try {
        // Build initial AppData
        let appDataInfo = await buildAppData(params)

        // Add fee info if needed
        if (includeFeeInfo) {
          appDataInfo = await addFeeInfoToAppData(appDataInfo)
        }

        setAppDataInfo({
          ...appDataInfo,
          env: getEnvByClass(orderClass),
        })
      } catch (e: any) {
        console.error(`[useAppData] failed to build appData, falling back to default`, params, e)
        setAppDataInfo(getAppData())
      }
    }

    // Chain the next update to avoid race conditions
    updateAppDataPromiseRef.current = updateAppDataPromiseRef.current.finally(updateAppData)
  }, [
    appCodeWithWidgetMetadata,
    chainId,
    setAppDataInfo,
    slippageBips,
    orderClass,
    utm,
    typedHooks,
    volumeFee,
    replacedOrderUid,
    isSmartSlippage,
    includeFeeInfo,
  ])
}

function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
