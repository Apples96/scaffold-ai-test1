import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scaffold.ai - AI-Powered Process Automation',
  description: 'Transform your step-by-step processes into reliable AI automation. Describe your workflow and let our AI build the scaffolding for you.',
  keywords: 'AI automation, process automation, workflow automation, AI scaffolding, business automation',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://scaffold-ai.vercel.app'),
  openGraph: {
    title: 'Scaffold.ai - AI-Powered Process Automation',
    description: 'Transform your step-by-step processes into reliable AI automation.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 