import type { Client, VoiceBasedChannel } from "discord.js";

/*
 * ボイスチャンネルを取得する関数
 * @param client Discord.js の Client インスタンス
 * @param channelId ボイスチャンネルの ID
 * @returns {VoiceBasedChannel | null} ボイスチャンネルが見つからない場合は null を返す
 */
function getVoiceChannel(
  client: Client,
  channelId: string,
): VoiceBasedChannel | null {
  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isVoiceBased()) {
    return null;
  }
  return channel;
}

/*
 * ボイスチャンネルが使用中かどうかを取得する関数
 * @param channel ボイスチャンネル
 * @returns {boolean} ボイスチャンネルが使用中かどうか
 */
function getVoiceChannelStatus(channel: VoiceBasedChannel): boolean {
  const members = channel.members.filter((member) => !member.user.bot);
  return members.size > 0;
}

export { getVoiceChannel, getVoiceChannelStatus };
