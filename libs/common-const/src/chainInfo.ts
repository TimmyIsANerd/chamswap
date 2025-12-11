import {
  arbitrumOne,
  avalanche,
  base,
  bnb,
  ChainInfo,
  gnosisChain,
  lens,
  linea,
  mainnet,
  plasma,
  polygon,
  sepolia,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import {
  ArbitrumLogo,
  AvalancheLogo,
  BaseLogo,
  BnbLogo,
  GnosisLogo,
  LensLogo,
  LineaLogo,
  MainnetLogo,
  PlasmaLogo,
  PolygonLogo,
  SepoliaLogo,
} from '../../assets/src/index'

import { NATIVE_CURRENCIES } from './nativeAndWrappedTokens'
import { TokenWithLogo } from './types'

export interface BaseChainInfo {
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logo: { light: string; dark: string }
  readonly name: string
  readonly addressPrefix: string
  readonly label: string
  readonly eip155Label: string
  readonly urlAlias: string
  readonly helpCenterUrl?: string
  readonly explorerTitle: string
  readonly color: string
  readonly nativeCurrency: TokenWithLogo
}

export type ChainInfoMap = Record<SupportedChainId, BaseChainInfo>

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

function mapChainInfoToBaseChainInfo(
  chainInfo: ChainInfo | undefined,
  fallbackInfo?: Partial<BaseChainInfo>
): Pick<
  BaseChainInfo,
  | 'docs'
  | 'bridge'
  | 'explorer'
  | 'infoLink'
  | 'logo'
  | 'addressPrefix'
  | 'label'
  | 'explorerTitle'
  | 'color'
  | 'eip155Label'
> {
  if (!chainInfo) {
    if (fallbackInfo && fallbackInfo.docs && fallbackInfo.explorer && fallbackInfo.logo && fallbackInfo.label && fallbackInfo.color) {
        return {
            docs: fallbackInfo.docs,
            bridge: fallbackInfo.bridge,
            explorer: fallbackInfo.explorer,
            infoLink: fallbackInfo.infoLink || '',
            logo: fallbackInfo.logo,
            addressPrefix: fallbackInfo.addressPrefix || '',
            label: fallbackInfo.label,
            explorerTitle: fallbackInfo.explorerTitle || 'Explorer',
            color: fallbackInfo.color,
            eip155Label: fallbackInfo.eip155Label || '',
        }
    }
    // Minimal fallback if SDK data is missing and no manual fallback provided
    // This prevents crash but data will be incomplete
    return {
      docs: '',
      bridge: undefined,
      explorer: '',
      infoLink: '',
      logo: { light: '', dark: '' },
      addressPrefix: '',
      label: 'Unknown Chain',
      explorerTitle: '',
      color: '#000000',
      eip155Label: '',
    }
  }

  return {
    docs: chainInfo.docs.url,
    bridge: chainInfo.bridges?.[0]?.url,
    explorer: chainInfo.blockExplorer.url ?? '',
    infoLink: chainInfo.website.url,
    logo: chainInfo.logo,
    addressPrefix: chainInfo.addressPrefix,
    label: chainInfo.label,
    explorerTitle: chainInfo.blockExplorer.name,
    color: chainInfo.color,
    eip155Label: chainInfo.eip155Label,
  }
}

// Fallback data for when SDK exports are undefined
const FALLBACK_DATA: Record<number, Partial<BaseChainInfo>> = {
    [CHAIN_IDS.MAINNET]: {
        docs: 'https://docs.cow.fi',
        explorer: 'https://etherscan.io',
        label: 'Ethereum',
        color: '#29B6AF',
        logo: { light: MainnetLogo, dark: MainnetLogo }
    },
    [CHAIN_IDS.GNOSIS_CHAIN]: {
        docs: 'https://docs.gnosischain.com',
        explorer: 'https://gnosisscan.io',
        label: 'Gnosis Chain',
        color: '#04795B',
        logo: { light: GnosisLogo, dark: GnosisLogo }
    },
    [CHAIN_IDS.SEPOLIA]: {
        docs: 'https://docs.cow.fi',
        explorer: 'https://sepolia.etherscan.io',
        label: 'Sepolia',
        color: '#48A3FF',
        logo: { light: SepoliaLogo, dark: SepoliaLogo }
    },
    [CHAIN_IDS.ARBITRUM_ONE]: {
        docs: 'https://docs.arbitrum.io',
        explorer: 'https://arbiscan.io',
        label: 'Arbitrum One',
        color: '#28A0F0',
        logo: { light: ArbitrumLogo, dark: ArbitrumLogo }
    },
    [CHAIN_IDS.BASE]: {
        docs: 'https://docs.base.org',
        explorer: 'https://basescan.org',
        label: 'Base',
        color: '#0052FF',
        logo: { light: BaseLogo, dark: BaseLogo }
    },
    [CHAIN_IDS.BNB]: {
        docs: 'https://docs.bnbchain.org',
        explorer: 'https://bscscan.com',
        label: 'BNB Chain',
        color: '#F0B90B',
        logo: { light: BnbLogo, dark: BnbLogo }
    },
    [CHAIN_IDS.POLYGON]: {
        docs: 'https://docs.polygon.technology',
        explorer: 'https://polygonscan.com',
        label: 'Polygon',
        color: '#8247E5',
        logo: { light: PolygonLogo, dark: PolygonLogo }
    },
    [CHAIN_IDS.AVALANCHE]: {
        docs: 'https://docs.avax.network',
        explorer: 'https://snowtrace.io',
        label: 'Avalanche',
        color: '#E84142',
        logo: { light: AvalancheLogo, dark: AvalancheLogo }
    },
    [CHAIN_IDS.LENS]: {
        docs: 'https://docs.lens.xyz',
        explorer: 'https://momoka.lens.xyz',
        label: 'Lens',
        color: '#00501E',
        logo: { light: LensLogo, dark: LensLogo }
    },
    [CHAIN_IDS.LINEA]: {
        docs: 'https://docs.linea.build',
        explorer: 'https://lineascan.build',
        label: 'Linea',
        color: '#000000',
        logo: { light: LineaLogo, dark: LineaLogo }
    },
    [CHAIN_IDS.PLASMA]: {
        docs: 'https://docs.plasma.to',
        explorer: 'https://explorer.plasma.to',
        label: 'Plasma',
        color: '#000000',
        logo: { light: PlasmaLogo, dark: PlasmaLogo }
    }
}

/**
 * Map with chain information for supported networks.
 * Ordered by relevance, first is most relevant.
 * Keep in mind when iterating over this map that the order of keys is guaranteed to be numerically sorted.
 * So this order is mostly for reference and not for iteration.
 */
export const CHAIN_INFO = {
  [CHAIN_IDS.MAINNET]: {
    ...mapChainInfoToBaseChainInfo(mainnet, FALLBACK_DATA[CHAIN_IDS.MAINNET as SupportedChainId]),
    name: 'ethereum',
    urlAlias: '',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.MAINNET as SupportedChainId],
  },
  [CHAIN_IDS.BNB]: {
    ...mapChainInfoToBaseChainInfo(bnb, FALLBACK_DATA[CHAIN_IDS.BNB as SupportedChainId]),
    name: 'bnb',
    urlAlias: 'bnb',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.BNB as SupportedChainId],
  },
  [CHAIN_IDS.BASE]: {
    ...mapChainInfoToBaseChainInfo(base, FALLBACK_DATA[CHAIN_IDS.BASE as SupportedChainId]),
    name: 'base',
    urlAlias: 'base',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.BASE as SupportedChainId],
  },
  [CHAIN_IDS.ARBITRUM_ONE]: {
    ...mapChainInfoToBaseChainInfo(arbitrumOne, FALLBACK_DATA[CHAIN_IDS.ARBITRUM_ONE as SupportedChainId]),
    name: 'arbitrum_one',
    urlAlias: 'arb1',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.ARBITRUM_ONE as SupportedChainId],
  },
  [CHAIN_IDS.POLYGON]: {
    ...mapChainInfoToBaseChainInfo(polygon, FALLBACK_DATA[CHAIN_IDS.POLYGON as SupportedChainId]),
    name: 'polygon',
    urlAlias: 'pol',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.POLYGON as SupportedChainId],
  },
  [CHAIN_IDS.AVALANCHE]: {
    ...mapChainInfoToBaseChainInfo(avalanche, FALLBACK_DATA[CHAIN_IDS.AVALANCHE as SupportedChainId]),
    name: 'avalanche',
    urlAlias: 'avax',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.AVALANCHE as SupportedChainId],
  },
  [CHAIN_IDS.GNOSIS_CHAIN]: {
    ...mapChainInfoToBaseChainInfo(gnosisChain, FALLBACK_DATA[CHAIN_IDS.GNOSIS_CHAIN as SupportedChainId]),
    name: 'gnosis_chain',
    urlAlias: 'gc',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.GNOSIS_CHAIN as SupportedChainId],
  },
  [CHAIN_IDS.LENS]: {
    ...mapChainInfoToBaseChainInfo(lens, FALLBACK_DATA[CHAIN_IDS.LENS as SupportedChainId]),
    name: 'lens',
    urlAlias: 'lens',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.LENS as SupportedChainId],
  },
  [CHAIN_IDS.LINEA]: {
    ...mapChainInfoToBaseChainInfo(linea, FALLBACK_DATA[CHAIN_IDS.LINEA as SupportedChainId]),
    name: 'linea',
    urlAlias: 'linea',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.LINEA as SupportedChainId],
  },
  [CHAIN_IDS.PLASMA]: {
    ...mapChainInfoToBaseChainInfo(plasma, FALLBACK_DATA[CHAIN_IDS.PLASMA as SupportedChainId]),
    name: 'plasma',
    urlAlias: 'plasma',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.PLASMA as SupportedChainId],
  },
  [CHAIN_IDS.SEPOLIA]: {
    ...mapChainInfoToBaseChainInfo(sepolia, FALLBACK_DATA[CHAIN_IDS.SEPOLIA as SupportedChainId]),
    name: 'sepolia',
    urlAlias: 'sepolia',
    nativeCurrency: NATIVE_CURRENCIES[CHAIN_IDS.SEPOLIA as SupportedChainId],
  },
} as ChainInfoMap

