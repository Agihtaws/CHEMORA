// components/ThemeProvider.js
"use client"
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light'
    setTheme(storedTheme)
    // Only set attribute if it doesn't match current value
    if (document.documentElement.getAttribute('data-theme') !== storedTheme) {
      document.documentElement.setAttribute('data-theme', storedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
