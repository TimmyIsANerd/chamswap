import { useEffect, useState } from 'react'

import { ExternalLink } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { generateReferralCode } from './utils'
import http from 'utils/http'

// Import Bearer from ENV
const SYSTEM_BEARER_TOKEN = import.meta.env.VITE_SYSTEM_BEARER_TOKEN


const Wrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
`

const ContentCard = styled.div`
  background: ${({ theme }) => theme.bg1};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
  color: ${({ theme }) => theme.text1};
`

const ReferralCodeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`

const ReferralCode = styled.div`
  background: ${({ theme }) => theme.bg2};
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
`

const Button = styled.button`
  background: ${({ theme }) => theme.primary1};
  color: #9c19c5e8;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primary2};
  }

  &:disabled {
    background: ${({ theme }) => theme.bg3};
    cursor: not-allowed;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  padding: 16px;
  border-radius: 12px;
  text-align: center;

  h3 {
    font-size: 14px;
    color: ${({ theme }) => theme.text2};
    margin-bottom: 8px;
  }

  p {
    font-size: 24px;
    font-weight: bold;
    color: ${({ theme }) => theme.text1};
    margin: 0;
  }
`

const ShareSection = styled.div`
  text-align: center;

  h2 {
    margin-bottom: 16px;
    color: ${({ theme }) => theme.text1};
  }

  p {
    margin-bottom: 24px;
    color: ${({ theme }) => theme.text2};
  }
`

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
`

const InfoList = styled.ul`
  margin: 16px 0;
  padding-left: 20px;
  color: ${({ theme }) => theme.text2};

  li {
    margin-bottom: 8px;
  }
`

export function RewardPage() {
  const { account, chainId } = useWalletInfo()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [referrals, setReferrals] = useState(0)
  const [volume, setVolume] = useState(0)
  const getData = async () => {
    try {
      const chains = {
        1: 'ethereum',
        11155111: 'sepolia',
        42161: 'arbitrum-one',
        100: 'gnosis',
        8453: 'base',
      }

      const response = await http.get(`/api/v1/trader/${account}/${chains[chainId]}`,
        {
          headers: {
            Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      const { trader } = response.data
      if (trader) {
        // console.log(trader)
        setPoints(trader.totalPoints)
        setReferrals(trader.referrals.length)
        setReferralCode(trader.referralCode)
        setVolume(trader.totalTradingVolume)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (account) {
      // TODO: Fetch user's referral code if exists
      // TODO: Fetch user's points and statistics from API
      // Mock data for now
      getData()
      // setPoints(1500)
      // setReferrals(3)
      // setVolume(25000)
    }
  }, [account])

  const handleGenerateReferralCode = async () => {
    try {
      const { data } = await http.get(`/api/v1/trader/referral-code/${account}`, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      setReferralCode(data.referralCode)
    } catch (error) {
      console.log(error.message)
      console.log(error)
    }
  }

  const copyReferralLink = () => {
    const link = `https://chameleon.exchange/#/referral?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    // TODO: Add toast notification for successful copy
  }

  const shareOnTwitter = () => {
    const text = `Get 5% of my trading fees when you trade on @chameleon_swap! Use my referral code: ${referralCode}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (!account) {
    return (
      <Wrapper>
        <Title><Trans>Connect your wallet to access rewards</Trans></Title>
        <ContentCard>
          <p style={{ textAlign: 'center', color: '${({ theme }) => theme.text2}' }}>
            <Trans>Please connect your wallet to view your rewards and generate a referral code.</Trans>
          </p>
        </ContentCard>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Title><Trans>Chameleon Rewards & Referrals</Trans></Title>

      <ContentCard>
        <ReferralCodeSection>
          {referralCode ? (
            <>
              <ReferralCode>{referralCode}</ReferralCode>
              <Button onClick={copyReferralLink}><Trans>Copy Link</Trans></Button>
            </>
          ) : (
            <Button onClick={handleGenerateReferralCode}><Trans>Generate Referral Code</Trans></Button>
          )}
        </ReferralCodeSection>

        <StatsGrid>
          <StatCard>
            <h3><Trans>Your Points</Trans></h3>
            <p>{points.toLocaleString()}</p>
          </StatCard>
          <StatCard>
            <h3><Trans>Total Referrals</Trans></h3>
            <p>{referrals}</p>
          </StatCard>
          <StatCard>
            <h3><Trans>Trading Volume</Trans></h3>
            <p>${volume.toLocaleString()}</p>
          </StatCard>
        </StatsGrid>

        <ShareSection>
          <h2><Trans>Share Your Referral Code</Trans></h2>
          <p><Trans>Invite friends to trade on Chameleon and earn points together!</Trans></p>
          <SocialLinks>
            <Button onClick={shareOnTwitter}><Trans>Share on Twitter</Trans></Button>
            <Button onClick={copyReferralLink}><Trans>Copy Link</Trans></Button>
          </SocialLinks>
        </ShareSection>
      </ContentCard>

      <ContentCard>
        <h2 style={{ marginBottom: '16px', color: '${({ theme }) => theme.text1}' }}><Trans>How It Works</Trans></h2>
        <InfoList>
          <li><Trans>Generate your unique referral code</Trans></li>
          <li><Trans>Share it with friends and community</Trans></li>
          <li><Trans>Earn points when your referrals trade on Chameleon Swap</Trans></li>
          <li><Trans>Redeem your points for exclusive rewards</Trans></li>
        </InfoList>
        <ExternalLink href="/rewards/learn-more"><Trans>Learn more about the reward program</Trans> ↗</ExternalLink>
      </ContentCard>
    </Wrapper>
  )
}