import {
  AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  VoiceConnection,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";
import type { VoiceBasedChannel } from "discord.js";

export default class Connection {
  private channel: VoiceBasedChannel;
  private connection: VoiceConnection | null = null;
  private player: AudioPlayer | null = null;
  /*
   * ボイスチャンネルに接続するクラス
   * @param channel ボイスチャンネル
   */
  constructor(channel: VoiceBasedChannel) {
    this.channel = channel;
  }
  /*
   * ボイスチャンネルに接続する関数
   * @returns {VoiceConnection | null} 接続情報を返す。接続に失敗した場合は null を返す
   */
  public connect(): VoiceConnection | null {
    if (this.connection) {
      return this.connection;
    }
    this.connection = joinVoiceChannel({
      channelId: this.channel.id,
      guildId: this.channel.guild.id,
      adapterCreator: this.channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });
    return this.connection;
  }
  /*
   * ボイスチャンネルから切断する関数
   */
  public disconnect(): void {
    this.player?.stop(true);
    this.player = null;
    if (!this.connection) {
      return;
    }
    this.connection.destroy();
    this.connection = null;
  }

  /*
   * ボイスチャンネルに接続しているかどうかを取得する関数
   * @returns {boolean} ボイスチャンネルに接続している場合は true を返し、接続していない場合は false を返す
   */
  public getConnectionStatus(): boolean {
    return this.connection !== null;
  }

  /*
   * ボイスチャンネルで音声を再生する関数
   * @returns {Promise<void>} 音声再生が完了するまで待機する Promise を返す
   */
  public async playAnnounce(): Promise<void> {
    if (!this.connection) {
      return;
    }

    await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);

    if (!this.player) {
      this.player = createAudioPlayer();
      this.connection.subscribe(this.player);
    } else {
      this.player.stop(true);
    }

    const resource = createAudioResource("./announce.wav");
    this.player.play(resource);

    try {
      if (this.player.state.status !== AudioPlayerStatus.Playing) {
        await entersState(this.player, AudioPlayerStatus.Playing, 5_000);
      }
      console.log("音声再生が開始されました。");
      await entersState(this.player, AudioPlayerStatus.Idle, 30_000);
      console.log("音声再生が完了しました。");
    } catch (error) {
      console.error("音声再生中にエラーが発生しました:", error);
      throw error;
    }
  }
}
