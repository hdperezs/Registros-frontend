const API_URL = import.meta.env.VITE_API_URL || 'https://expediente-backend.onrender.com'

function getToken() {
  return localStorage.getItem('expediente_token')
}
function setToken(token) {
  localStorage.setItem('expediente_token', token)
}
function clearToken() {
  localStorage.removeItem('expediente_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ocurrió un error inesperado' }))
    throw new Error(typeof err.detail === 'string' ? err.detail : 'Ocurrió un error inesperado')
  }
  if (res.status === 204) return null
  return res.json()
}

export async function login(email, password) {
  const body = new URLSearchParams()
  body.append('username', email)
  body.append('password', password)

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Correo o contraseña incorrectos')
  const data = await res.json()
  setToken(data.access_token)
  return data
}

export function logout() {
  clearToken()
}
export function isAuthenticated() {
  return !!getToken()
}

export const getMe = () => request('/auth/me')
export const getEmpresas = (q = '') => request(`/empresas?q=${encodeURIComponent(q)}`)
export const getEmpresa = (id) => request(`/empresas/${id}`)
export const createEmpresa = (data) =>
  request('/empresas', { method: 'POST', body: JSON.stringify(data) })
export const getTiposTramite = (categoria = '') =>
  request(`/tipos-tramite?categoria=${encodeURIComponent(categoria)}`)
export const getProximosVencer = (dias = 60) =>
  request(`/dashboard/proximos-vencer?dias=${dias}`)
export const createTramite = (data) =>
  request('/tramites', { method: 'POST', body: JSON.stringify(data) })
export const getTramitesDeEmpresa = (id) => request(`/empresas/${id}/tramites`)
export const updateTramite = (id, data) =>
  request(`/tramites/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteTramite = (id) => request(`/tramites/${id}`, { method: 'DELETE' })
export const updateEmpresa = (id, data) =>
  request(`/empresas/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
