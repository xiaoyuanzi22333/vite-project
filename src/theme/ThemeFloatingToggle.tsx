import { Switch, Tooltip } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useTheme } from './ThemeProvider'

export function ThemeFloatingToggle() {
  const { isLight, toggle } = useTheme()

  return (
    <div
      className="theme-float-shell flex items-center gap-2 rounded-full px-3 py-2 shadow-lg"
      role="group"
      aria-label="Appearance"
    >
      <MoonOutlined className={isLight ? 'text-slate-400' : 'text-indigo-300'} style={{ fontSize: 16 }} />
      <Tooltip title={isLight ? 'Switch to dark mode' : 'Switch to light mode'} placement="left">
        <Switch checked={isLight} onChange={() => toggle()} checkedChildren="Light" unCheckedChildren="Dark" />
      </Tooltip>
      <SunOutlined className={isLight ? 'text-amber-500' : 'text-slate-500'} style={{ fontSize: 16 }} />
    </div>
  )
}
