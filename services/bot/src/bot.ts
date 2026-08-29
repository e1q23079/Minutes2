import { Client, GatewayIntentBits, Events } from "discord.js";
import Connection from "./connection.js";
import {
  getEnterVCStatus,
  getLeaveVCStatus,
  getVoiceChannel,
  getVoiceChannelStatus,
} from "./channel.js";
import type { VoiceBasedChannel } from "discord.js";
import { AudioReceiver } from "./audio.js";
import Transcriber from "./transcriber.js";

const VC_WAIT_TIME = 5; // ボットが接続・切断するまでの待機時間（秒）

/**
 * Discord Bot を管理するクラス
 */
export default class Bot {
  private api_key: string;
  private voice_channel_id: string;
  private client: Client;
  private channel: VoiceBasedChannel | null = null;
  private connection: Connection | null = null;

  private botPrevStatus: boolean = false; // ボットの前回の接続状態を管理するフラグ
  private botStatus: boolean = false; // ボットの接続状態を管理するフラグ
  private processTimer: NodeJS.Timeout | null = null; // タイマーを管理する変数
  private isProcessing: boolean = false; // ボイスチャンネルでの処理中かどうかを管理するフラグ
  private audioReceiver: AudioReceiver | null = null; // AudioReceiverのインスタンスを保持する変数
  private isDestroyed: boolean = false;
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
    Transcriber.initialize(); // Transcriber の初期化を行う

    this.client.on(Events.Error, (error) => {
      console.error("Discord Bot でエラーが発生しました:", error);
    });

    const readyPromise = new Promise<void>((resolve, reject) => {
      this.client.once(Events.ClientReady, () => {
        try {
          console.log("Discord Bot が起動しました。");
          this.channel = getVoiceChannel(this.client, this.voice_channel_id);
          if (this.channel === null) {
            reject(
              new Error(
                "指定されたチャンネルが見つからないか、ボイスチャンネルではありません。",
              ),
            );
            return;
          }
          this.connection = new Connection(this.channel);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    await this.client.login(this.api_key);
    await readyPromise;

    this.setupEventListeners();
  }

  /**
   * Discord Bot を停止する
   * @returns Promise<void>
   */
  public async stop(): Promise<void> {
    this.isDestroyed = true;
    this.clearProcessTimer();
    if (this.audioReceiver) {
      try {
        await this.audioReceiver.stop();
      } catch (error) {
        console.error("AudioReceiver の停止中にエラーが発生しました:", error);
      }
      this.audioReceiver = null;
    }
    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch (error) {
        console.error("Connection の切断中にエラーが発生しました:", error);
      }
      this.connection = null;
    }
    this.client.removeAllListeners();
    await this.client.destroy();
  }

  private setupEventListeners(): void {
    if (this.isDestroyed) {
      return;
    }
    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      if (this.isDestroyed) {
        return;
      }
      if (
        getEnterVCStatus(oldState, newState, this.voice_channel_id) &&
        getVoiceChannelStatus(newState.channel!) === "one"
      ) {
        console.log(
          "ボイスチャンネルにユーザーが参加しました。接続を開始します。",
        );
        // 1分後にボットを接続する
        this.botStatus = true;
        this.setProcessTimer();
      } else if (
        getLeaveVCStatus(oldState, newState, this.voice_channel_id) &&
        getVoiceChannelStatus(oldState.channel!) === "empty"
      ) {
        console.log(
          "ボイスチャンネルからユーザーが退出しました。接続を切断します。",
        );
        //１分後にボットを切断する
        this.botStatus = false;
        this.setProcessTimer();
      }
    });
  }

  /**
   * ボイスチャンネルでの処理
   * @returns {void}
   */
  private async VCProcess(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }
    // ボットの接続状態が変化していない場合は処理をスキップする
    if (this.botPrevStatus === this.botStatus || this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    try {
      if (this.botStatus) {
        const connection = this.connection?.connect();
        if (!connection) {
          console.error("ボイスチャンネルへの接続に失敗しました。");
          return;
        }
        this.botPrevStatus = this.botStatus;
        if (this.audioReceiver) {
          await this.audioReceiver.stop().catch((error) => {
            console.error(
              "AudioReceiver の停止中にエラーが発生しました:",
              error,
            );
          });
          this.audioReceiver = null;
        }
        this.audioReceiver = new AudioReceiver(connection);
        await this.connection?.playAnnounce();
        if (!this.isDestroyed) {
          await this.audioReceiver?.start();
        }
      } else {
        this.botPrevStatus = this.botStatus;
        await this.audioReceiver?.stop();
        this.audioReceiver = null;
        this.connection?.disconnect();
      }
    } catch (error) {
      console.error("ボイスチャンネルでの処理中にエラーが発生しました:", error);
    } finally {
      this.isProcessing = false;
      if (!this.isDestroyed && this.botPrevStatus !== this.botStatus) {
        this.setProcessTimer();
      }
    }
  }

  /**
   * * タイマーをクリアする関数
   * @returns {void}
   */
  private clearProcessTimer(): void {
    if (this.processTimer) {
      clearTimeout(this.processTimer);
      this.processTimer = null;
    }
  }

  /**
   * * タイマーをセットする関数
   * @returns {void}
   */
  private setProcessTimer(): void {
    this.clearProcessTimer();
    if (this.isDestroyed) {
      return;
    }
    this.processTimer = setTimeout(() => {
      this.processTimer = null;
      this.VCProcess();
    }, VC_WAIT_TIME * 1000);
  }
}
