import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EmpresaDetail from './pages/EmpresaDetail.jsx'
import Usuarios from './pages/Usuarios.jsx'
import { isAuthenticated } from './api.js'
import { UserProvider } from './context/UserContext.jsx'

function Protected({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <UserProvider>{children}</UserProvider>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/empresas/:id"
        element={
          <Protected>
            <EmpresaDetail />
          </Protected>
        }
      />
      <Route
        path="/usuarios"
        element={
          <Protected>
            <Usuarios />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
