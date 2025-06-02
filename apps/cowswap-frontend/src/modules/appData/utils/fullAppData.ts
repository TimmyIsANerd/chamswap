import { EnvironmentName, environmentName } from '@cowprotocol/common-utils'

import { AppDataInfo } from '../types'
import { toKeccak256 } from '../utils/buildAppData'

import http from 'utils/http'

// import VITE_SYSTEM_BEARER_TOKEN
const SYSTEM_BEARER_TOKEN = import.meta.env.VITE_SYSTEM_BEARER_TOKEN

const DEFAULT_FULL_APP_DATA = '{"version":"1.3.0","appCode":"Chameleaon swap","metadata":{}}'

let appData: any = (async () => {
  const objAppData = JSON.parse(DEFAULT_FULL_APP_DATA)
  const systemSettings = await getSystemSettings()
  const moddedAppData = systemSettings
    ? {
      ...objAppData,
      metadata: {
        ...objAppData.metadata,
        partnerFee: systemSettings.feePercentage,
        referrer: {
          address: systemSettings.revenueWalletAddress,
        }
      },
    }
    : objAppData
  return _fromFullAppData(JSON.stringify(moddedAppData))
})()

interface SystemSettings {
  revenueWalletAddress: string
  feePercentage: number
}

async function getSystemSettings(): Promise<SystemSettings | null> {
  try {
    const { data } = await http.get('/api/v1/system/get-settings', {
      headers: {
        Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
    return data
  } catch (error) {
    console.error('Failed to fetch system settings:', error)
    return null
  }
}

export function getAppData() {
  return appData
}

export function updateFullAppData(fullAppData: string | undefined) {
  if (fullAppData) {
    appData = _fromFullAppData(fullAppData)
  }
}

export function getFullAppDataByEnv(environmentName: EnvironmentName | undefined): string {
  switch (environmentName) {
    case 'production':
      return process.env.REACT_APP_FULL_APP_DATA_PRODUCTION || DEFAULT_FULL_APP_DATA

    case 'ens':
      return process.env.REACT_APP_FULL_APP_DATA_ENS || DEFAULT_FULL_APP_DATA

    case 'barn':
      return process.env.REACT_APP_FULL_APP_DATA_BARN || DEFAULT_FULL_APP_DATA

    case 'staging':
      return process.env.REACT_APP_FULL_APP_DATA_STAGING || DEFAULT_FULL_APP_DATA

    case 'pr':
      return process.env.REACT_APP_FULL_APP_DATA_PR || DEFAULT_FULL_APP_DATA

    case 'development':
      return process.env.REACT_APP_FULL_APP_DATA_DEVELOPMENT || DEFAULT_FULL_APP_DATA

    case 'local':
      return process.env.REACT_APP_FULL_APP_DATA_LOCAL || DEFAULT_FULL_APP_DATA

    default:
      break
  }
  return DEFAULT_FULL_APP_DATA
}

function _fromFullAppData(fullAppData: string): AppDataInfo {
  return {
    doc: JSON.parse(fullAppData),
    fullAppData: fullAppData,
    appDataKeccak256: toKeccak256(fullAppData),
  }
}
