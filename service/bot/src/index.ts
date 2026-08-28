import "dotenv/config";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("APIキーが環境変数に定義されていません。");
}

const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
if (!VOICE_CHANNEL_ID) {
  throw new Error("VOICE_CHANNEL_IDが環境変数に定義されていません。");
}
