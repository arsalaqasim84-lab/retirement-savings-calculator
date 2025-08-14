import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initializeGA4 } from './config/analytics.js'
import './index.css'

// Initialize Google Analytics 4
initializeGA4()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
