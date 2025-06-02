import { useEffect } from 'react'
import { shortenAddress } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Loader, RowBetween } from '@cowprotocol/ui'
import { ConnectionType } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import ICON_WALLET from 'assets/icon/wallet.svg'
import SVG from 'react-inlinesvg'

import { upToExtraSmall, upToTiny, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { Text, Web3StatusConnect, Web3StatusConnected } from './styled'

import { StatusIcon } from '../StatusIcon'

// Referall Link Implementation
import http from 'utils/http'
import { useLocation } from 'react-router-dom';

// Import ENV VITE_SYSTEM_BEARER_TOKEN from .env
const SYSTEM_BEARER_TOKEN = import.meta.env.VITE_SYSTEM_BEARER_TOKEN

export interface Web3StatusInnerProps {
  account?: string
  pendingCount: number
  connectWallet: Command
  connectionType: ConnectionType
  ensName?: string | null
}

export function Web3StatusInner(props: Web3StatusInnerProps) {
  const { account, pendingCount, ensName, connectionType, connectWallet } = props

  const hasPendingTransactions = !!pendingCount
  const isUpToExtraSmall = useMediaQuery(upToExtraSmall)
  const isUpToTiny = useMediaQuery(upToTiny)
  const location = useLocation()

  const queryParmams = new URLSearchParams(location.search);
  const referral = queryParmams.get('ref')


  async function createNewUser() {
    try {
      const response = await http.post('/api/v1/trader', { walletAddress: account, referralCode: referral ? referral : "" }, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
        },
      })

      return response.data.message;
    } catch (error) {
      console.error(error);
      return "Error creating user";
    }
  }

  useEffect(() => {
    // Make API Call
    if (account) {
      createNewUser()
    }
  }, [account])

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween gap="6px">
            <Text>
              <Trans>{pendingCount} Pending</Trans>
            </Text>{' '}
            <Loader stroke="currentColor" />
          </RowBetween>
        ) : (
          <Text>{ensName || shortenAddress(account, isUpToTiny ? 4 : isUpToExtraSmall ? 3 : 4)}</Text>
        )}
        {!hasPendingTransactions && <StatusIcon connectionType={connectionType} />}
      </Web3StatusConnected>
    )
  }

  return (
    <Web3StatusConnect id="connect-wallet" onClick={connectWallet} faded={!account}>
      <Text>
        <Trans>Connect wallet</Trans>
      </Text>
      <SVG src={ICON_WALLET} title="Wallet" />
    </Web3StatusConnect>
  )
}
