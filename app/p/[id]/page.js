'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function PublicProfile({ params }) {
  const { id } = params
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to determine candidate level based on score
  function getLevel(score) {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Strong'
    if (score >= 50) return 'Average'
    if (score >= 20) return 'Below Average'
    return 'Very Bad'
  }

  // Function to get color based on skill value
  function getSkillColor(value) {
    if (value >= 80) return '#4caf50' // green
    if (value >= 50) return '#ffc107' // yellow
    return '#f44336' // red
  }

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, score, updated_at, skills')
        .eq('user_id', id)
        .single()

      if (!error) {
        setProfile(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [id])

  if (loading) {
    return <p style={{ padding: 30 }}>Loading profile...</p>
  }

  if (!profile) {
    return <p style={{ padding: 30 }}>Profile not found</p>
  }

  return (
    <main style={{ padding: 40, maxWidth: 600, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Candidate Profile</h2>

      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Score:</strong> {profile.score}</p>
      <p><strong>Level:</strong> {getLevel(profile.score)}</p>

      {/* Skill Breakdown Section */}
      {profile.skills && (
        <>
          <h3>Skill Breakdown</h3>
          {Object.entries(profile.skills).map(([skill, value]) => (
            <div key={skill} style={{ marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{skill.toUpperCase()}: {value}%</p>
              <div style={{
                background: '#e0e0e0',
                borderRadius: 4,
                height: 12,
                width: '100%',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${value}%`,
                  background: getSkillColor(value),
                  height: '100%',
                  borderRadius: 4,
                  transition: 'width 0.5s ease-in-out',
                }} />
              </div>
            </div>
          ))}
        </>
      )}

      <hr style={{ margin: '20px 0' }} />

      <p style={{ color: '#666' }}>
        Last updated: {new Date(profile.updated_at).toLocaleDateString()}
      </p>

      <p style={{ marginTop: 20 }}>
        📩 Interested in this candidate?  
        Contact them directly.
      </p>
    </main>
  )
}

