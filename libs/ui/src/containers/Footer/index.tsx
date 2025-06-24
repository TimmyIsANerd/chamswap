import { useState, ReactNode, useRef } from 'react'

import { CowAnalytics, useCowAnalytics } from '@cowprotocol/analytics'
import IMG_ICON_ARROW_RIGHT_CIRCULAR from '@cowprotocol/assets/images/arrow-right-circular.svg'
import IMG_ICON_SOCIAL_DISCORD from '@cowprotocol/assets/images/icon-social-discord.svg'
import IMG_ICON_SOCIAL_FORUM from '@cowprotocol/assets/images/icon-social-forum.svg'
import IMG_ICON_SOCIAL_GITHUB from '@cowprotocol/assets/images/icon-social-github.svg'
import IMG_ICON_SOCIAL_SNAPSHOT from '@cowprotocol/assets/images/icon-social-snapshot.svg'
import IMG_ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import { useTheme } from '@cowprotocol/common-hooks'

import SVG from 'react-inlinesvg'

import { FooterAnimation } from './footerAnimation'
import {
  FooterContainer,
  FooterContent,
  FooterLogo,
  FooterDescriptionSection,
  Description,
  SocialIconsWrapper,
  SocialIconLink,
  SectionTitle,
  LinkListWrapper,
  LinkListGroup,
  LinkList,
  Link,
  FooterBottom,
  BottomText,
  FooterBottomLogos,
  BottomRight,
  ToggleFooterButton,
} from './styled'

import { clickOnFooter } from '../../analytics/events'
import { Color } from '../../consts'
import { MenuItem } from '../../pure/MenuBar'
import { ProductLogo, ProductVariant } from '../../pure/ProductLogo'

export interface FooterProps {
  description?: string
  navItems?: MenuItem[]
  productVariant: ProductVariant
  additionalFooterContent?: ReactNode
  expanded?: boolean
  hasTouchFooter?: boolean
  maxWidth?: number
  host?: string
}

const SOCIAL_LINKS: { href: string; label: string; icon: string; external: boolean; utmContent: string }[] = [
  {
    href: 'https://x.com/#',
    label: 'Twitter/X',
    icon: IMG_ICON_SOCIAL_X,
    external: true,
    utmContent: 'social-twitter',
  },
  {
    href: 'https://discord.com/invite/#',
    label: 'Discord',
    icon: IMG_ICON_SOCIAL_DISCORD,
    external: true,
    utmContent: 'social-discord',
  },
  {
    href: 'https://github.com/#',
    label: 'GitHub',
    icon: IMG_ICON_SOCIAL_GITHUB,
    external: true,
    utmContent: 'social-github',
  },
  {
    href: '#',
    label: 'Forum',
    icon: IMG_ICON_SOCIAL_FORUM,
    external: true,
    utmContent: 'social-forum',
  },
  {
    href: '#',
    label: 'Snapshot',
    icon: IMG_ICON_SOCIAL_SNAPSHOT,
    external: true,
    utmContent: 'social-snapshot',
  },
]

const PRODUCT_LOGO_LINKS: {
  href: string
  label: string
  productVariant: ProductVariant
  external: boolean
  utmContent: string
}[] = [
  {
    href: 'https://chameleon.exchange/',
    label: 'Chameleon Swap',
    productVariant: ProductVariant.ChameleonSwap,
    external: true,
    utmContent: 'product-chameleon-swap',
  },
  // {
  //   href: '#',
  //   label: 'CoW Protocol',
  //   productVariant: ProductVariant.CowProtocol,
  //   external: true,
  //   utmContent: 'product-cow-protocol',
  // },
  // {
  //   href: '#',
  //   label: 'MEV Blocker',
  //   productVariant: ProductVariant.MevBlocker,
  //   external: true,
  //   utmContent: 'product-mev-blocker',
  // },
  // {
  //   href: '#',
  //   label: 'CoW AMM',
  //   productVariant: ProductVariant.CowAmm,
  //   external: true,
  //   utmContent: 'product-cow-amm',
  // },
]

