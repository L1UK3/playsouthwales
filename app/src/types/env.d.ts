/** Worker secrets, which `wrangler types` cannot see without a local .env. */
declare namespace Cloudflare {
	interface Env {
		POKEDATA_KEY: string;
		/** Optional: digests are skipped while either is unset. */
		DISCORD_BOT_TOKEN?: string;
		DISCORD_CHANNEL_ID?: string;
	}
}
