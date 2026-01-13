// scripts/backfillSkills.js
import { createClient } from '@supabase/supabase-js'
import { questions } from '../app/assessment/questions.js' // adjust path if needed

// ⚠️ Replace with your Supabase project URL and anon/service key
const supabaseUrl = process.env.https://rgztijcdarpmfuxuyxbi.supabase.co
const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnenRpamNkYXJwbWZ1eHV5eGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDEyMTQsImV4cCI6MjA4MzUxNzIxNH0.YtC-kSSpJxigyoaLceJchOoKe95wElPYhsLoVDeiCd4
const supabase = createClient(supabaseUrl, supabaseKey)

async function backfillSkills() {
  try {
    console.log('Fetching all profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, skills')

    if (profilesError) throw profilesError

    for (const profile of profiles) {
      if (profile.skills && Object.keys(profile.skills).length > 0) {
        console.log(`Skipping user ${profile.user_id}, skills already exist`)
        continue
      }

      console.log(`Processing user ${profile.user_id}...`)

      // fetch all submissions for this user
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('question_id, is_correct')
        .eq('user_id', profile.user_id)

      if (subError) {
        console.warn(`Failed to get submissions for ${profile.user_id}:`, subError.message)
        continue
      }

      if (!submissions || submissions.length === 0) {
        console.log(`No submissions for ${profile.user_id}, skipping`)
        continue
      }

      // calculate skill percentages
      const skillStats = {}
      submissions.forEach(sub => {
        const q = questions.find(q => String(q.id) === String(sub.question_id))
        if (!q) return
        const skill = q.skill || 'General'
        if (!skillStats[skill]) skillStats[skill] = { total: 0, correct: 0 }
        skillStats[skill].total += 1
        if (sub.is_correct) skillStats[skill].correct += 1
      })

      const skillPercentages = {}
      Object.entries(skillStats).forEach(([skill, stat]) => {
        skillPercentages[skill] = Math.round((stat.correct / stat.total) * 100)
      })

      // upsert skills into profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: profile.user_id,
            skills: skillPercentages
          },
          { onConflict: ['user_id'] }
        )

      if (updateError) {
        console.error(`Failed to update user ${profile.user_id}:`, updateError.message)
      } else {
        console.log(`Updated skills for user ${profile.user_id}`)
      }
    }

    console.log('✅ Backfill completed!')
  } catch (err) {
    console.error('Backfill error:', err)
  }
}

backfillSkills()
