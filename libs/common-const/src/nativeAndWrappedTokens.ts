import {
  ALL_SUPPORTED_CHAINS_MAP,
  mapSupportedNetworks,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES as WRAPPED_NATIVE_CURRENCIES_SDK,
} from '@cowprotocol/cow-sdk'

import { TokenWithLogo } from './types'

export const NATIVE_CURRENCY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

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

export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = mapSupportedNetworks(
  getTokenWithLogoFromWrappedNativeCurrency,
)

export const NATIVE_CURRENCIES: Record<SupportedChainId, TokenWithLogo> = mapSupportedNetworks(
  getTokenWithLogoFromNativeCurrency,
)

export const WETH_MAINNET = WRAPPED_NATIVE_CURRENCIES[CHAIN_IDS.MAINNET as SupportedChainId]
export const WXDAI = WRAPPED_NATIVE_CURRENCIES[CHAIN_IDS.GNOSIS_CHAIN as SupportedChainId]
export const WETH_SEPOLIA = WRAPPED_NATIVE_CURRENCIES[CHAIN_IDS.SEPOLIA as SupportedChainId]

function getTokenWithLogoFromWrappedNativeCurrency(chainId: SupportedChainId): TokenWithLogo {
  // Try accessing by number first, then by string (SDK keys are strings at runtime)
  let wrapped
  if (WRAPPED_NATIVE_CURRENCIES_SDK) {
    wrapped = WRAPPED_NATIVE_CURRENCIES_SDK[chainId] || (WRAPPED_NATIVE_CURRENCIES_SDK as any)[String(chainId)]
  }

  // Handle case where SDK bundles it as just an address string instead of an object
  // Or if wrapped is not found but we want to try fallback logic (though if SDK is missing it's hard)
  // If wrapped is undefined, we can try to manual fallback if we know the address, but addresses change.
  // For now, let's assume if it's missing from SDK map it's an error unless we hardcode addresses.
  
  if (!wrapped) {
    // Attempt manual fallback for known chains if SDK data is missing
    const manualAddresses: Partial<Record<SupportedChainId, string>> = {
        [CHAIN_IDS.MAINNET as SupportedChainId]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        [CHAIN_IDS.GNOSIS_CHAIN as SupportedChainId]: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
        [CHAIN_IDS.ARBITRUM_ONE as SupportedChainId]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        [CHAIN_IDS.BASE as SupportedChainId]: '0x4200000000000000000000000000000000000006',
        [CHAIN_IDS.SEPOLIA as SupportedChainId]: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        [CHAIN_IDS.POLYGON as SupportedChainId]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        [CHAIN_IDS.AVALANCHE as SupportedChainId]: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
        [CHAIN_IDS.BNB as SupportedChainId]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    }
    const address = manualAddresses[chainId]
    if (address) {
       wrapped = address // Treat as string case below
    } else {
       throw new Error(`Wrapped native currency not found for chain ${chainId}`)
    }
  }

  // Handle case where SDK bundles it as just an address string instead of an object
  if (typeof wrapped === 'string') {
    // If it's just a string (address), use default values for wrapped tokens
    // Most wrapped tokens use 18 decimals
    const address = wrapped
    const decimals = 18
    
    // Get symbol and name based on chain
    let symbol = 'WETH'
    let name = 'Wrapped Ether'
    if (chainId === CHAIN_IDS.GNOSIS_CHAIN) {
      symbol = 'WXDAI'
      name = 'Wrapped XDAI'
    } else if (chainId === CHAIN_IDS.POLYGON) {
      symbol = 'WPOL'
      name = 'Wrapped POL'
    } else if (chainId === CHAIN_IDS.AVALANCHE) {
      symbol = 'WAVAX'
      name = 'Wrapped AVAX'
    } else if (chainId === CHAIN_IDS.BNB) {
      symbol = 'WBNB'
      name = 'Wrapped BNB'
    } else if (chainId === CHAIN_IDS.LENS) {
      symbol = 'WGHO'
      name = 'Wrapped GHO'
    } else if (chainId === CHAIN_IDS.PLASMA) {
      symbol = 'WXPL'
      name = 'Wrapped XPL'
    } else if (chainId === CHAIN_IDS.LINEA) {
      symbol = 'WETH'
      name = 'Wrapped Ether'
    } else if (chainId === CHAIN_IDS.BASE) {
      symbol = 'WETH'
      name = 'Wrapped Ether'
    } else if (chainId === CHAIN_IDS.ARBITRUM_ONE) {
      symbol = 'WETH'
      name = 'Wrapped Ether'
    }
    
    return new TokenWithLogo(undefined, chainId, address, decimals, symbol, name)
  }

  // Normal case: wrapped is an object
  const decimalsValue = wrapped.decimals
  if (decimalsValue === undefined || decimalsValue === null) {
    // Fallback: most wrapped tokens use 18 decimals
    const decimals = 18
    return new TokenWithLogo(
      wrapped.logoUrl,
      chainId,
      wrapped.address,
      decimals,
      wrapped.symbol,
      wrapped.name,
    )
  }

  const decimals = Math.floor(Number(decimalsValue))
  if (isNaN(decimals) || decimals <= 0 || !Number.isInteger(decimals)) {
    throw new Error(`Invalid decimals (${decimalsValue}) for wrapped native currency on chain ${chainId}`)
  }

  return new TokenWithLogo(
    wrapped.logoUrl,
    chainId,
    wrapped.address,
    decimals,
    wrapped.symbol,
    wrapped.name,
  )
}

