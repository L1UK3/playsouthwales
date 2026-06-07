import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< HEAD
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import '@styles/global.css'
import '@styles/animations.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

// Query Client for React Query
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
			retry: 1
		}
	}
})

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>
=======
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
>>>>>>> 19ad77c63b5164f0321453f7161b73fea7b0cf81
)
