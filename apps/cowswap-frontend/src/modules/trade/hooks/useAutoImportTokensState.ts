import { useMemo } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { useSearchNonExistentToken } from '@cowprotocol/tokens'

import { Nullish } from 'types'

import { ModalState, useModalState } from 'common/hooks/useModalState'

interface AutoImportTokensState {
  tokensToImport: Array<TokenWithLogo>
  modalState: ModalState<void>
}
export function useAutoImportTokensState(
  inputToken: Nullish<string>,
  outputToken: Nullish<string>,
): AutoImportTokensState {
  const foundInputToken = useSearchNonExistentToken(inputToken || null)
  const foundOutputToken = useSearchNonExistentToken(outputToken || null)

  const tokensToImport = useMemo(() => {
    return [foundInputToken, foundOutputToken].filter(isTruthy).filter((token) => !(token instanceof LpToken))
  }, [foundInputToken, foundOutputToken])

  const tokensToImportCount = tokensToImport.length

  const modalState = useModalState<void>(tokensToImportCount > 0)

  return useMemo(() => ({ tokensToImport, modalState }), [tokensToImport, modalState])
}
