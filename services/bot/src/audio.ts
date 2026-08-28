import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  EndBehaviorType,
  AudioReceiveStream,
} from "@discordjs/voice";
import prism from "prism-media";
import type { VoiceConnection, AudioResource } from "@discordjs/voice";
import Transcriber from "./transcriber.js";
import waveResampler from "wave-resampler";

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

class AudioReceiver {
  /*
   * 音声を受信するクラス
   */
  private connection: VoiceConnection;
  private SAMPLE_RATE = 48000; // サンプルレート
  private CHANNELS = 2; // チャンネル数
  private TARGET_SAMPLE_RATE = 16000; // 変換後のサンプルレート
  private AUDIO_RECOGNITION_INTERVAL = 5; // 5秒ごとに音声認識
  private userAudioChunks = new Map<string, Buffer[]>(); // ユーザーごとの音声データを格納するマップ
  private activeUserStreams = new Map<string, AudioReceiveStream>(); // ユーザーごとの音声ストリームのタイマーを格納するマップ
  private isTranscribing = false; // 文字起こし中かどうかのフラグ
  private isRunning = false; // 音声受信中かどうかのフラグ
  /*
   * 音声受信を開始する関数
   * @param connection 接続情報
   */
  constructor(connection: VoiceConnection) {
    this.connection = connection;
  }
  /*
   * 音声受信を開始する関数
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    this.isRunning = true;
    const receiver = this.connection.receiver;
    receiver.speaking.on("start", (userId) => {
      if (this.activeUserStreams.has(userId)) {
        return;
      }
      const audioStream = receiver.subscribe(userId, {
        end: {
          behavior: EndBehaviorType.AfterSilence,
          duration: 1000,
        },
      });
      this.activeUserStreams.set(userId, audioStream);
      const decoder = new prism.opus.Decoder({
        rate: this.SAMPLE_RATE,
        channels: this.CHANNELS,
        frameSize: 960,
      });
      const pcmStream = audioStream.pipe(decoder);
      pcmStream.on("data", (chunk: Buffer) => {
        if (!this.userAudioChunks.has(userId)) {
          this.userAudioChunks.set(userId, []);
        }
        const chunks = this.userAudioChunks.get(userId) || [];
        chunks.push(chunk);
        this.userAudioChunks.set(userId, chunks);
      });
      pcmStream.on("error", (error) => {
        console.error(
          `ユーザー ${userId} のPCMデータの受信中にエラーが発生しました:`,
          error,
        );
      });
      pcmStream.on("end", async () => {
        this.activeUserStreams.delete(userId);
      });
    });
    this.transcribeAudioChunks();
  }

  /*
   * 音声受信を停止する関数
   * @returns {Promise<void>}
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    this.transcribeAudioChunks();
  }

  private async transcribeAudioChunks(): Promise<void> {
    setTimeout(async () => {
      if (this.isTranscribing) {
        console.log("文字起こし中のため、次の文字起こしをスキップします。");
        this.userAudioChunks.clear(); // 文字起こし中に新しい音声データが追加されるのを防ぐため、音声データをクリアする
        this.transcribeAudioChunks(); // 再帰的に呼び出して、次の文字起こしを行う
        return;
      }
      this.isTranscribing = true;
      try {
        const allChunks: Buffer[] = [];
        for (const [userId, chunks] of this.userAudioChunks.entries()) {
          allChunks.push(...chunks);
          this.userAudioChunks.set(userId, []);
        }
        if (allChunks.length === 0) {
          return;
        }
        const audioBuffer = Buffer.concat(allChunks);
        const text = await this.transcribePcm(audioBuffer);
        if (text) {
          console.log(`文字起こし結果 > ${text}`);
        }
      } catch (error) {
        console.error("文字起こし中にエラーが発生しました:", error);
      } finally {
        this.isTranscribing = false;
        if (this.isRunning) {
          this.transcribeAudioChunks(); // 再帰的に呼び出して、次の文字起こしを行う
        }
      }
    }, this.AUDIO_RECOGNITION_INTERVAL * 1000);
  }

  /*
   * 音声データを文字起こしする関数
   * @param audioBuffer 音声データのBuffer
   * @returns {Promise<string | null>} 文字起こし結果の文字列、または null
   */
  private async transcribePcm(audioBuffer: Buffer) {
    try {
      // PCM 16bit から Float32Array に変換
      const samples = new Float32Array(audioBuffer.length / 2);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = audioBuffer.readInt16LE(i * 2) / 32768;
      }
      // Streo から Mono に変換
      const mono = new Float32Array(samples.length / 2);
      for (let i = 0; i < mono.length; i++) {
        mono[i] = (samples[i * 2]! + samples[i * 2 + 1]!) / 2;
      }
      // 48kHz から 16kHz にリサンプリング
      const resampled = waveResampler.resample(
        mono,
        this.SAMPLE_RATE,
        this.TARGET_SAMPLE_RATE,
      );
      // 前後に無音を追加して、文字起こしの精度を向上させる
      const paddingSamples = new Float32Array(this.TARGET_SAMPLE_RATE * 0.3); // 0.3秒分の無音
      const combinedSamples = new Float32Array(
        resampled.length + paddingSamples.length,
      );
      combinedSamples.set(resampled);
      combinedSamples.set(paddingSamples, resampled.length);
      // Whisper で文字起こし
      const text = await Transcriber.transcribe(
        combinedSamples,
        this.TARGET_SAMPLE_RATE,
      );
      if (text.trim() !== "") {
        return text;
      }
    } catch (error) {
      console.error("文字起こし中にエラーが発生しました。", error);
    }
    return null;
  }
}

export { AudioReceiver, playAnnounce };
