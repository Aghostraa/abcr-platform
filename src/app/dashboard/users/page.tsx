'use client'

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import UserList from '@/components/UserList'
import { useRouter } from 'next/navigation'

interface User {
  id: string;
  email: string;
  role: string;
  updated_at: string;
  last_login: string;
}

interface UsersPageProps {
  userRole?: string;
}

const UsersPage: React.FC<UsersPageProps> = ({ userRole: initialUserRole }) => {
  const [users, setUsers] = useState<User[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (initialUserRole !== 'Admin') {
      router.push('/dashboard')
    }
  }, [initialUserRole, router])

  useEffect(() => {
    const fetchUsers = async () => {
      if (initialUserRole === 'Admin') {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, email, role, updated_at, last_login')
        if (error) {
          console.error('Error fetching users:', error)
        } else {
          setUsers(data)
        }
      }
    }

    fetchUsers()
  }, [supabase, initialUserRole])

  if (initialUserRole !== 'Admin') {
    return null // This will prevent any flicker before redirect
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <UserList users={users} />
      </div>
    </DashboardLayout>
  )
}

export default UsersPage;