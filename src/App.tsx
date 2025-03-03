import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'


function App() {

  return (
    <>
      <div className='logos'>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Welcome to Steve's Server</h1>
      <a href="/intro"> view my profile </a>
      <br/>
      <a href="/chat"> chat with my bot </a>
      <br/>
      <a href="https://xiaoyuanzi22333hoho.xyz:5050"> access my memos page </a>
    </>
  )
}

export default App
