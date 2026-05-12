import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { useTheme } from './ThemeProvider'
import { AuthProvider } from '../auth/AuthProvider'
import { FloatingTopRightBar } from './FloatingTopRightBar'
import App from '../App.tsx'
import Intro from '../Pages/Profile/personalIntro.tsx'
import AssistantChat from '../Pages/AssistantChat.tsx'
import AboutPage from '../Pages/About/AboutPage.tsx'
import avatarPng from '../assets/avatar.png'

export function ThemedApp() {
  const { isLight } = useTheme()

  useEffect(() => {
    const head = document.head
    if (!head) return

    const existing = head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')
    existing.forEach((el) => el.remove())

    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = avatarPng
    head.appendChild(link)
  }, [])

  return (
    <ConfigProvider
      theme={{
        algorithm: isLight ? theme.defaultAlgorithm : theme.darkAlgorithm,
        token: isLight
          ? {
              colorPrimary: '#7c3aed',
              colorInfo: '#0891b2',
              colorSuccess: '#059669',
              colorWarning: '#d97706',
              colorError: '#e11d48',
              borderRadius: 10,
              borderRadiusLG: 14,
              fontFamily:
                "'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
              colorBgElevated: '#ffffff',
              colorText: 'rgba(15, 23, 42, 0.88)',
              colorTextSecondary: 'rgba(71, 85, 105, 0.95)',
            }
          : {
              colorPrimary: '#a78bfa',
              colorInfo: '#22d3ee',
              colorSuccess: '#34d399',
              colorWarning: '#fbbf24',
              colorError: '#fb7185',
              borderRadius: 10,
              borderRadiusLG: 14,
              fontFamily:
                "'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
              colorBgElevated: '#1a222d',
            },
        components: {
          Card: { headerBg: 'transparent' },
          Typography: { titleMarginBottom: '0.35em' },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <FloatingTopRightBar />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/chat" element={<AssistantChat />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}
