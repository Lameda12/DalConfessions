import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CategorySlug } from '@/types'

interface ComposeContextValue {
  isOpen: boolean
  defaultCategory?: CategorySlug
  openCompose: (defaultCategory?: CategorySlug) => void
  closeCompose: () => void
}

const ComposeContext = createContext<ComposeContextValue | null>(null)

export function ComposeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [defaultCategory, setDefaultCategory] = useState<CategorySlug | undefined>()

  const openCompose = useCallback((category?: CategorySlug) => {
    setDefaultCategory(category)
    setIsOpen(true)
  }, [])

  const closeCompose = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, defaultCategory, openCompose, closeCompose }),
    [isOpen, defaultCategory, openCompose, closeCompose],
  )

  return <ComposeContext.Provider value={value}>{children}</ComposeContext.Provider>
}

export function useCompose() {
  const ctx = useContext(ComposeContext)
  if (!ctx) throw new Error('useCompose must be used within ComposeProvider')
  return ctx
}
