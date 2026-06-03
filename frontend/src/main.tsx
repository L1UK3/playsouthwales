import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@playwales/shared/styles/global.css'
import '@playwales/shared/styles/animations.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
