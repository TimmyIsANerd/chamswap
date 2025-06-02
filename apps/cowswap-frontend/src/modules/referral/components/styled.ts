import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Container = styled.div`
  padding: 24px;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  background-color: var(${UI.COLOR_PAPER});
  border-radius: 12px;
`

export const Title = styled.h2`
  color: var(${UI.COLOR_TEXT});
  margin-bottom: 16px;
  font-size: 24px;
`

export const Description = styled.p`
  color: var(${UI.COLOR_SECONDARY});
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 1.5;
`

export const Link = styled.span`
  color: var(${UI.COLOR_PRIMARY});
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`
