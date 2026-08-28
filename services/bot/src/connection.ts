import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import type { VoiceBasedChannel } from "discord.js";

export default class Connection {
  private channel: VoiceBasedChannel;
  private connection: VoiceConnection | null = null;
  /*
   * ボイスチャンネルに接続するクラス
   * @param channel ボイスチャンネル
   */
  constructor(channel: VoiceBasedChannel) {
    this.channel = channel;
  }
  /*
   * ボイスチャンネルに接続する関数
   */
  public connect(): void {
    if (this.connection) {
      return;
    }
    this.connection = joinVoiceChannel({
      channelId: this.channel.id,
      guildId: this.channel.guild.id,
      adapterCreator: this.channel.guild.voiceAdapterCreator,
    });
  }
  /*
   * ボイスチャンネルから切断する関数
   */
  public disconnect(): void {
    if (!this.connection) {
      return;
    }
    this.connection.destroy();
    this.connection = null;
  }
}
