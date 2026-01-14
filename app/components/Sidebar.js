'use client'

import { useRouter } from 'next/navigation'

export default function Sidebar({ role }) {
  const router = useRouter()

  const links =
    role === 'candidate'
      ? [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Assessment', path: '/assessment/1' },
          { label: 'Logout', path: '/logout' }
        ]
      : [
          { label: 'Dashboard', path: '/company/dashboard' },
          { label: 'Logout', path: '/logout' }
        ]

  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--card)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}
    >
      <h2 style={{ marginBottom: 20, color: 'var(--primary)' }}>
        {role === 'candidate' ? 'Candidate' : 'Company'}
      </h2>

      {links.map(link => (
        <button
          key={link.label}
          onClick={() => router.push(link.path)}
          style={{
            padding: '10px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--primary)',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          {link.label}
        </button>
      ))}
    </aside>
  )
}
