import LOGO_CHAMELEONSWAP from '@cowprotocol/assets/images/Chameleon Swap header.svg'
import LOGO_COWAMM from '@cowprotocol/assets/images/logo-cowamm.svg'
import LOGO_COWDAO from '@cowprotocol/assets/images/logo-cowdao.svg'
import LOGO_COWEXPLORER from '@cowprotocol/assets/images/logo-cowexplorer.svg'
import LOGO_COWPROTOCOL from '@cowprotocol/assets/images/logo-cowprotocol.svg'
import LOGO_COWSWAP_CHRISTMAS_DARK from '@cowprotocol/assets/images/logo-cowswap-christmas-dark.svg'
import LOGO_COWSWAP_CHRISTMAS from '@cowprotocol/assets/images/logo-cowswap-christmas-light.svg'
import LOGO_COWSWAP_HALLOWEEN from '@cowprotocol/assets/images/logo-cowswap-halloween.svg'
import LOGO_COWSWAP from '@cowprotocol/assets/images/logo-cowswap.svg'
import LOGO_ICON_COW from '@cowprotocol/assets/images/logo-icon-cow.svg'
import LOGO_ICON_MEVBLOCKER from '@cowprotocol/assets/images/logo-icon-mevblocker.svg'
import LOGO_MEVBLOCKER from '@cowprotocol/assets/images/logo-mevblocker.svg'
import LOGO_ICON_CHAMELEON from '@cowprotocol/assets/images/logo_icon_chameleonswap.svg'
import { useTheme } from '@cowprotocol/common-hooks'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { Media } from '../../consts'
import { Color } from '../../consts'
import { CowSwapTheme } from '../../types'

export enum ProductVariant {
  CowSwap = 'cowSwap',
  CowExplorer = 'cowExplorer',
  CowProtocol = 'cowProtocol',
  MevBlocker = 'mevBlocker',
  CowAmm = 'cowAmm',
  CowDao = 'cowDao',
}

interface LogoInfo {
  src: string
  alt: string
  color?: string // Optional color attribute for SVG
  height?: string // Optional height for both desktop and mobile
  heightMobile?: string // Optional height specifically for mobile
  preserveOriginalColors?: boolean // If true, original SVG colors will be preserved
}

export type ThemedLogo = Partial<Record<CowSwapTheme, { default: LogoInfo; logoIconOnly?: LogoInfo }>> & {
  light: { default: LogoInfo; logoIconOnly?: LogoInfo }
  dark: { default: LogoInfo; logoIconOnly?: LogoInfo }
  darkHalloween?: { default: LogoInfo; logoIconOnly?: LogoInfo }
  darkChristmas?: { default: LogoInfo }
  lightChristmas?: { default: LogoInfo }
}

const LOGOS: Record<ProductVariant, ThemedLogo> = {
  // Chameleaon swap
  [ProductVariant.CowSwap]: {
    light: {
      default: {
        src: LOGO_CHAMELEONSWAP,
        alt: 'Chameleaon swap',
        color: ' #760093',
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'Chameleaon swap',
        color: ' #760093',
      },
    },
    dark: {
      default: {
        src: LOGO_CHAMELEONSWAP,
        alt: ' Chameleaon swap',
        color: ' #c165ff',
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'Chameleaon swap',
        color: ' #c165ff',
      },
    },
    darkHalloween: {
      default: {
        src: LOGO_COWSWAP_HALLOWEEN,
        alt: 'Chameleaon swap',
        color: ' #ff65ff',
      },
    },
    darkChristmas: {
      default: {
        src: LOGO_COWSWAP_CHRISTMAS_DARK,
        alt: 'Chameleaon swap',
        color: ' #ff65ff',
        height: '56px',
        heightMobile: '50px',
        preserveOriginalColors: true,
      },
    },
    lightChristmas: {
      default: {
        src: LOGO_COWSWAP_CHRISTMAS,
        alt: 'Chameleaon swap',
        color: '#7a0093',
        height: '56px',
        heightMobile: '50px',
        preserveOriginalColors: true,
      },
    },
  },

  // CoW Explorer
  [ProductVariant.CowExplorer]: {
    light: {
      default: {
        src: LOGO_COWEXPLORER,
        alt: 'CoW Explorer',
        color: Color.neutral0,
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW Explorer',
        color: Color.neutral0,
      },
    },
    dark: {
      default: {
        src: LOGO_COWEXPLORER,
        alt: 'CoW Explorer',
        color: Color.neutral100,
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW Explorer',
        color: Color.neutral100,
      },
    },
  },

  // CoW DAO
  [ProductVariant.CowDao]: {
    light: {
      default: {
        src: LOGO_COWDAO,
        alt: 'CoW DAO',
        color: Color.neutral0,
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW DAO',
        color: Color.neutral0,
      },
    },
    dark: {
      default: {
        src: LOGO_COWDAO,
        alt: 'CoW DAO',
        color: Color.neutral100,
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW DAO',
        color: Color.neutral100,
      },
    },
  },

  // CoW Protocol
  [ProductVariant.CowProtocol]: {
    light: {
      default: {
        src: LOGO_COWPROTOCOL,
        alt: 'CoW Protocol',
        color: Color.neutral0,
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW Protocol',
        color: Color.neutral0,
      },
    },
    dark: {
      default: {
        src: LOGO_COWPROTOCOL,
        alt: 'CoW Protocol',
        color: Color.neutral100,
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW Protocol',
        color: Color.neutral100,
      },
    },
  },

  // MEV Blocker
  [ProductVariant.MevBlocker]: {
    light: {
      default: {
        src: LOGO_MEVBLOCKER,
        alt: 'MEV Blocker',
        color: '#EC4612',
      },
      logoIconOnly: {
        src: LOGO_ICON_MEVBLOCKER,
        alt: 'MEV Blocker',
        color: '#EC4612',
      },
    },
    dark: {
      default: {
        src: LOGO_MEVBLOCKER,
        alt: 'MEV Blocker',
        color: '#EC4612',
      },
      logoIconOnly: {
        src: LOGO_ICON_MEVBLOCKER,
        alt: 'MEV Blocker',
        color: '#EC4612',
      },
    },
  },

  // CoW AMM
  [ProductVariant.CowAmm]: {
    light: {
      default: {
        src: LOGO_COWAMM,
        alt: 'CoW AMM',
        color: '#012F7A',
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW AMM',
        color: '#012F7A',
      },
    },
    dark: {
      default: {
        src: LOGO_COWAMM,
        alt: 'CoW AMM',
        color: '#007CDB',
      },
      logoIconOnly: {
        src: LOGO_ICON_CHAMELEON,
        alt: 'CoW AMM',
        color: '#007CDB',
      },
    },
  },
}

