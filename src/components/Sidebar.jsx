import { Link, useNavigate } from 'react-router-dom'
import { logout, getMe } from '../api.js'
import { useEffect, useState } from 'react'

export default function Sidebar({ active }) {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    getMe()
      .then((u) => setNombre(u.nombre))
      .catch(() => {})
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      <Link to="/" className="brand">
        <span className="dot"></span>Expediente
      </Link>
      <div className="nav-group" style={{ marginBottom: 26 }}>
        <div
          className="nav-item"
          style={active === 'dashboard' ? { background: 'rgba(255,255,255,0.06)', color: '#f2f5ef' } : {}}
          onClick={() => navigate('/')}
        >
          Dashboard
        </div>
      </div>
      <div className="nav-user">
        {nombre && <div>Sesión: {nombre}</div>}
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}
