import { useState } from 'react'
import { Link } from 'react-router-dom'
import { userApi } from '../utils/userApi'
import '../styles/AuthStyle.css' // Import the CSS here

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userApi.forgotPassword(email)
      setMsg('If the email exists, a reset link has been sent.')
    } catch (err) {
      setMsg('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password?</h2>
        <p>No worries, we'll send you reset instructions.</p>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="auth-input"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {msg && (
          <div className="message-box message-success">
            {msg}
          </div>
        )}

        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}