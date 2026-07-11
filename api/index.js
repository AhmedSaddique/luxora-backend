// Vercel serverless entry point. Every file in /api becomes a serverless
// function; vercel.json rewrites all incoming routes to this one handler,
// which delegates to the configured Express + Apollo app.
export { default } from "../src/server.js";
