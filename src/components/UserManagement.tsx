'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUserRole } from '@/hooks/useUserRole';

export default function UserManagement() {
  const { userRole, isLoading, error } = useUserRole() as { userRole: string | null; isLoading: boolean; error: Error | null };
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Member')
  const [message, setMessage] = useState('')

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (userRole !== 'Admin') return <div>Unauthorized</div>;

  const handleSetRole = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('email', email)
    if (error) setMessage(`Error: ${error.message}`)
    else setMessage(`User role set to ${role} successfully`)
  }

  return (
    <div className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="User Email"
        className="input-field w-full"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="input-field w-full"
      >
        <option value="Visitor">Visitor</option>
        <option value="Member">Member</option>
        <option value="Manager">Manager</option>
        <option value="Admin">Admin</option>
      </select>
      <button onClick={handleSetRole} className="btn-secondary w-full">
        Set User Role
      </button>
      {message && <p className="text-center">{message}</p>}
    </div>
  )
}