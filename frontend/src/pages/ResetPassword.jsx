import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { userApi } from '../utils/userApi'
import '../styles/AuthStyle.css'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Simple Strength Logic
  const getStrength = () => {
    if (password.length === 0) return { width: '0%', color: '#e5e7eb' }
    if (password.length < 6) return { width: '33%', color: 'var(--error)' }
    if (password.length < 10) return { width: '66%', color: 'var(--warning)' }
    return { width: '100%', color: 'var(--success)' }
  }

  const strength = getStrength()

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) return setError('Passwords do not match')
    
    setLoading(true)
    try {
      await userApi.resetPassword({ token, new_password: password })
      navigate('/login?reset=success')
    } catch (err) {
      setError('Link expired or invalid. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Secure Reset</h2>
        <p>Choose a strong password to protect your account.</p>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Strength Indicator */}
            <div className="strength-bar">
              <div 
                className="strength-progress" 
                style={{ width: strength.width, backgroundColor: strength.color }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>Confirm Password</label>
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Update Password'}
          </button>
        </form>

        {error && (
          <div className="message-box" style={{ color: 'var(--error)', background: '#fff1f2', marginTop: '1rem', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}