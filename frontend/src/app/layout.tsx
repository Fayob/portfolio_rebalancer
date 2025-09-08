import './globals.css'

export const metadata = {
  title: 'Portfolio Rebalancer',
  description: 'Automate your Stellar portfolio with intelligent rebalancing strategies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
