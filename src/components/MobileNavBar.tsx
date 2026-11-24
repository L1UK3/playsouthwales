import { SignInButton, useAuth } from "@clerk/tanstack-react-start";
import { Link, useLocation } from "@tanstack/react-router";
import { Calendar, MapPin, ShieldAlert, Trophy } from "lucide-react";
import { cn } from "#/lib/utils";

const CLERK_SIGN_IN_APPEARANCE = {
	elements: {
		footerAction: { display: "none" as const },
	},
};

export function MobileNavBar() {
	const location = useLocation();
	const path = location.pathname;
	const { isLoaded, isSignedIn } = useAuth();

	return (
		<nav
			className={cn(
				"fixed bottom-0 left-0 right-0 z-100 bg-bg-card/95 backdrop-blur-md",
				"border-t border-border-color py-2 px-4 flex justify-around",
				"items-center sm:hidden shadow-[0_-1px_8px_rgba(41,37,36,0.06)]",
			)}
		>
			<Link
				to="/"
				className={cn(
					"flex flex-col items-center gap-1 py-1 px-3 text-text-muted",
					"no-underline transition-colors duration-150",
					path === "/" ? "text-primary!" : "hover:text-text-main",
				)}
			>
				<Calendar
					className={cn(
						"w-5 h-5 transition-transform duration-200 active:scale-95",
					)}
				/>
				<span className="text-[10px] font-bold">Schedule</span>
			</Link>

			<Link
				to="/leagues"
				className={cn(
					"flex flex-col items-center gap-1 py-1 px-3 text-text-muted",
					"no-underline transition-colors duration-150",
					path.startsWith("/leagues")
						? "text-primary!"
						: "hover:text-text-main",
				)}
			>
				<MapPin
					className={cn(
						"w-5 h-5 transition-transform duration-200 active:scale-95",
					)}
				/>
				<span className="text-[10px] font-bold">Leagues</span>
			</Link>

			<Link
				to="/rankings"
				className={cn(
					"flex flex-col items-center gap-1 py-1 px-3 text-text-muted",
					"no-underline transition-colors duration-150",
					path.startsWith("/rankings")
						? "text-primary!"
						: "hover:text-text-main",
				)}
			>
				<Trophy
					className={cn(
						"w-5 h-5 transition-transform duration-200 active:scale-95",
					)}
				/>
				<span className="text-[10px] font-bold">Rankings</span>
			</Link>

			{isLoaded && isSignedIn && (
				<Link
					to="/admin"
					className={cn(
						"flex flex-col items-center gap-1 py-1 px-3 text-text-muted",
						"no-underline transition-colors duration-150",
						path.startsWith("/admin")
							? "text-primary!"
							: "hover:text-text-main",
					)}
				>
					<ShieldAlert
						className={cn(
							"w-5 h-5 transition-transform duration-200 active:scale-95",
						)}
					/>
					<span className="text-[10px] font-bold">Admin</span>
				</Link>
			)}

			{isLoaded && !isSignedIn && (
				<SignInButton mode="modal" appearance={CLERK_SIGN_IN_APPEARANCE}>
					<button
						type="button"
						className={cn(
							"flex flex-col items-center gap-1 py-1 px-3 text-text-muted",
							"bg-transparent border-none cursor-pointer transition-colors",
							"duration-150 hover:text-text-main",
						)}
					>
						<ShieldAlert
							className={cn(
								"w-5 h-5 transition-transform duration-200 active:scale-95",
							)}
						/>
						<span className="text-[10px] font-bold">Admin</span>
					</button>
				</SignInButton>
			)}
		</nav>
	);
}
