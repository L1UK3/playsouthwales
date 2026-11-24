import { SignInButton, UserButton, useAuth } from "@clerk/tanstack-react-start";
import { Link, useLocation } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "#/context/SettingsContext";
import { cn } from "#/lib/utils";
import {
	ADMIN_NAV_ITEM,
	CLERK_SIGN_IN_APPEARANCE,
	getSectionTitle,
	isNavItemActive,
	NAV_ITEMS,
} from "./nav";
import TabToggle from "./TabToggle";

/**
 * Shared look of the Header's action buttons (Admin, Sign In, theme). It
 * leaves out the display class, so each button picks when it shows.
 */
const ACTION_BUTTON_CLASS = cn(
	"items-center gap-1.5 py-1.5 px-3 border border-border-color rounded-md",
	"bg-bg-main text-text-main text-sm font-semibold cursor-pointer",
	"transition-colors duration-150 no-underline hover:bg-bg-card-hover",
	"hover:text-text-darker hover:border-text-muted",
);

const TABS = NAV_ITEMS.map(({ to, label }) => ({ to, label }));

/**
 * Wrapper for the header component
 * @returns {JSX.Element} The header element.
 */
export function Header() {
	const location = useLocation();
	const path = location.pathname;
	const { isLoaded, isSignedIn } = useAuth();
	const { darkMode, toggleDarkMode } = useSettings();
	const title = getSectionTitle(path);
	const themeLabel = darkMode ? "Switch to light mode" : "Switch to dark mode";

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
					<TabToggle tabs={TABS} activeTab={path} />
				</div>

				<div className="flex gap-2.5 items-center justify-end flex-none sm:flex-1">
					{isLoaded && isSignedIn && (
						<>
							<UserButton />
							<Link
								to={ADMIN_NAV_ITEM.to}
								className={cn(
									"hidden sm:inline-flex",
									ACTION_BUTTON_CLASS,
									isNavItemActive(path, ADMIN_NAV_ITEM.to) &&
										"bg-primary! text-white! border-primary-hover!",
								)}
							>
								{ADMIN_NAV_ITEM.label}
							</Link>
						</>
					)}
					{isLoaded && !isSignedIn && (
						<SignInButton mode="modal" appearance={CLERK_SIGN_IN_APPEARANCE}>
							<button
								type="button"
								className={cn("hidden sm:inline-flex", ACTION_BUTTON_CLASS)}
							>
								Sign In
							</button>
						</SignInButton>
					)}
					<button
						type="button"
						className={cn("inline-flex", ACTION_BUTTON_CLASS)}
						onClick={() => toggleDarkMode()}
						aria-label={themeLabel}
						aria-pressed={darkMode}
						title={themeLabel}
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
