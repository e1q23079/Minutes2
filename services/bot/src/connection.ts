import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import type { VoiceBasedChannel } from "discord.js";

export default class Connection {
  private channel: VoiceBasedChannel;
  private connection: VoiceConnection | null = null;
  constructor(channel: VoiceBasedChannel) {
    this.channel = channel;
  }
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

  public disconnect(): void {
    if (!this.connection) {
      return;
    }
    this.connection.destroy();
    this.connection = null;
  }
}
