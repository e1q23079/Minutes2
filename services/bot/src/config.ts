import "dotenv/config";

interface Config {
  apiKey: string;
  voiceChannelId: string;
}

/*
 * 環境変数から設定を読み込む関数
 * @returns Config
 */
export function loadConfig(): Config {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("APIキーが環境変数に定義されていません。");
  }

  const voiceChannelId = process.env.VOICE_CHANNEL_ID;
  if (!voiceChannelId) {
    throw new Error("VOICE_CHANNEL_IDが環境変数に定義されていません。");
  }

  return {
    apiKey,
    voiceChannelId,
  };
}
