import type { VoiceState, Client, VoiceBasedChannel } from "discord.js";

/*
 * ボイスチャンネルにユーザーが参加したかどうかを取得する関数
 * @param oldState 以前のボイスステート
 * @param newState 新しいボイスステート
 * @param voice_channel_id ボイスチャンネルの ID
 * @returns {boolean} ユーザーがボイスチャンネルに参加したかどうか
 */
function getEnterVCStatus(
  oldState: VoiceState,
  newState: VoiceState,
  voice_channel_id: string,
): boolean {
  return (
    oldState.channelId !== voice_channel_id &&
    newState.channelId === voice_channel_id &&
    !newState.member?.user.bot
  );
}

/**
 * ボイスチャンネルからユーザーが退出したかどうかを取得する関数
 * @param oldState 以前のボイスステート
 * @param newState 新しいボイスステート
 * @param voice_channel_id ボイスチャンネルの ID
 * @returns {boolean} ユーザーがボイスチャンネルから退出したかどうか
 */
function getLeaveVCStatus(
  oldState: VoiceState,
  newState: VoiceState,
  voice_channel_id: string,
): boolean {
  return (
    oldState.channelId === voice_channel_id &&
    newState.channelId !== voice_channel_id &&
    !oldState.member?.user.bot
  );
}

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

export {
  getEnterVCStatus,
  getLeaveVCStatus,
  getVoiceChannel,
  getVoiceChannelStatus,
};
