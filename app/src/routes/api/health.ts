import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { getDb } from "#/db/client.server";
import { healthResponse } from "#/lib/health";

export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: () => healthResponse(() => getDb().run(sql`select 1`)),
		},
	},
});
