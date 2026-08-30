import { EndBehaviorType, AudioReceiveStream } from "@discordjs/voice";
import prism from "prism-media";
import type { VoiceConnection } from "@discordjs/voice";
import Transcriber from "./transcriber.js";
import waveResampler from "wave-resampler";
import { logger } from "../logger.js";
import Writer from "./writer.js";

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
  private transcriptionPromise: Promise<void> | null = null; // 文字起こし中のPromiseを保持する変数
  private isRunning = false; // 音声受信中かどうかのフラグ
  private transcribeTimer: NodeJS.Timeout | null = null; // 文字起こしのタイマーを格納する変数
  private writer: Writer | null = null; // Writerのインスタンスを保持する変数
  /*
   * 音声受信を開始する関数
   * @param connection 接続情報
   * @param writer Writerのインスタンス
   */
  constructor(connection: VoiceConnection, writer: Writer | null = null) {
    this.connection = connection;
    this.writer = writer;
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
      try {
        const audioStream = receiver.subscribe(userId, {
          end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 1000,
          },
        });
        audioStream.on("error", (error) => {
          logger.error(
            `ユーザー ${userId} の音声受信中にエラーが発生しました:`,
            error,
          );
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
          logger.error(
            `ユーザー ${userId} のPCMデータの受信中にエラーが発生しました:`,
            error,
          );
        });
        const cleanup = () => {
          try {
            this.activeUserStreams.delete(userId);
            audioStream.unpipe(decoder);
            audioStream.destroy();
            decoder.destroy();
          } catch (error) {
            logger.error(
              `ユーザー ${userId} の音声ストリームのクリーンアップ中にエラーが発生しました:`,
              error,
            );
          }
        };
        pcmStream.on("end", async () => {
          cleanup();
        });
        pcmStream.on("close", async () => {
          cleanup();
        });
      } catch (error) {
        logger.error(
          `ユーザー ${userId} の音声受信中にエラーが発生しました:`,
          error,
        );
      }
    });
    this.loopTranscribeTerm();
  }

  /*
   * 音声受信を停止する関数
   * @returns {Promise<void>}
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.transcribeTimer) {
      clearTimeout(this.transcribeTimer);
      this.transcribeTimer = null;
    }
    await this.transcribeAudioChunks();
    for (const [userId, audioStream] of this.activeUserStreams.entries()) {
      try {
        audioStream.destroy();
      } catch (error) {
        logger.error(
          `ユーザー ${userId} の音声ストリームの破棄中にエラーが発生しました:`,
          error,
        );
      }
      this.activeUserStreams.delete(userId);
    }

    if (this.transcriptionPromise) {
      await this.transcriptionPromise;
    }

    await this.writer?.endLog().catch((error) => {
      logger.error("Writer の endLog() 中にエラーが発生しました:", error);
    });
  }

  /*
   * 音声データを定期的に文字起こしする関数
   * @returns {Promise<void>}
   */
  private async loopTranscribeTerm(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    this.transcribeTimer = setTimeout(
      async () => this.transcribeAudioChunks(),
      this.AUDIO_RECOGNITION_INTERVAL * 1000,
    );
  }

  /*
   * 音声データを文字起こしする関数
   * @returns {Promise<void>}
   */
  private async transcribeAudioChunks(): Promise<void> {
    if (this.transcriptionPromise) {
      logger.info("文字起こし中のため、次の文字起こしをスキップします。");
      this.userAudioChunks.clear(); // 文字起こし中に新しい音声データが追加されるのを防ぐため、音声データをクリアする
      return;
    }
    this.transcriptionPromise = this.executeTranscription();
    try {
      await this.transcriptionPromise;
    } finally {
      this.transcriptionPromise = null;
    }
  }

  /*
   *  * 音声データを文字起こしする関数
   * @returns {Promise<void>}
   */
  private async executeTranscription(): Promise<void> {
    try {
      const allChunks: Buffer[] = [];
      for (const [userId, chunks] of this.userAudioChunks.entries()) {
        if (chunks.length > 0) {
          allChunks.push(...chunks);
        }
        this.userAudioChunks.delete(userId);
      }
      if (allChunks.length === 0) {
        return;
      }
      const audioBuffer = Buffer.concat(allChunks);
      const text = await this.transcribePcm(audioBuffer);
      if (text) {
        logger.debug(`文字起こし結果 > ${text}`);
        if (this.writer) {
          await this.writer.logTranscription(text);
        }
      }
    } catch (error) {
      logger.error("文字起こし中にエラーが発生しました:", error);
    }
  }

  /*
   * 音声データを文字起こしする関数
   * @param audioBuffer 音声データのBuffer
   * @returns {Promise<string | null>} 文字起こし結果の文字列、または null
   */
  private async transcribePcm(audioBuffer: Buffer) {
    try {
      // 16bit バウンダリチェック
      const validBufferLength = audioBuffer.length - (audioBuffer.length % 2);
      if (validBufferLength === 0) {
        return null;
      }
      // PCM 16bit から Float32Array に変換
      const sampleCount = validBufferLength / 2;
      const samples = new Float32Array(sampleCount);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = audioBuffer.readInt16LE(i * 2) / 32768;
      }
      // Stereo から Mono に変換
      const monoLength = Math.floor(samples.length / this.CHANNELS);
      const mono = new Float32Array(monoLength);
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
      const text = await Promise.race([
        Transcriber.transcribe(combinedSamples, this.TARGET_SAMPLE_RATE),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("文字起こしがタイムアウトしました。")),
            30_000,
          ),
        ),
      ]);
      if (text.trim() !== "") {
        return text;
      }
    } catch (error) {
      logger.error("文字起こし中にエラーが発生しました。", error);
    }
    return null;
  }
}

export { AudioReceiver };