function getTokenWithLogoFromNativeCurrency(chainId: SupportedChainId): TokenWithLogo {
  let chainInfo
  if (ALL_SUPPORTED_CHAINS_MAP) {
    chainInfo = ALL_SUPPORTED_CHAINS_MAP[chainId] || (ALL_SUPPORTED_CHAINS_MAP as any)[String(chainId)]
  }

  // Fallback if SDK map is missing or incomplete
  if (!chainInfo) {
    const decimals = 18
    let symbol = 'ETH'
    let name = 'Ether'
    
    if (chainId === CHAIN_IDS.GNOSIS_CHAIN) {
      symbol = 'xDAI'
      name = 'xDAI'
    } else if (chainId === CHAIN_IDS.POLYGON) {
      symbol = 'POL'
      name = 'POL'
    } else if (chainId === CHAIN_IDS.AVALANCHE) {
      symbol = 'AVAX'
      name = 'Avalanche'
    } else if (chainId === CHAIN_IDS.BNB) {
      symbol = 'BNB'
      name = 'BNB'
    } else if (chainId === CHAIN_IDS.LENS) {
      symbol = 'GRASS'
      name = 'GRASS'
    } else if (chainId === CHAIN_IDS.PLASMA) {
      symbol = 'XPL'
      name = 'XPL'
    } else if (chainId === CHAIN_IDS.LINEA) {
      symbol = 'ETH'
      name = 'Ether'
    }

    return new TokenWithLogo(
      undefined,
      chainId,
      NATIVE_CURRENCY_ADDRESS,
      decimals,
      symbol,
      name,
    )
  }

  const nativeCurrency = chainInfo.nativeCurrency

  if (!nativeCurrency) {
    throw new Error(`Native currency not found for chain ${chainId}`)
  }

  const decimals = Math.floor(Number(nativeCurrency.decimals))
  if (isNaN(decimals) || decimals <= 0 || !Number.isInteger(decimals)) {
    throw new Error(`Invalid decimals (${nativeCurrency.decimals}) for native currency on chain ${chainId}`)
  }

  return new TokenWithLogo(
    undefined,
    chainId,
    nativeCurrency.address,
    decimals,
    nativeCurrency.symbol,
    nativeCurrency.name,
  )
}
