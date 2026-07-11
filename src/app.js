import { env } from "#config/index.js";
import { app, init } from "./server.js";
import { logger, getServerInfo } from "#lib/index.js";

const { PORT } = env;

init()
  .then(() => app.listen(PORT, () => logger.info(getServerInfo())))
  .catch((error) => {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });

export default app;
