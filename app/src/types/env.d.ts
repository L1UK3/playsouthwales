/** Worker secrets, which `wrangler types` cannot see without a local .env. */
declare namespace Cloudflare {
	interface Env {
		POKEDATA_KEY: string;
	}
}
