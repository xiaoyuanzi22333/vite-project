import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  UserOutlined,
  MessageOutlined,
  ExportOutlined,
  GithubOutlined,
} from '@ant-design/icons'
import { useTheme } from './theme/ThemeProvider'

type NavCard =
  | { kind: 'internal'; to: string; title: string; description: string; icon: ReactNode }
  | { kind: 'external'; href: string; title: string; description: string; icon: ReactNode }

const navItems: NavCard[] = [
  {
    kind: 'internal',
    to: '/intro',
    title: 'Profile',
    description: 'Background, skills, and selected projects.',
    icon: <UserOutlined className="text-xl text-indigo-500" />,
  },
  {
    kind: 'internal',
    to: '/chat',
    title: 'Assistant',
    description: 'Streamed replies from your hosted model endpoint.',
    icon: <MessageOutlined className="text-xl text-sky-500" />,
  },
  {
    kind: 'external',
    href: 'https://memos.xyzhoho.com',
    title: 'Memos',
    description: 'External notes workspace (opens in a new tab).',
    icon: <ExportOutlined className="text-xl text-emerald-600" />,
  },
  {
    kind: 'external',
    href: 'https://github.com/xiaoyuanzi22333',
    title: 'GitHub',
    description: 'Code and experiments.',
    icon: <GithubOutlined className="text-xl text-slate-500" />,
  },
]

function App() {
  const { isLight } = useTheme()

  const headerBar = isLight
    ? 'border-b border-violet-200/70 bg-white/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(124,58,237,0.06)]'
    : 'border-b border-violet-400/15 bg-black/25 backdrop-blur-md shadow-[0_1px_0_0_rgba(167,139,250,0.12)]'

  const brand = isLight ? 'text-slate-800' : 'text-slate-200'

  const navIdle = isLight
    ? 'text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-900'
    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'

  const kicker = isLight
    ? 'bg-gradient-to-r from-violet-600 via-cyan-600 to-fuchsia-600 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-violet-200 via-cyan-200 to-pink-200 bg-clip-text text-transparent'

  const headline = isLight ? 'text-slate-900' : 'text-slate-50'

  const sub = isLight ? 'text-slate-600' : 'text-slate-400'

  const cardClass = isLight
    ? 'group flex h-full flex-col rounded-2xl border border-violet-200/70 bg-white p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.1),0_0_0_1px_rgba(124,58,237,0.04)] transition-all duration-200 hover:border-cyan-400/45 hover:shadow-[0_20px_48px_-20px_rgba(124,58,237,0.14),0_12px_32px_-18px_rgba(8,145,178,0.1)]'
    : 'group flex h-full flex-col rounded-2xl border border-violet-400/20 bg-white/[0.05] p-6 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.6),0_0_0_1px_rgba(167,139,250,0.08)] transition-all duration-200 hover:border-cyan-400/35 hover:bg-white/[0.07] hover:shadow-[0_24px_60px_-24px_rgba(99,102,241,0.28),0_0_40px_-20px_rgba(34,211,238,0.12)]'

  const iconWrap = isLight
    ? 'mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-cyan-50 ring-1 ring-violet-200/70 transition group-hover:ring-cyan-300/80'
    : 'mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-500/10 ring-1 ring-violet-400/25 transition group-hover:ring-cyan-300/40'

  const cardTitle = isLight ? 'mb-1 text-lg font-semibold text-slate-900' : 'mb-1 text-lg font-semibold text-slate-100'

  const cardDesc = isLight ? 'mb-4 flex-1 text-sm leading-relaxed text-slate-600' : 'mb-4 flex-1 text-sm leading-relaxed text-slate-400'

  const cardCta = isLight
    ? 'text-sm font-medium text-violet-700 group-hover:text-cyan-700'
    : 'text-sm font-medium text-violet-200 group-hover:text-cyan-200'

  const footerBar = isLight
    ? 'border-t border-slate-200/80 py-6 text-center text-xs text-slate-500'
    : 'border-t border-white/[0.06] py-6 text-center text-xs text-slate-500'

  return (
    <div className="min-h-screen flex flex-col">
      <header className={headerBar}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <span className={`text-sm font-semibold tracking-wide ${brand}`}>Steve&apos;s space</span>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/about" className={`rounded-lg px-3 py-2 transition-colors ${navIdle}`}>
              About
            </Link>
            <Link to="/intro" className={`rounded-lg px-3 py-2 transition-colors ${navIdle}`}>
              Profile
            </Link>
            <Link to="/chat" className={`rounded-lg px-3 py-2 transition-colors ${navIdle}`}>
              Chat
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-14 md:py-20">
        <p className={`mb-3 text-xs font-medium uppercase tracking-[0.2em] ${kicker}`}>Welcome</p>
        <h1 className={`mb-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl ${headline}`}>
          This is the home of Steve Huang.
        </h1>
        <p className={`mb-12 max-w-xl text-lg ${sub}`}>You can find more information about me below.</p>

        <ul className="grid gap-4 sm:grid-cols-2">
          {navItems.map((item) => {
            const inner = (
              <>
                <div className={iconWrap}>{item.icon}</div>
                <h2 className={cardTitle}>{item.title}</h2>
                <p className={cardDesc}>{item.description}</p>
                <span className={cardCta}>{item.kind === 'external' ? 'Open →' : 'Go →'}</span>
              </>
            )

            if (item.kind === 'external') {
              return (
                <li key={item.title}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {inner}
                  </a>
                </li>
              )
            }

            return (
              <li key={item.to}>
                <Link to={item.to} className={cardClass}>
                  {inner}
                </Link>
              </li>
            )
          })}
        </ul>
      </main>

      <footer className={footerBar}>Built with React, Vite, and Ant Design.</footer>
    </div>
  )
}

export default App
