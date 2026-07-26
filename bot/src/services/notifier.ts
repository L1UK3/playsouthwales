import express from "express";
import type { Server } from "node:http";
import type { Client } from "discordx";

import { handleEmit, handleHealthCheck, handleNotify } from "./api.js";

/**
 * Start the Express HTTP server to listen for backend notifications.
 * 
 * Configures JSON middleware, registers routes, and registers error handler middleware.
 */
export function startHttpServer(bot: Client): Server {
    const port = process.env.PORT || 5001;
    const app = express();

    app.use(express.json());

    // Health check endpoints
    app.get("/", handleHealthCheck);
    app.get("/health", handleHealthCheck);
    app.get("/api/health", handleHealthCheck);

    // Discord notification endpoint
    app.post("/api/notify", async (req, res, next) => {
        try {
            await handleNotify(bot, req, res);
        } catch (err) {
            next(err);
        }
    });

    // Custom event emission endpoint
    app.post("/api/emit", (req, res, next) => {
        try {
            handleEmit(bot, req, res);
        } catch (err) {
            next(err);
        }
    });

    // Global error handler middleware boundary
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error("[Bot HTTP Error]", err);
        res.status(500).json({
            error: "InternalError",
            message: err.message || "An unexpected server error occurred"
        });
    });

    const server = app.listen(port, () => {
        console.log(`[Bot] HTTP notifier listening on port ${port}`);
    });

    return server;
}
