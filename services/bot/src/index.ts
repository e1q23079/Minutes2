import Bot from "./modules/bot.js";
import { loadConfig } from "./config.js";
import { logger } from "./logger.js";

async function main() {
  const config = loadConfig();
  const bot = new Bot(config.apiKey, config.voiceChannelId);

  let isShuttingDown = false;

  const shutdown = async () => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    logger.info("Minutes を停止します。");
    try {
      await bot.stop();
      logger.info("Minutes が正常に停止しました。");
      process.exit(0);
    } catch (error: unknown) {
      logger.error("Minutes の停止中にエラーが発生しました:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => {
    shutdown().catch(() => {
      process.exit(0);
    });
  });
  process.on("SIGTERM", () => {
    shutdown().catch(() => {
      process.exit(0);
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("未処理の例外が発生しました:", error);
    shutdown().catch(() => {
      process.exit(1);
    });
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("未処理の Promise 拒否が発生しました:", reason);
    shutdown().catch(() => {
      process.exit(1);
    });
  });

  logger.info("Minutes を起動します。");
  await bot.start();
  logger.info("Minutes が正常に起動しました。");
}

main().catch((error) => {
  logger.error("Minutes の起動中にエラーが発生しました:", error);
  process.exit(1);
});
