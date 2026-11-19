import { SignInButton, UserButton, useAuth } from "@clerk/tanstack-react-start";
import { Link, useLocation } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "#/context/SettingsContext";
import { cn } from "#/lib/utils";
import TabToggle from "./TabToggle";

/**
 * Wrapper for the header component
 * @returns {JSX.Element} The header element.
 */
export function Header() {
	const location = useLocation();
	const path = location.pathname;
	const { isLoaded, isSignedIn } = useAuth();
	const { darkMode, toggleDarkMode } = useSettings();
	const title = path.startsWith("/leagues")
		? "Leagues"
		: path.startsWith("/rankings")
			? "Rankings"
			: path.startsWith("/admin")
				? "Admin"
				: "Schedule";

	return (
		<header className="top-0 z-30 px-4 pt-4">
			<div
				className={cn(
					"flex gap-4 justify-between py-3 px-4 items-center bg-bg-card",
					"rounded-lg shadow-main relative border border-border-color",
				)}
			>
				<div
					className={cn(
						"text-sm sm:text-base md:text-lg text-text-main font-extrabold",
						"tracking-[-0.02em] flex-1",
					)}
				>
					Play! South Wales <span className="hidden sm:inline">|</span>{" "}
					<span
						key={title}
						className="inline-block animate-swipe-left text-primary"
					>
						{title}
					</span>
				</div>

				<div className="hidden sm:block">
					<TabToggle
						tabs={[
							{ to: "/", label: "Schedule" },
							{ to: "/leagues", label: "Leagues" },
							{ to: "/rankings", label: "Rankings" },
						]}
						activeTab={path}
					/>
				</div>

				<div
					className={cn(
						"flex gap-2.5 items-center justify-end flex-none sm:flex-1",
					)}
				>
					{isLoaded && isSignedIn && (
						<>
							<UserButton />
							<Link
								to="/admin"
								className={cn(
									"hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3",
									"border border-border-color rounded-md bg-bg-main",
									"text-text-main text-sm font-semibold cursor-pointer",
									"transition-colors duration-150 no-underline",
									"hover:bg-bg-card-hover hover:text-text-darker",
									"hover:border-text-muted",
									path.startsWith("/admin") &&
										"bg-primary! text-white! border-primary-hover!",
								)}
							>
								Admin
							</Link>
						</>
					)}
					{isLoaded && !isSignedIn && (
						<SignInButton
							mode="modal"
							appearance={{
								elements: {
									footerAction: { display: "none" },
								},
							}}
						>
							<button
								type="button"
								className={cn(
									"hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3",
									"border border-border-color rounded-md bg-bg-main",
									"text-text-main text-sm font-semibold cursor-pointer",
									"transition-colors duration-150 no-underline",
									"hover:bg-bg-card-hover hover:text-text-darker",
									"hover:border-text-muted",
								)}
							>
								Sign In
							</button>
						</SignInButton>
					)}
					<button
						type="button"
						className={cn(
							"inline-flex items-center gap-1.5 py-1.5 px-3 border",
							"border-border-color rounded-md bg-bg-main text-text-main",
							"text-sm font-semibold cursor-pointer transition-colors",
							"duration-150 hover:bg-bg-card-hover hover:text-text-darker",
							"hover:border-text-muted",
						)}
						onClick={() => toggleDarkMode()}
						aria-label={
							darkMode ? "Switch to light mode" : "Switch to dark mode"
						}
						aria-pressed={darkMode}
						title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
					>
						{darkMode ? (
							<Sun aria-hidden="true" className="h-5 w-5" />
						) : (
							<Moon aria-hidden="true" className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>
		</header>
	);
}
