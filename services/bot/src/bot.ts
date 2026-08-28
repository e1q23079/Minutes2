import { Client, GatewayIntentBits } from "discord.js";
import Connection from "./connection.js";
import {
  getEnterVCStatus,
  getLeaveVCStatus,
  getVoiceChannel,
  getVoiceChannelStatus,
} from "./channel.js";
import type { VoiceBasedChannel } from "discord.js";

/**
 * Discord Bot を管理するクラス
 */
export default class Bot {
  private api_key: string;
  private voice_channel_id: string;
  private client: Client;
  private channel: VoiceBasedChannel | null = null;
  private connection: Connection | null = null;
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
    this.client.on("error", (error) => {
      console.error("Discord Bot でエラーが発生しました:", error);
    });

    this.client.once("clientReady", () => {
      console.log("Discord Bot が起動しました。");
      this.channel = getVoiceChannel(this.client, this.voice_channel_id);
      if (this.channel === null) {
        throw new Error(
          "指定されたチャンネルが見つからないか、ボイスチャンネルではありません。",
        );
      }
      this.connection = new Connection(this.channel);
    });

    this.client.on("voiceStateUpdate", (oldState, newState) => {
      if (
        getEnterVCStatus(oldState, newState, this.voice_channel_id) &&
        getVoiceChannelStatus(newState.channel!)
      ) {
        console.log(
          "ボイスチャンネルにユーザーが参加しました。接続を開始します。",
        );
        this.connection?.connect();
      } else if (
        getLeaveVCStatus(oldState, newState, this.voice_channel_id) &&
        !getVoiceChannelStatus(oldState.channel!)
      ) {
        console.log(
          "ボイスチャンネルからユーザーが退出しました。接続を切断します。",
        );
        this.connection?.disconnect();
      }
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
