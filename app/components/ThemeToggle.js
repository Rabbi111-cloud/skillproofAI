'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  return (
    <button onClick={() => setDark(!dark)} style={btn}>
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}

const btn = {
  marginTop: 20,
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer'
}
