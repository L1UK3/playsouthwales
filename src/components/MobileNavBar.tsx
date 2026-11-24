import { SignInButton, useAuth } from "@clerk/tanstack-react-start";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import {
	ADMIN_NAV_ITEM,
	CLERK_SIGN_IN_APPEARANCE,
	isNavItemActive,
	NAV_ITEMS,
	type NavItem,
} from "./nav";

const ICON_CLASS = "w-5 h-5 transition-transform duration-200 active:scale-95";

function MobileNavLink({ item, path }: { item: NavItem; path: string }) {
	const Icon = item.icon;
	return (
		<Link
			to={item.to}
			className={cn(
				"flex flex-col items-center gap-1 py-1 px-3 text-text-muted",
				"no-underline transition-colors duration-150",
				isNavItemActive(path, item.to)
					? "text-primary!"
					: "hover:text-text-main",
			)}
		>
			<Icon className={ICON_CLASS} />
			<span className="text-[10px] font-bold">{item.label}</span>
		</Link>
	);
}

export function MobileNavBar() {
	const location = useLocation();
	const path = location.pathname;
	const { isLoaded, isSignedIn } = useAuth();
	const AdminIcon = ADMIN_NAV_ITEM.icon;

	return (
		<nav
			className={cn(
				"fixed bottom-0 left-0 right-0 z-100 bg-bg-card/95 backdrop-blur-md",
				"border-t border-border-color py-2 px-4 flex justify-around",
				"items-center sm:hidden shadow-[0_-1px_8px_rgba(41,37,36,0.06)]",
			)}
		>
			{NAV_ITEMS.map((item) => (
				<MobileNavLink key={item.to} item={item} path={path} />
			))}

			{isLoaded && isSignedIn && (
				<MobileNavLink item={ADMIN_NAV_ITEM} path={path} />
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
						<AdminIcon className={ICON_CLASS} />
						<span className="text-[10px] font-bold">
							{ADMIN_NAV_ITEM.label}
						</span>
					</button>
				</SignInButton>
			)}
		</nav>
	);
}
