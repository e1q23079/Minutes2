import { EndBehaviorType, AudioReceiveStream } from "@discordjs/voice";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
import type { VoiceConnection } from "@discordjs/voice";
import { Decoder } from "./decoder.js";
import { logger } from "../logger.js";
import Writer from "./writer.js";

/*
 * 音声を受信するクラス
 */
class AudioReceiver {
  private connection: VoiceConnection;
  private activeUserStreams = new Map<string, AudioReceiveStream>(); // ユーザーIDとAudioReceiveStreamのマップ
  private isRunning = false; // 音声受信中かどうかのフラグ
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
    receiver.speaking.on("start", this.handleSpeakingStart);
  }

  /*
   * 音声受信を停止する関数
   * @returns {Promise<void>}
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    this.connection.receiver.speaking.off("start", this.handleSpeakingStart);
    for (const [userId, audioStream] of this.activeUserStreams.entries()) {
      try {
        audioStream.destroy();
      } catch (error) {
        logger.error(
          `ユーザー ${userId} の音声ストリームの破棄中にエラーが発生しました:`,
          error,
        );
      }
    }
    this.activeUserStreams.clear();
    await this.writer?.endLog().catch((error) => {
      logger.error("Writer の endLog() 中にエラーが発生しました:", error);
    });
  }

  /*
   * ユーザーの音声受信開始イベントを処理する関数
   * @param userId ユーザーID
   */
  private handleSpeakingStart = (userId: string): void => {
    this.handleUserAudioStream(userId).catch((error) => {
      logger.error(
        `ユーザー ${userId} の音声受信の開始中にエラーが発生しました:`,
        error,
      );
    });
  };

  /*
   * ユーザーの音声ストリームを処理する関数
   * @param userId ユーザーID
   * @returns {Promise<void>}
   */
  private async handleUserAudioStream(userId: string): Promise<void> {
    if (!this.isRunning) return;
    if (this.activeUserStreams.has(userId)) {
      return;
    }
    if (!this.writer) {
      logger.error("Writerのインスタンスが初期化されていません。");
      return;
    }
    try {
      const audioStream = this.connection.receiver.subscribe(userId, {
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
      const { waveWriter, recFilePath } =
        await this.writer.createWavFileWriter(userId);
      const decoder = new Decoder();
      try {
        await pipeline(audioStream, decoder, waveWriter);
      } catch (error) {
        logger.error(
          `ユーザー ${userId} の音声受信のパイプライン中にエラーが発生しました:`,
          error,
        );
      } finally {
        this.activeUserStreams.delete(userId);
        await new Promise<void>((resolve) => {
          if ((waveWriter as Writable).destroyed) {
            resolve();
            return;
          }
          waveWriter.once("done", () => resolve());
          setTimeout(resolve, 5000); // 5秒後に強制的に解決
        });
        await this.writer.cleanupAudioFile(recFilePath).catch((error) => {
          logger.error(
            `ユーザー ${userId} の音声ファイルのクリーンアップ中にエラーが発生しました:`,
            error,
          );
        });
      }
    } catch (error) {
      logger.error(
        `ユーザー ${userId} の音声受信の開始中にエラーが発生しました:`,
        error,
      );
    }
  }
}

export { AudioReceiver };
