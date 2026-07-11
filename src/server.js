import express from "express";

import { apolloServer } from "./apollo/server.js";
import { setupMiddleware } from "#middleware/index.js";
import { connectDatabase, logger } from "#lib/index.js";

const app = express();

/**
 * One-time async setup (DB connect, Apollo start, middleware wiring), memoized
 * so warm serverless invocations reuse a single initialization. On failure the
 * promise is cleared so the next invocation can retry instead of staying broken.
 */
let ready;
export const init = () => {
  if (!ready) {
    ready = (async () => {
      await connectDatabase();
      await apolloServer.start();

      setupMiddleware(app, apolloServer);

      app.get("/", (_req, res) =>
        res.json({ status: "OK", service: "shutter-backend" })
      );
    })().catch((error) => {
      ready = undefined;
      logger.error(`Failed to initialize server: ${error.message}`);
      throw error;
    });
  }
  return ready;
};

export default async function handler(req, res) {
  await init();
  return app(req, res);
}

export { app };
