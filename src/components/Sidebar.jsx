import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../api.js'
import { useUser } from '../context/UserContext.jsx'

export default function Sidebar({ active }) {
  const navigate = useNavigate()
  const { user } = useUser()

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
        <div
          className="nav-item"
          style={active === 'empresas' ? { background: 'rgba(255,255,255,0.06)', color: '#f2f5ef' } : {}}
          onClick={() => navigate('/empresas')}
        >
          Empresas
        </div>
        {user?.rol === 'admin' && (
          <div
            className="nav-item"
            style={active === 'usuarios' ? { background: 'rgba(255,255,255,0.06)', color: '#f2f5ef' } : {}}
            onClick={() => navigate('/usuarios')}
          >
            Usuarios
          </div>
        )}
      </div>
      <div className="nav-user">
        {user && (
          <div>
            {user.nombre} <span style={{ opacity: 0.6 }}>· {user.rol}</span>
          </div>
        )}
        <button onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}
