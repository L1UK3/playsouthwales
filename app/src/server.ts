import handler from "@tanstack/react-start/server-entry";
import { syncPokedata } from "#/web/sync.server";

/**
 * Worker entry: TanStack Start serves requests, and the hourly cron trigger
 * in wrangler.jsonc syncs Pokedata events and championship points.
 */
export default {
	fetch: handler.fetch,
	scheduled(_controller, _env, ctx) {
		ctx.waitUntil(syncPokedata());
	},
} satisfies ExportedHandler<Env>;
