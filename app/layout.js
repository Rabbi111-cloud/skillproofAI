export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#f8fafc'
        }}
      >
        {children}
      </body>
    </html>
  )
}
