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
  public async connect(): Promise<VoiceConnection | null> {
    if (this.connection) {
      return this.connection;
    }
    try {
      this.connection = joinVoiceChannel({
        channelId: this.channel.id,
        guildId: this.channel.guild.id,
        adapterCreator: this.channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });
      await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
      this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(
              this.connection!,
              VoiceConnectionStatus.Signalling,
              5_000,
            ),
            entersState(
              this.connection!,
              VoiceConnectionStatus.Connecting,
              5_000,
            ),
          ]);
        } catch (error) {
          console.error("ボイスチャンネルへの再接続に失敗しました:", error);
          this.disconnect();
        }
      });
      console.log(`ボイスチャンネルに接続しました。`);
      return this.connection;
    } catch (error) {
      console.error("ボイスチャンネルへの接続に失敗しました:", error);
      this.disconnect();
      return null;
    }
  }
  /*
   * ボイスチャンネルから切断する関数
   * @returns {void}
   */
  public disconnect(): void {
    if (this.player) {
      this.player?.stop(true);
      this.player.removeAllListeners();
      this.player = null;
    }
    if (this.connection) {
      this.connection.removeAllListeners();
      if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
        this.connection.destroy();
      }
      this.connection = null;
    }
    console.log(`ボイスチャンネルから切断しました。`);
  }

  /*
   * ボイスチャンネルに接続しているかどうかを取得する関数
   * @returns {boolean} ボイスチャンネルに接続している場合は true を返し、接続していない場合は false を返す
   */
  public getConnectionStatus(): boolean {
    return (
      this.connection !== null &&
      this.connection.state.status !== VoiceConnectionStatus.Destroyed
    );
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
      this.player?.stop(true);
      console.error("音声再生中にエラーが発生しました:", error);
      throw error;
    }
  }
}
