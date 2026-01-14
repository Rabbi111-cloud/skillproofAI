'use client'

import { useEffect, useState } from 'react'

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('light')

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) setTheme(savedTheme)
  }, [])

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <html lang="en">
      <head>
        {/* 🌗 GLOBAL THEME VARIABLES (NUMBER 3 FIX) */}
        <style>{`
          :root {
            --bg: #f8fafc;
            --text: #020617;
            --card: #ffffff;
            --sidebar-bg: #ffffff;
            --border: #e5e7eb;
            --primary: #2563eb;
            --danger: #dc2626;
          }

          [data-theme='dark'] {
            --bg: #020617;
            --text: #e5e7eb;
            --card: #020617;
            --sidebar-bg: #020617;
            --border: #1e293b;
            --primary: #3b82f6;
            --danger: #ef4444;
          }
        `}</style>
      </head>

      <body
        style={{
          margin: 0,
          fontFamily: 'Inter, system-ui, sans-serif',
          background: 'var(--bg)',
          color: 'var(--text)',
          transition: 'background 0.3s ease, color 0.3s ease'
        }}
      >
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            padding: '8px 14px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--card)',
            color: 'var(--text)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
            zIndex: 999
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        {children}
      </body>
    </html>
  )
}
