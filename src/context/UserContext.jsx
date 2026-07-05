import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '../api.js'

const UserContext = createContext({ user: null, loading: true, refrescar: () => {} })

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  function cargar() {
    setLoading(true)
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, refrescar: cargar }}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
