import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AdminPage from '@/pages/admin/AdminPage'
import { useAuth } from '@clerk/react'
import { useEffect } from 'react'

export const Route = createFileRoute('/admin')({
	component: AdminRouteComponent,
})

function AdminRouteComponent() {
	const { isLoaded, isSignedIn } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (isLoaded && !isSignedIn) {
			navigate({ to: '/' })
		}
	}, [isLoaded, isSignedIn, navigate])

	return <AdminPage />
}
