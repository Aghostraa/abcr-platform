import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one with default 'Visitor' role
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({ 
              id: user.id, 
              email: user.email, 
              role: 'Visitor',
              updated_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            })
          
          if (insertError) throw insertError
          
          // Set role in auth.users metadata
          await supabase.auth.updateUser({
            data: { role: 'Visitor' }
          })
        } else if (profileError) {
          throw profileError
        } else {
          // Update last_login
          await supabase
            .from('user_profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id)
        }

        // Fetch user role
        const { data: role, error: roleError } = await supabase.rpc('get_user_role', { user_email: user.email })
        if (roleError) throw roleError

        // You might want to do something with the role here, like storing it in a session
      }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/login?error=AuthFailed', request.url))
    }
  }

  return NextResponse.redirect(new URL('/login', request.url))
}