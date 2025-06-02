import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useReferralSignup } from 'modules/referral/useReferralSignup'
import { useWeb3React } from '@web3-react/core'
import { shortenAddress } from '@cowprotocol/common-utils'
import { Loader, UI } from '@cowprotocol/ui'

const CenteredContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: var(${UI.COLOR_PAPER}); */
`

const Card = styled.div`
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 24px;
  box-shadow: 0 6px 32px rgba(30, 136, 229, 0.10);
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  min-width: 340px;
  max-width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid var(${UI.COLOR_PRIMARY});
`

const ReferralCode = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(${UI.COLOR_PRIMARY_DARKEST});
  margin-bottom: 1.2rem;
  letter-spacing: 1px;
  background: var(${UI.COLOR_PRIMARY_LIGHTER});
  padding: 0.4em 1.2em;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.07);
`

const Message = styled.div`
  font-size: 1.1rem;
  color: var(${UI.COLOR_TEXT});
  margin-bottom: 2rem;
  text-align: center;
`

const Success = styled.div`
  color: var(${UI.COLOR_SUCCESS});
  font-weight: 600;
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1.15rem;
`

const Error = styled.div`
  color: var(${UI.COLOR_ERROR});
  font-weight: 600;
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
`

const Welcome = styled.h2`
  font-size: 2.1rem;
  font-weight: 800;
  color: var(${UI.COLOR_PRIMARY});
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: 0.5px;
`

const Subtitle = styled.div`
  font-size: 1.15rem;
  color: var(${UI.COLOR_TEXT_SECONDARY});
  margin-bottom: 2.2rem;
  text-align: center;
  max-width: 350px;
`

export default function ReferralConfirmation() {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const referral = queryParams.get('ref')

    const { account } = useWeb3React()
    const { signup, loading, status, message } = useReferralSignup()

    useEffect(() => {
        if (account && referral && status === 'idle') {
            signup(account, referral)
        }
    }, [account, referral, signup, status])

    return (
        <CenteredContainer>
            <Card>
                <Welcome>Welcome to ChameleonSwap!</Welcome>
                <Subtitle>
                    {account
                        ? 'You are just one step away from unlocking your referral rewards.'
                        : 'Sign up in seconds and start trading with your friend’s referral code!'}
                </Subtitle>
                <ReferralCode>
                    Referral Code: <span style={{ color: 'inherit', fontWeight: 800 }}>{referral || 'N/A'}</span>
                </ReferralCode>
                {!account && (
                    <Message>
                        Connect your wallet to sign up and claim your referral bonus.<br />
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #888)' }}>
                            No registration forms. No passwords. Just connect and go!
                        </span>
                    </Message>
                )}
                {account && status === 'idle' && (
                    <Message>
                        Signing you up with <b>{shortenAddress(account, 6)}</b>...
                        <Loader style={{ marginLeft: 8 }} />
                    </Message>
                )}
                {loading && (
                    <Message>
                        Processing... <Loader style={{ marginLeft: 8 }} />
                    </Message>
                )}
                {status === 'success' && <Success>🎉 {message} <br />You can now enjoy all the features of ChameleonSwap!</Success>}
                {status === 'exists' && <Success>👋 {message} <br />Welcome back! You’re already part of the ChameleonSwap community.</Success>}
                {status === 'error' && <Error>{message}</Error>}
            </Card>
        </CenteredContainer>
    )
}