const GLOBAL_FOOTER_DESCRIPTION =
  'Chameleon Swap is an open collective of developers, market makers, and community contributors on a mission to protect users from the dangers of DeFi.'

const GLOBAL_FOOTER_NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      { href: '#', label: 'Governance', external: true, utmContent: 'footer-about-governance' },
      { href: '#', label: 'Revenue', external: true, utmContent: 'footer-about-revenue' },
      { href: '#', label: 'Grants', external: true, utmContent: 'footer-about-grants' },
      { href: '#', label: 'Careers', external: true, utmContent: 'footer-about-careers' },
      { href: '#', label: 'Brand Kit', external: true, utmContent: 'footer-about-brand-kit' },
      { href: '#', label: 'Legal', external: true, utmContent: 'footer-about-legal' },
    ],
  },
  {
    label: 'Products',
    children: [
      {
        label: 'Chameleon swap',
        href: 'https://chameleon.exchange/',
        external: true,
        utmContent: 'footer-products-cow-swap',
      },
      { label: 'Chameleon Protocol', href: '#', external: true, utmContent: 'footer-products-chameleon-protocol' },
      { label: 'Chameleon AMM', href: '#', external: true, utmContent: 'footer-products-cow-amm' },
      { label: 'MEV Blocker', href: '#', external: true, utmContent: 'footer-products-mev-blocker' },
      { label: 'Chameleon Explorer', href: '#', external: true, utmContent: 'footer-products-cow-explorer' },
      { label: 'Chameleon Widget', href: '#', external: true, utmContent: 'footer-products-cow-widget' },
    ],
  },
  {
    label: 'Help',
    children: [
      { label: 'Docs', href: '#', external: true, utmContent: 'footer-help-docs' },
      { label: 'Knowledge Base', href: '#', external: true, utmContent: 'footer-help-knowledge-base' },
      { label: 'Report Scams', href: '#', external: true, utmContent: 'footer-help-report-scams' },
    ],
  },
  {
    label: 'Misc.',
    children: [
      { label: 'For DAOs', href: '#', external: true, utmContent: 'footer-misc-for-daos' },
      { label: 'Token Charts', href: '#', external: true, utmContent: 'footer-misc-token-charts' },
    ],
  },
]

interface FooterLinkProps {
  href: string
  external?: boolean
  label?: string
  utmSource?: string
  utmContent?: string
  rootDomain?: string
  cowAnalytics: CowAnalytics
}

const FooterLink = ({ href, external, label, utmSource, utmContent, rootDomain, cowAnalytics }: FooterLinkProps) => {
  const finalRootDomain = rootDomain || (typeof window !== 'undefined' ? window.location.host : '')

  const finalHref = external
    ? appendUtmParams(href, utmSource, utmContent, finalRootDomain, external, label)
    : (() => {
        try {
          return `${new URL(href, `https://${finalRootDomain}`).pathname}`
        } catch {
          return href.startsWith('/') ? href : `/${href}`
        }
      })()

  return (
    <Link
      href={finalHref}
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={() => clickOnFooter(cowAnalytics, `click-${utmContent || label?.toLowerCase().replace(/\s+/g, '-')}`)}
    >
      {label}
    </Link>
  )
}

const appendUtmParams = (
  href: string,
  utmSource: string | undefined,
  utmContent: string | undefined,
  rootDomain: string,
  isExternal: boolean,
  label: string | undefined,
) => {
  const finalRootDomain = rootDomain || (typeof window !== 'undefined' ? window.location.host : '')

  const defaultUtm = {
    utmSource: finalRootDomain,
    utmMedium: 'web',
    utmContent: `footer-nav-button-${label?.toLowerCase().replace(/\s+/g, '-')}`,
  }
  const finalUtmSource = utmSource || defaultUtm.utmSource
  const finalUtmContent = utmContent || defaultUtm.utmContent

  if (isExternal) {
    const url = href.startsWith('http') ? new URL(href) : new URL(href, `https://${finalRootDomain}`)

    const hash = url.hash
    url.hash = '' // Remove the hash temporarily to prevent it from interfering with the search params
    url.searchParams.set('utm_source', finalUtmSource)
    url.searchParams.set('utm_medium', defaultUtm.utmMedium)
    url.searchParams.set('utm_content', finalUtmContent)
    url.hash = hash // Re-attach the hash

    return url.toString()
  }

  return href
}

