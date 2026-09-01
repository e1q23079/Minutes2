import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("環境変数から設定を正しく読み込む", () => {
    process.env.API_KEY = "test_api_key";
    process.env.VOICE_CHANNEL_ID = "test_voice_channel_id";

    const config = loadConfig();

    expect(config.apiKey).toBe("test_api_key");
    expect(config.voiceChannelId).toBe("test_voice_channel_id");
  });

  it("API_KEYが環境変数に定義されていない場合、エラーをスローする", () => {
    delete process.env.API_KEY;
    process.env.VOICE_CHANNEL_ID = "test_voice_channel_id";

    expect(() => loadConfig()).toThrow(
      "APIキーが環境変数に定義されていません。",
    );
  });

  it("VOICE_CHANNEL_IDが環境変数に定義されていない場合、エラーをスローする", () => {
    process.env.API_KEY = "test_api_key";
    delete process.env.VOICE_CHANNEL_ID;

    expect(() => loadConfig()).toThrow(
      "VOICE_CHANNEL_IDが環境変数に定義されていません。",
    );
  });
});
