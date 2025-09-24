import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// 👉 Import Leaflet styles here
import 'leaflet/dist/leaflet.css'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
