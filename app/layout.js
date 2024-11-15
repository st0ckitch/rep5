import './globals.css'

export const metadata = {
  title: 'Math Test App',
  description: 'Interactive mathematics test application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ka">
      <body>{children}</body>
    </html>
  )
}
