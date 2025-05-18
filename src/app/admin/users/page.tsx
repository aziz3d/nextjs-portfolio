'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { User, UserRole, getUsers, saveUsers } from '@/data/users'
import { useAuth } from '@/contexts/auth-context'

export default function UserManager() {
  const { status } = useSession()
  const router = useRouter()
  const { currentUser, hasPermission: checkPermission } = useAuth()
  
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    // Check if user has permission to manage users
    if (!checkPermission('canManageUsers')) {
      router.push('/admin')
      return
    }

    // Load users
    loadUsers()
  }, [status, router, currentUser, checkPermission])

  const loadUsers = () => {
    setIsLoading(true)
    try {
      const loadedUsers = getUsers()
      setUsers(loadedUsers)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: '',
      email: '',
      role: 'content_writer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setEditingUser(newUser)
  }

  const handleSaveUser = () => {
    if (!editingUser) return
    
    if (!editingUser.name || !editingUser.email) {
      setError('Name and email are required')
      return
    }

    // Check if email is already used by another user
    const existingUser = users.find(u => u.email === editingUser.email && u.id !== editingUser.id)
    if (existingUser) {
      setError('Email is already in use')
      return
    }

    setError(null)
    
    const isNewUser = !users.some(user => user.id === editingUser.id)
    const updatedUsers = isNewUser
      ? [...users, editingUser]
      : users.map(user => user.id === editingUser.id ? editingUser : user)
    
    setUsers(updatedUsers)
    saveUsers(updatedUsers)
    setEditingUser(null)
  }

  const handleDeleteUser = (id: string) => {
    // Prevent deleting yourself
    if (currentUser?.id === id) {
      setError('You cannot delete your own account')
      return
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== id)
      setUsers(updatedUsers)
      saveUsers(updatedUsers)
    }
  }

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'content_writer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'moderator':
        return 'Moderator'
      case 'content_writer':
        return 'Content Writer'
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-secondary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="heading-lg">User Management</h1>
        <button
          onClick={handleAddUser}
          className="btn-primary"
          disabled={!!editingUser}
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {editingUser && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {users.some(user => user.id === editingUser.id) ? 'Edit User' : 'Add New User'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              Role
            </label>
            <select
              id="role"
              value={editingUser.role}
              onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="content_writer">Content Writer</option>
            </select>
            
            <div className="mt-2 text-sm text-gray-500">
              <p><strong>Admin:</strong> Full access to all settings and features</p>
              <p><strong>Moderator:</strong> Can only manage projects</p>
              <p><strong>Content Writer:</strong> Can only manage blog posts</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found. Add your first user to get started.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Ensure unique keys by adding index as fallback */}
              {users.map((user, index) => (
                <tr key={`${user.id}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingUser({...user})}
                      className="text-secondary hover:text-secondary/80 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={currentUser?.id === user.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p>Note: Changes are saved to the browser for demo purposes. In a production environment, these would be saved to a database.</p>
      </div>
    </div>
  )
}
