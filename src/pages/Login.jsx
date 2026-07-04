import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api.js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-side">
        <div className="brand">
          <span className="dot"></span>Expediente
        </div>
        <p className="login-quote">"Ningún expediente se te vence sin avisar."</p>
        <div className="mono" style={{ fontSize: 11, color: '#6c7a70', letterSpacing: '0.04em' }}>
          SEGUIMIENTO DE REGISTROS Y LICENCIAS SANITARIAS · GUATEMALA, C.A.
        </div>
      </div>

      <div className="login-panel">
        <form className="login-box" onSubmit={handleSubmit}>
          <div className="eyebrow">Química Verde S.A.</div>
          <h1 style={{ fontSize: 24, marginBottom: 26 }}>Iniciar sesión</h1>

          {error && <div className="error-msg">{error}</div>}

          <div className="field">
            <label>Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
