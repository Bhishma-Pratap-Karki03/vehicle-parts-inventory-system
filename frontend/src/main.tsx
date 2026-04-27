import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer
        autoClose={2600}
        closeButton={false}
        hideProgressBar
        newestOnTop
        position="top-right"
        toastClassName="rounded-[18px] border border-[#D6E2EE] bg-white px-4 py-3 text-[14px] font-medium text-[#17324F] shadow-[0_18px_36px_rgba(18,43,74,0.12)]"
      />
    </BrowserRouter>
  </StrictMode>,
)
