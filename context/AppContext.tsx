'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextType {
  userBalance: number
  setUserBalance: (value: number) => void
  city: string
  setCity: (value: string) => void
  freeSearches: number
  setFreeSearches: (value: number) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [userBalance, setUserBalance] = useState(150)
  const [city, setCity] = useState('Coité Conecta')
  const [freeSearches, setFreeSearches] = useState(5)

  return (
    <AppContext.Provider value={{
      userBalance, setUserBalance,
      city, setCity,
      freeSearches, setFreeSearches
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}