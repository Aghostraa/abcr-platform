import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUserRole } from '@/hooks/useUserRole'

interface User {
  id: string
  email: string
  role: string
  last_login: string
}

export interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userRole } = useUserRole()
  const supabase = createClientComponentClient()
  const [users, setUsers] = useState<User[]>([])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, role, last_login')
      if (error) throw error
      setUsers(data)
    } catch (err) {
      setError('Failed to fetch users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userRole === 'Admin') {
      fetchUsers()
    }
  }, [userRole])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.rpc('set_user_role', { user_id: userId, new_role: newRole })
      if (error) throw error
      fetchUsers()
    } catch (err) {
      setError('Failed to update user role')
      console.error(err)
    }
  }

  if (userRole !== 'Admin') {
    return <div>You do not have permission to view this page.</div>
  }

  if (loading) return <div>Loading users...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="space-y-4">
          {users.map(user => (
            <li key={user.id} className="bg-white bg-opacity-10 p-4 rounded-lg">
              <p>Email: {user.email}</p>
              <p>Last Login: {new Date(user.last_login).toLocaleString()}</p>
              <div className="mt-2">
                <label htmlFor={`role-${user.id}`} className="mr-2">Role:</label>
                <select
                  id={`role-${user.id}`}
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="bg-white bg-opacity-20 rounded p-1"
                >
                  <option value="Visitor">Visitor</option>
                  <option value="Member">Member</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UserList