import useHeaderLogic from '@/hooks/useHeaderLogic'
import Header from '@/layouts/Header'
import { createFileRoute } from '@tanstack/react-router'
import "@/assets/styles/global.css";

export const Route = createFileRoute('/admin')({
	component: RouteComponent,
})

function RouteComponent() {
	const { isSettingsOpen, handleSettingsBox, handleCloseSettings } = useHeaderLogic()

	return (
		<div className="appRoot">
			<Header
				onSettingsBox={handleSettingsBox}
				isSettingsOpen={isSettingsOpen}
				onCloseSettings={handleCloseSettings}
			/>

			<main className="appContainer">
			</main>
		</div>
	)
}
