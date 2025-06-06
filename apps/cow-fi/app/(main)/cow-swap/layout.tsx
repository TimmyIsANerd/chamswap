import { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'
import { CONFIG } from '@/const/meta'

export const metadata: Metadata = {
  ...getPageMetadata({
    absoluteTitle: "Chameleaon swap - Don't worry, trade happy",
    description:
      'Chameleaon swap protects traders from the dangers of DeFi, so you can do what you want without needing to worry',
    image: CONFIG.ogImageCOWSWAPP,
  }),
}

export default function LayoutPage({ children }: { children: React.ReactNode }) {
  return children
}
