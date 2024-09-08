import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useUserRole() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: { role } } = await supabase.rpc('get_user_role', { user_email: user.email })
          setUserRole(role)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()
  }, [supabase])

  return { userRole, isLoading }
}