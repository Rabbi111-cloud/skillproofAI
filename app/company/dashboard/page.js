'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function CompanyDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    // 1️⃣ Get logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      router.push('/company/login')
      return
    }

    // 2️⃣ Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      setError('Profile not found.')
      setLoading(false)
      return
    }

    // 🚨 HARD BLOCK: candidates can NEVER pass this
    if (profile.role !== 'company' || !profile.company_id) {
      await supabase.auth.signOut()
      router.push('/company/login?error=not_company')
      return
    }

    // 3️⃣ Verify company exists
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single()

    if (companyError || !companyData) {
      setError('Company record missing.')
      setLoading(false)
      return
    }

    setCompany(companyData)

    // 4️⃣ Load ONLY completed candidates
    const { data: candidateData, error: candidateError } = await supabase
      .from('profiles')
      .select('id, email, score, created_at')
      .eq('role', 'candidate')
      .not('score', 'is', null)
      .order('score', { ascending: false })

    if (candidateError) {
      setError('Failed to load candidates.')
    } else {
      setCandidates(candidateData || [])
    }

    setLoading(false)
  }

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        {company.company_name} Dashboard
      </h1>

      <p className="text-gray-600 mb-6">
        Showing candidates who have completed the assessment
      </p>

      {candidates.length === 0 ? (
        <p>No completed assessments yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => (
              <tr key={c.id}>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">{c.score}</td>
                <td className="p-2 border">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
