import { Calendar, MapPin, ShieldAlert, Trophy } from "lucide-react";

/**
 * The public sections of the site, in the order the Header and the
 * MobileNavBar show them. Add a section here and both navs pick it up.
 */
export const NAV_ITEMS = [
	{ to: "/", label: "Schedule", icon: Calendar },
	{ to: "/leagues", label: "Leagues", icon: MapPin },
	{ to: "/rankings", label: "Rankings", icon: Trophy },
] as const;

/** The admin section, shown only to signed-in organisers. */
export const ADMIN_NAV_ITEM = {
	to: "/admin",
	label: "Admin",
	icon: ShieldAlert,
} as const;

export type NavItem = (typeof NAV_ITEMS)[number] | typeof ADMIN_NAV_ITEM;

/**
 * Whether a nav item's section contains a path. The schedule lives at "/",
 * so it only matches exactly; every other section matches its subpaths too.
 */
export function isNavItemActive(path: string, to: NavItem["to"]): boolean {
	return to === "/" ? path === "/" : path.startsWith(to);
}

/**
 * The section title for a path, as the Header shows it. Paths outside every
 * other section fall back to the schedule.
 */
export function getSectionTitle(path: string): string {
	const item = [...NAV_ITEMS, ADMIN_NAV_ITEM].find(
		(navItem) => navItem.to !== "/" && isNavItemActive(path, navItem.to),
	);
	return item?.label ?? NAV_ITEMS[0].label;
}

/** Clerk sign-in modal appearance: hides the "sign up" footer link. */
export const CLERK_SIGN_IN_APPEARANCE = {
	elements: {
		footerAction: { display: "none" as const },
	},
};