export const Footer = ({
  description = GLOBAL_FOOTER_DESCRIPTION,
  navItems = GLOBAL_FOOTER_NAV_ITEMS,
  additionalFooterContent,
  expanded = false,
  hasTouchFooter = false,
  maxWidth,
  host,
}: FooterProps) => {
  const cowAnalytics = useCowAnalytics()
  const [isFooterExpanded, setIsFooterExpanded] = useState(expanded)
  const footerRef = useRef<HTMLDivElement>(null)

  const theme = useTheme()

  const toggleFooter = () => {
    setIsFooterExpanded((state) => {
      if (!state && footerRef.current) {
        setTimeout(() => {
          footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 300) // Slight delay needed for correct scroll position calculation
      }

      return !state
    })
  }

  return (
    <FooterContainer ref={footerRef} expanded={isFooterExpanded} hasTouchFooter={hasTouchFooter}>
      {isFooterExpanded && (
        <>
          <FooterContent maxWidth={maxWidth}>
            <FooterDescriptionSection>
              <FooterLogo>
                <ProductLogo
                  variant={ProductVariant.ChameleonSwap}
                  height={32}
                  overrideColor={!theme?.darkMode ? Color.neutral100 : Color.neutral90}
                  overrideHoverColor={!theme?.darkMode ? Color.neutral98 : Color.neutral95}
                />
              </FooterLogo>
              {description && <Description>{description}</Description>}
              <SocialIconsWrapper>
                {SOCIAL_LINKS.map((social, index) => (
                  <SocialIconLink key={index} href={social.href} target="_blank" rel="noopener noreferrer">
                    <SVG src={social.icon} title={social.label} />
                  </SocialIconLink>
                ))}
              </SocialIconsWrapper>
            </FooterDescriptionSection>

            <LinkListWrapper>
              {navItems.map((item, index) => (
                <LinkListGroup key={index}>
                  <SectionTitle>{item.label}</SectionTitle>
                  <LinkList>
                    {item.children?.map((child, childIndex) => (
                      <li key={childIndex}>
                        <FooterLink
                          href={child.href || '#'}
                          external={child.external}
                          label={child.label}
                          utmSource={child.utmSource}
                          utmContent={child.utmContent}
                          rootDomain={host || window.location.host}
                          cowAnalytics={cowAnalytics}
                        />
                      </li>
                    ))}
                  </LinkList>
                </LinkListGroup>
              ))}
            </LinkListWrapper>
          </FooterContent>

          <FooterAnimation />
        </>
      )}
      <FooterBottom maxWidth={maxWidth}>
        <BottomText>&copy; Chameleon Swap - {new Date().getFullYear()}</BottomText>
        <FooterBottomLogos>
          {PRODUCT_LOGO_LINKS.map((product, index) => (
            <ProductLogo
              key={index}
              variant={product.productVariant}
              logoIconOnly={false}
              overrideColor={!theme?.darkMode ? Color.neutral40 : Color.neutral40}
              overrideHoverColor={Color.neutral98}
              height={24}
              href={product.href}
              external={true}
              aria-label={`Visit the ${product.label} website`}
            />
          ))}
        </FooterBottomLogos>

        <BottomRight>
          {additionalFooterContent && additionalFooterContent}
          <ToggleFooterButton onClick={toggleFooter} expanded={isFooterExpanded}>
            <SVG src={IMG_ICON_ARROW_RIGHT_CIRCULAR} title="Toggle Footer" />
          </ToggleFooterButton>
        </BottomRight>
      </FooterBottom>
    </FooterContainer>
  )
}
