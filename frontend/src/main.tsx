import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import '@/assets/styles/global.css'
import '@/assets/styles/animations.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider, useAuth } from '@clerk/react'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth:undefined!,
  }})

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

// Wrapper to inject Clerk auth into router context
function AuthenticatedApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
			<QueryClientProvider client={queryClient}>
				<AuthenticatedApp/>
			</QueryClientProvider>
		</ClerkProvider>
	</StrictMode>
)
