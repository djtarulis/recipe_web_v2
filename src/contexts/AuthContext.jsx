import { createContext, useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext({
  token: null,
  setToken: () => {},
})

export const AuthContextProvider = ({ children }) => {
  // Start as null on both server and client
  const [token, setToken] = useState(null)

  // On the client, hydrate from localStorage once
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = window.localStorage.getItem('token')
    if (stored) {
      setToken(stored)
    }
  }, [])

  // Whenever token changes on the client, sync it to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (token) {
      window.localStorage.setItem('token', token)
    } else {
      window.localStorage.removeItem('token')
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}
AuthContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
}

export function useAuth() {
  const { token, setToken } = useContext(AuthContext)
  return [token, setToken]
}