export interface LogoProps {
  variant: ProductVariant
  theme?: CowSwapTheme
  logoIconOnly?: boolean
  overrideColor?: string // Optional override color
  overrideHoverColor?: string // Optional override hover color
  height?: number | string
  heightMobile?: number | string
  href?: string // Optional href for the logo
  external?: boolean // Indicates if the href is an external link
  className?: string
}

export const ProductLogoWrapper = styled.span<{
  color?: string
  hoverColor?: string
  height?: number | string
  heightMobile?: number | string
  preserveOriginalColors?: boolean
}>`
  --height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || '28px')};
  --heightMobile: ${({ heightMobile }) =>
    typeof heightMobile === 'number' ? `${heightMobile}px` : heightMobile || 'var(--height)'};
  ${({ preserveOriginalColors, color, hoverColor }) =>
    !preserveOriginalColors &&
    `
    --color: ${color || 'inherit'};
    --hoverColor: ${hoverColor || 'inherit'};
    color: var(--color);
  `}

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: var(--height);
  transition: color 0.2s ease-in-out;

  ${Media.upToSmall()} {
    height: var(--heightMobile);
  }

  > a,
  > a > svg,
  > svg {
    height: 100%;
    width: auto;
    ${({ preserveOriginalColors }) =>
      !preserveOriginalColors &&
      `
      color: inherit;
      fill: currentColor;
    `}
  }

  > a > svg path,
  > svg path {
    ${({ preserveOriginalColors }) => !preserveOriginalColors && `fill: currentColor;`}
  }

  &:hover {
    ${({ preserveOriginalColors }) => !preserveOriginalColors && `color: var(--hoverColor);`}
  }
`

export const ProductLogo = ({
  variant,
  theme: customThemeMode,
  logoIconOnly,
  overrideColor,
  overrideHoverColor,
  height,
  heightMobile,
  href,
  external = false,
  className,
}: LogoProps) => {
  const themeMode = useTheme()
  const selectedTheme = customThemeMode || (themeMode.darkMode ? 'dark' : 'light')
  const logoForTheme = LOGOS[variant][selectedTheme] || LOGOS[variant]['light'] // Fallback to light theme if selected theme is not available
  const logoInfo = logoIconOnly && logoForTheme.logoIconOnly ? logoForTheme.logoIconOnly : logoForTheme.default
  const initialColor = logoInfo.preserveOriginalColors ? undefined : overrideColor || logoInfo.color

  // First use logoInfo height, then prop height, then default
  const logoHeight = logoInfo.height || height || '28px'
  // First use logoInfo heightMobile, then prop heightMobile, then logoInfo height, then prop height, then default
  const logoHeightMobile = logoInfo.heightMobile || heightMobile || logoInfo.height || height || logoHeight

  const getAccessibleAltText = () => {
    const baseAlt = logoInfo.alt
    const linkText = href ? (external ? 'Visit external site: ' : 'Go to: ') : ''
    return `${linkText}${baseAlt}`
  }

  const logoElement = <SVG src={logoInfo.src} description={getAccessibleAltText()} />

  return (
    <ProductLogoWrapper
      className={className}
      color={initialColor}
      hoverColor={overrideHoverColor || 'inherit'}
      height={logoHeight}
      heightMobile={logoHeightMobile}
      preserveOriginalColors={logoInfo.preserveOriginalColors}
    >
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : '_self'}
          rel={external ? 'noopener noreferrer' : undefined}
          aria-label={getAccessibleAltText()}
        >
          {logoElement}
        </a>
      ) : (
        logoElement
      )}
    </ProductLogoWrapper>
  )
}
