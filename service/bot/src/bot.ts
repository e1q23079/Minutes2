import { Client, GatewayIntentBits } from "discord.js";

/**
 * Discord Bot を管理するクラス
 */
export default class Bot {
  private api_key: string;
  private voice_channel_id: string;
  private client: Client;
  /**
  * Discord Bot を初期化する
  * @param api_key Discord Bot の API キー
  * @param voice_channel_id Discord Bot が接続するボイスチャンネルの ID
  */
  constructor(api_key: string, voice_channel_id: string) {
    this.api_key = api_key;
    this.voice_channel_id = voice_channel_id;
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    });
  }

  /**
   * Discord Bot を起動する
   * @returns Promise<void>
   */
  public async start(): Promise<void> {
    this.client.once("clientReady", () => {
      console.log("Discord Bot が起動しました。");
    });

    await this.client.login(this.api_key);
  }

  /**
   * Discord Bot を停止する
   * @returns Promise<void>
   */
  public async stop(): Promise<void> {
    await this.client.destroy();
  }
}