/**
 * Sorted array of chain IDs in order of relevance.
 */
export const SORTED_CHAIN_IDS: SupportedChainId[] = [
  CHAIN_IDS.MAINNET,
  CHAIN_IDS.BNB,
  CHAIN_IDS.BASE,
  CHAIN_IDS.ARBITRUM_ONE,
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.AVALANCHE,
  CHAIN_IDS.LINEA,
  CHAIN_IDS.PLASMA,
  CHAIN_IDS.GNOSIS_CHAIN,
  CHAIN_IDS.LENS,
  CHAIN_IDS.SEPOLIA,
] as SupportedChainId[]

export const CHAIN_INFO_ARRAY: BaseChainInfo[] = SORTED_CHAIN_IDS.map((id) => CHAIN_INFO[id])

export function getChainInfo(chainId: SupportedChainId): BaseChainInfo {
  const info = CHAIN_INFO[chainId]
  if (!info) {
    console.error(`Chain info not found for chain ${chainId}. Available chains:`, Object.keys(CHAIN_INFO))
    // Return a fallback to prevent crash
    return {
      docs: '',
      bridge: undefined,
      explorer: '',
      infoLink: '',
      logo: { light: '', dark: '' },
      name: 'unknown',
      addressPrefix: '',
      label: `Unknown Chain (${chainId})`,
      eip155Label: '',
      urlAlias: '',
      explorerTitle: '',
      color: '#000000',
      nativeCurrency: new TokenWithLogo(
        undefined,
        typeof chainId === 'number' ? chainId : 0,
        '0x0000000000000000000000000000000000000000',
        18,
        '???',
        'Unknown'
      )
    }
  }
  return info
}
