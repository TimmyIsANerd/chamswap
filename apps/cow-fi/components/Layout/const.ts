import { MenuItem, ProductVariant } from '@cowprotocol/ui'
import { clickOnNavigation } from 'modules/analytics'

export const PAGE_MAX_WIDTH = 1760
export const THEME_MODE = 'dark'
export const PRODUCT_VARIANT = ProductVariant.CowDao

export const NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      {
        label: 'Stats',
        href: 'https://dune.com/cowprotocol/cowswap',
        external: true,
      },
      {
        label: 'Governance',
        href: 'https://docs.cow.fi/governance',
        external: true,
      },
      {
        label: 'Grants',
        href: 'https://grants.cow.fi/',
        external: true,
      },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    label: 'Products',
    children: [
      {
        label: 'Chameleaon swap',
        href: '/cow-swap',
      },
      {
        label: 'CoW Protocol',
        href: '/cow-protocol',
      },
      {
        label: 'CoW AMM',
        href: '/cow-amm',
      },
      {
        label: 'MEV Blocker',
        href: '/mev-blocker',
      },
      {
        label: 'More',
        children: [
          {
            label: 'Widget',
            href: '/widget',
          },
          {
            label: 'CoW Explorer',
            href: 'https://explorer.cow.fi/',
            external: true,
            utmContent: 'menubar-nav-item-cow-explorer',
          },
        ],
      },
    ],
  },
  {
    label: 'Learn',
    children: [
      {
        href: '/learn',
        label: 'Knowledge Base',
      },
      {
        href: 'https://docs.cow.fi/',
        label: 'Docs',
        external: true,
        utmContent: 'menubar-nav-item-docs',
      },
    ],
  },
]

export const NAV_ADDITIONAL_BUTTONS = [
  // {
  //   label: 'Use MEV Blocker',
  //   href: 'https://cow.fi/mev-blocker',
  //   utmContent: 'menubar-nav-button-use-mev-blocker',
  //   external: true,
  //   isButton: true,
  //   bgColor: '#EC4612',
  //   color: '#FEE7CF',
  // },
  {
    label: 'LP on CoW AMM',
    href: 'https://balancer.fi/pools/cow',
    utmContent: 'menubar-nav-button-lp-on-cow-amm',
    onClick: () => clickOnNavigation('click-lp-on-cow-amm'),
    external: true,
    isButton: true,
    bgColor: '#194D05',
    color: '#BCEC79',
  },
  {
    label: 'Trade on Chameleaon swap',
    href: 'https://chameleon.exchange/#/1/swap/USDC/COW',
    utmContent: 'menubar-nav-button-trade-on-cow-swap',
    onClick: () => clickOnNavigation('click-trade-on-cow-swap'),
    external: true,
    isButton: true,
    bgColor: '#ff65ff',
    color: '#012F7A',
  },
]
