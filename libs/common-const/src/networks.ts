import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY || '2af29cd5ac554ae3b8d991afe1ba4b7d' // Default rate-limited infura key (should be overridden, not reliable to use)

// Hardcoded chain IDs to avoid SDK import issues in browser bundle
const CHAIN_IDS = {
  MAINNET: 1,
  BNB: 56,
  BASE: 8453,
  ARBITRUM_ONE: 42161,
  POLYGON: 137,
  AVALANCHE: 43114,
  GNOSIS_CHAIN: 100,
  LENS: 232,
  LINEA: 59144,
  PLASMA: 9745,
  SEPOLIA: 11155111,
}

const RPC_URL_ENVS = {
  [CHAIN_IDS.MAINNET as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_1 || undefined,
  [CHAIN_IDS.GNOSIS_CHAIN as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_100 || undefined,
  [CHAIN_IDS.ARBITRUM_ONE as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_42161 || undefined,
  [CHAIN_IDS.BASE as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_8453 || undefined,
  [CHAIN_IDS.SEPOLIA as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_11155111 || undefined,
  [CHAIN_IDS.POLYGON as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_137 || undefined,
  [CHAIN_IDS.AVALANCHE as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_43114 || undefined,
  [CHAIN_IDS.LENS as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_232 || undefined,
  [CHAIN_IDS.BNB as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_56 || undefined,
  [CHAIN_IDS.LINEA as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_59144 || undefined,
  [CHAIN_IDS.PLASMA as SupportedChainId]: process.env.REACT_APP_NETWORK_URL_9745 || undefined,
} as Record<SupportedChainId, string | undefined>

const DEFAULT_RPC_URL = {
  [CHAIN_IDS.MAINNET as SupportedChainId]: { url: `https://mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [CHAIN_IDS.GNOSIS_CHAIN as SupportedChainId]: { url: `https://rpc.gnosis.gateway.fm`, usesInfura: false },
  [CHAIN_IDS.ARBITRUM_ONE as SupportedChainId]: { url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [CHAIN_IDS.BASE as SupportedChainId]: { url: `https://base-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [CHAIN_IDS.SEPOLIA as SupportedChainId]: { url: `https://sepolia.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [CHAIN_IDS.POLYGON as SupportedChainId]: { url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [CHAIN_IDS.AVALANCHE as SupportedChainId]: { url: `https://avalanche-mainnet.infura.io/v3/${INFURA_KEY}`, usesInfura: true },
  [CHAIN_IDS.BNB as SupportedChainId]: { url: `https://bsc-dataseed.binance.org/`, usesInfura: false },
  [CHAIN_IDS.LENS as SupportedChainId]: { url: `https://rpc.lens.xyz`, usesInfura: false },
  [CHAIN_IDS.LINEA as SupportedChainId]: { url: `https://rpc.linea.build`, usesInfura: false },
  [CHAIN_IDS.PLASMA as SupportedChainId]: { url: `https://rpc.plasma.to`, usesInfura: false },
} as Record<SupportedChainId, { url: string; usesInfura: boolean }>

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const RPC_URLS: Record<SupportedChainId, string> = mapSupportedNetworks(getRpcUrl)

function getRpcUrl(chainId: SupportedChainId): string {
  const envKey = `REACT_APP_NETWORK_URL_${chainId}`
  const rpcUrl = RPC_URL_ENVS[chainId]

  if (rpcUrl) {
    return rpcUrl
  }

  const defaultRpc = DEFAULT_RPC_URL[chainId]
  if (defaultRpc.usesInfura && !INFURA_KEY) {
    throw new Error(`Either ${envKey} or REACT_APP_INFURA_KEY environment variable are required`)
  }

  return defaultRpc.url
}

const rpcProviderCache: Record<number, JsonRpcProvider> = {}

export function getRpcProvider(chainId: SupportedChainId): JsonRpcProvider
export function getRpcProvider(chainId: number): JsonRpcProvider | null {
  if (!rpcProviderCache[chainId]) {
    const url = RPC_URLS[chainId as SupportedChainId]
    if (!url) return null

    const provider = new JsonRpcProvider(url, chainId)

    rpcProviderCache[chainId] = provider

    return provider
  }

  return rpcProviderCache[chainId]
}
