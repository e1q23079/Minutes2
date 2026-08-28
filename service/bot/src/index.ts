import "dotenv/config";
import Bot from "./bot";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("APIキーが環境変数に定義されていません。");
}

const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
if (!VOICE_CHANNEL_ID) {
  throw new Error("VOICE_CHANNEL_IDが環境変数に定義されていません。");
}

const bot = new Bot(API_KEY, VOICE_CHANNEL_ID);

try {
  await bot.start();
  const shutdown = async () => {
    try {
      console.log("Discord Bot を停止します。");
      await bot.stop();
      console.log("Discord Bot が正常に停止しました。");
      process.exit(0);
    } catch (error: unknown) {
      console.error("Discord Bot の停止中にエラーが発生しました:", error);
      process.exit(1);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error: unknown) {
  console.error("Discord Bot の起動中にエラーが発生しました:", error);
  process.exit(1);
}
