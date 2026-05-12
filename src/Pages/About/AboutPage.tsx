import { useNavigate } from 'react-router-dom'
import { Button, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useTheme } from '../../theme/ThemeProvider'

const { Title, Paragraph } = Typography

export default function AboutPage() {
  const navigate = useNavigate()
  const { isLight } = useTheme()

  const panel = isLight
    ? 'max-w-md w-full rounded-2xl border border-violet-200/80 bg-white p-10 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.1),0_0_0_1px_rgba(124,58,237,0.05)]'
    : 'max-w-md w-full rounded-2xl border border-violet-400/20 bg-white/[0.05] backdrop-blur-sm p-10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55),0_0_0_1px_rgba(167,139,250,0.1),0_0_60px_-30px_rgba(34,211,238,0.08)]'

  const titleCls = isLight ? '!mb-2 !text-slate-900' : '!mb-2 !text-slate-100'
  const paraCls = isLight ? '!text-slate-600 !mb-8' : '!text-slate-400 !mb-8'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className={panel}>
        <Title level={2} className={titleCls}>
          About
        </Title>
        <Paragraph className={paraCls}>
          This Page is owned by Steve Huang. Contact me if you meet any issues.
        </Paragraph>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          size="large"
          block
          onClick={() => navigate('/')}
        >
          Back home
        </Button>
      </div>
    </div>
  )
}
