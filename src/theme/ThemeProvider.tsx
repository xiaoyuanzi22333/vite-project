import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'app-color-theme'

type ThemeContextValue = {
  mode: ThemeMode
  isLight: boolean
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredMode(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
  }, [])

  const toggle = useCallback(() => {
    setModeState((m) => (m === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({
      mode,
      isLight: mode === 'light',
      setMode,
      toggle,
    }),
    [mode, setMode, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with ThemeProvider
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
