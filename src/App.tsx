import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  return (
    <>
      <div className="logos">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Welcome to Steve's Server</h1>

      <div className="nav-container">
        <a href="/intro">View My Profile</a>
        <a href="/chat">Chat with My Bot</a>
        <a href="https://xiaoyuanzi22333hoho.xyz:5050" target="_blank" rel="noopener noreferrer">
          Access My Memos Page
        </a>
      </div>
    </>
  )
}

export default App