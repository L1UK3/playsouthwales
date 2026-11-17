// @ts-expect-error The module is not available to the local development environment.
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const getDb = () => drizzle(env.playsouthwales, { schema });
