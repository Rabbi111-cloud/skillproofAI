'use client'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'var(--bg)',
        color: 'var(--text)',
        transition: 'background 0.3s, color 0.3s'
      }}>
        {children}
      </body>
    </html>
  )
}
