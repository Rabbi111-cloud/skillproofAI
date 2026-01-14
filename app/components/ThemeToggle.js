'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setTheme(saved)
  }, [])

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        padding: '8px 12px',
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
  )
}
