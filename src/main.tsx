import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import Intro from './Pages/personalIntro.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<h1>About Page</h1>} />
        <Route path="/intro" element={<Intro />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
