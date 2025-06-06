import React, { useState } from 'react'

import { Media } from '@cowprotocol/ui'

import TabContent from 'components/common/Tabs/TabContent'
import TabItem from 'components/common/Tabs/TabItem'
import styled from 'styled-components/macro'

// Components
export { default as TabIcon } from 'components/common/Tabs/TabIcon'

type TabId = number
export enum IndicatorTabSize {
  small = 0.1,
  big = 0.2,
}
export type TabBarExtraContent = React.ReactNode

export interface TabItemInterface {
  readonly tab: React.ReactNode
  readonly content: React.ReactNode
  readonly id: TabId
}

export interface TabTheme {
  readonly activeBg: string
  readonly activeBgAlt: string
  readonly inactiveBg: string
  readonly activeText: string
  readonly inactiveText: string
  readonly activeBorder: string
  readonly inactiveBorder: string
  readonly letterSpacing: string
  readonly fontWeight: string
  readonly fontSize: string
  readonly borderRadius: boolean
  readonly indicatorTabSize: IndicatorTabSize
}
export interface Props {
  readonly className?: string
  readonly tabItems: TabItemInterface[]
  readonly tabTheme: TabTheme
  readonly selectedTab?: TabId
  readonly extra?: TabBarExtraContent
  readonly extraPosition?: 'top' | 'bottom' | 'both'
  readonly updateSelectedTab?: (activeId: TabId) => void
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 100%;
`

export const TabList = styled.div`
  position: sticky;
  top: 0;
  background: #16171f;
  z-index: 2;
  max-width: 100%;
  display: flex;
  justify-content: flex-start;
  border-bottom: ${({ theme }): string => `1px solid ${theme.borderPrimary}`};
  box-sizing: border-box;
  flex-flow: row wrap;

  > button {
    flex: 0 0 auto;
    min-width: 12rem;
    padding: 1rem;
    line-height: 2;
    height: auto;

    ${Media.upToSmall()} {
      flex: 1 1 auto;
    }
  }
`

export const DEFAULT_TAB_THEME: TabTheme = {
  activeBg: 'var(--color-transparent)',
  activeBgAlt: 'initial',
  inactiveBg: 'var(--color-transparent)',
  activeText: 'var(--color-text-primary)',
  inactiveText: 'var(--color-text-secondary2)',
  activeBorder: 'var(--color-text-primary)',
  inactiveBorder: 'none',
  fontSize: 'var(--font-size-default)',
  fontWeight: 'var(--font-weight-normal)',
  letterSpacing: 'initial',
  borderRadius: false,
  indicatorTabSize: IndicatorTabSize.small,
}

interface ExtraContentProps {
  extra?: TabBarExtraContent
}

const ExtraContent = ({ extra }: ExtraContentProps): React.ReactNode | null => {
  if (!extra) return null

  return <div className="tab-extra-content">{extra}</div>
}

const Tabs: React.FC<Props> = (props) => {
  const {
    tabTheme = DEFAULT_TAB_THEME,
    tabItems,
    selectedTab: parentSelectedTab,
    extra: tabBarExtraContent,
    extraPosition = 'top',
    updateSelectedTab: parentUpdateSelectedTab,
  } = props

  const [innerSelectedTab, setInnerSelectedTab] = useState(1)
  // Use parent state management if provided, otherwise use internal state
  const selectedTab = parentSelectedTab ?? innerSelectedTab
  const updateTab = parentUpdateSelectedTab ?? setInnerSelectedTab

  return (
    <Wrapper>
      <TabList role="tablist" className="tablist">
        {tabItems.map(({ tab, id }) => (
          <TabItem
            key={id}
            id={id}
            tab={tab}
            onTabClick={updateTab}
            isActive={selectedTab === id}
            tabTheme={tabTheme}
          />
        ))}
        {['top', 'both'].includes(extraPosition) && <ExtraContent extra={tabBarExtraContent} />}
      </TabList>
      <TabContent tabItems={tabItems} activeTab={selectedTab} />
      {['bottom', 'both'].includes(extraPosition) && <ExtraContent extra={tabBarExtraContent} />}
    </Wrapper>
  )
}

export default Tabs

export function getTabTheme(tabStyles: Partial<TabTheme> = {}): TabTheme {
  return {
    ...DEFAULT_TAB_THEME,
    ...tabStyles,
  }
}
