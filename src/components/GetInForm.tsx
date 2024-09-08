'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function GetInForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [supabase, router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Google login error:', error)
      setError('An error occurred during Google login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-400">{error}</p>}
      <button 
        type="button" 
        onClick={handleGoogleLogin}
        className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Log In with Google'}
      </button>
    </div>
  )
}