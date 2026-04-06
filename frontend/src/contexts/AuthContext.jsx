import { createContext, useContext, useState, useEffect } from 'react'
import { userApi } from '../utils/userApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = import.meta.env.VITE_API_URL || "https://ngau-bazaar.onrender.com"

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const refreshUserStats = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const response = await userApi.getMe();

      // 1. Handle Axios nesting (response vs response.data)
      const userData = response.data || response;

      // 2. Normalize the data (ensure both naming styles work)
      const normalizedUser = {
        ...userData,
        wishlistCount: userData.wishlist_count || userData.wishlistCount || 0
      };

      setUser(prevUser => ({ ...prevUser, ...normalizedUser }));
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      console.log('User stats refreshed. New Count:', normalizedUser.wishlistCount);
    } catch (error) {
      console.error('Failed to refresh user stats:', error);
    }
  };

  // Login function
  const login = async (credentials, isAdmin = false) => {
    const endpoint = isAdmin ? '/api/admin/login' : '/users/login'

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_username: credentials.email_or_username || credentials.email,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      const { access_token } = data

      // Store token
      localStorage.setItem('token', access_token)
      setToken(access_token)

      // Fetch user profile
      const profileEndpoint = isAdmin ? '/api/admin/me' : '/users/me'
      const profileResponse = await fetch(`${API_URL}${profileEndpoint}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      if (profileResponse.ok) {
        const userData = await profileResponse.json()
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        return userData
      }

      throw new Error('Failed to fetch user profile')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Registration failed')
      }

      // Auto-login after registration
      await login({
        email_or_username: userData.email,
        password: userData.password,
      })

      return true
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user
  }

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    setUser,
    refreshUserStats,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: () => !!token && !!user,
    isAdmin: () => user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}