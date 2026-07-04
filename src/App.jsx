import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EmpresaDetail from './pages/EmpresaDetail.jsx'
import { isAuthenticated } from './api.js'

function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
