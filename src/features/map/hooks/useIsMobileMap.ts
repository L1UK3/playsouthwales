import { useSyncExternalStore } from "react";
import { MOBILE_MAP_QUERY } from "../constants";

function subscribe(onChange: () => void) {
	const mediaQuery = window.matchMedia(MOBILE_MAP_QUERY);
	mediaQuery.addEventListener("change", onChange);
	return () => mediaQuery.removeEventListener("change", onChange);
}

/**
 * Returns whether the leagues page is in its mobile layout.
 *
 * The server always renders the desktop answer, so hydration matches. The
 * client then switches to the real answer and follows resizes.
 */
function useIsMobileMap(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(MOBILE_MAP_QUERY).matches,
		() => false,
	);
}

export default useIsMobileMap;
