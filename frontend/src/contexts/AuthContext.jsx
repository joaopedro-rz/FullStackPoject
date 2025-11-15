import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

  useEffect(() => { token ? localStorage.setItem('token', token) : localStorage.removeItem('token') }, [token])
  useEffect(() => { user ? localStorage.setItem('user', JSON.stringify(user)) : localStorage.removeItem('user') }, [user])

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Falha no login')
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => { setToken(''); setUser(null) }, [])

  const value = useMemo(() => ({ token, user, login, logout, isAuthenticated: !!token }), [token, user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}

