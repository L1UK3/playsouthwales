import handler from "@tanstack/react-start/server-entry";
import {
	postDailyDigest,
	postWeeklyDigest,
} from "#/integrations/discord/digest.server";
import { syncPokedata } from "#/web/sync.server";

/** Cron expressions, matching `triggers.crons` in wrangler.jsonc. */
const CRON_JOBS: Record<string, () => Promise<void>> = {
	"0 * * * *": syncPokedata,
	"0 19 * * *": postDailyDigest,
	"0 19 * * SUN": postWeeklyDigest,
};

/**
 * Worker entry: TanStack Start serves requests, and the cron triggers in
 * wrangler.jsonc sync Pokedata hourly and post the Discord digests at 19:00
 * UTC, daily and on Sundays.
 */
export default {
	fetch: (request) => handler.fetch(request),
	scheduled(controller, _env, ctx) {
		const job = CRON_JOBS[controller.cron];
		if (!job) {
			console.warn(`No job for cron "${controller.cron}".`);
			return;
		}
		ctx.waitUntil(job());
	},
} satisfies ExportedHandler<Env>;
