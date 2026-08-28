import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";

import type { VoiceConnection, AudioResource } from "@discordjs/voice";

/*
 * 音声を再生する関数
 * @param connection 接続情報
 * @returns {void}
 */
function playAnnounce(connection: VoiceConnection): void {
  const player = createAudioPlayer();

  player.on("error", (error) => {
    console.error("音声再生中にエラーが発生しました:", error);
  });

  player.on(AudioPlayerStatus.Playing, () => {
    console.log("音声再生が開始されました。");
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log("音声再生が終了しました。");
  });

  connection.subscribe(player);

  const resource: AudioResource = createAudioResource("./announce.wav");
  player.play(resource);
}

export { playAnnounce };
