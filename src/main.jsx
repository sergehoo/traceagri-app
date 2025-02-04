import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'
import "bootstrap/dist/js/bootstrap.bundle.js"
import "./css/style.css"
import App from './App.jsx'
import { SnackbarProvider } from 'notistack'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider>
    <App />
    </SnackbarProvider>
    
  </StrictMode>,
)
