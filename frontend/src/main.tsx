import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@playwales/shared/styles/global.css'
import '@playwales/shared/styles/animations.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/react'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    //takes in api key for clerk
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
	</StrictMode>,
)
