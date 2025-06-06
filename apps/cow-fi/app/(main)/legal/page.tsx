'use client'

import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Link } from '@/components/Link'

import { ArticleContent, ArticleMainTitle, BodyContent, Breadcrumbs, ContainerCard } from '@/styles/styled'
import { clickOnLegal } from '../../../modules/analytics'

const LEGAL_LINKS = [
  {
    title: 'CoW Widget Terms and Conditions',
    href: '/legal/widget-terms',
  },
  {
    title: 'Chameleaon swap Terms and Conditions',
    href: '/legal/cowswap-terms',
  },
  {
    title: 'Chameleaon swap Privacy Policy',
    href: '/legal/cowswap-privacy-policy',
  },
  {
    title: 'Chameleaon swap Cookie Policy',
    href: '/legal/cowswap-cookie-policy',
  },
]

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  margin: 24px auto 0;
  gap: 24px;
`

export default function Page() {
  return (
    <Wrapper>
      <ContainerCard bgColor={Color.neutral100} minHeight="70vh" gap={62} gapMobile={42} centerContent touchFooter>
        <ArticleContent maxWidth="100%">
          <Breadcrumbs>
            <Link href="/" onClick={() => clickOnLegal('click-legal-breadcrumbs')}>
              Home
            </Link>

            <span>CoW DAO Legal Overview</span>
          </Breadcrumbs>

          <ArticleMainTitle margin={'0 0 62px'} fontSize={52}>
            CoW DAO Legal Overview
          </ArticleMainTitle>

          <BodyContent>
            <p>An overview of all legal documents related to CoW DAO and its products.</p>

            <ul>
              {LEGAL_LINKS.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} onClick={() => clickOnLegal(`click-${link.title}`)}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </BodyContent>
        </ArticleContent>
      </ContainerCard>
    </Wrapper>
  )
}
