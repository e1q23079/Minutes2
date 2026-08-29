import Bot from "./bot.js";
import { loadConfig } from "./config.js";

async function main() {
  const config = loadConfig();
  const bot = new Bot(config.apiKey, config.voiceChannelId);

  let isShuttingDown = false;

  const shutdown = async () => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    console.log("Discord Bot を停止します。");
    try {
      await bot.stop();
      console.log("Discord Bot が正常に停止しました。");
      process.exit(0);
    } catch (error: unknown) {
      console.error("Discord Bot の停止中にエラーが発生しました:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => {
    shutdown().catch(() => {
      process.exit(1);
    });
  });
  process.on("SIGTERM", () => {
    shutdown().catch(() => {
      process.exit(1);
    });
  });

  await bot.start();
}

main().catch((error) => {
  console.error("Discord Bot の起動中にエラーが発生しました:", error);
  process.exit(1);
});
