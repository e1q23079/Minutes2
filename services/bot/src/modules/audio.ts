import { EndBehaviorType, AudioReceiveStream } from "@discordjs/voice";
import { pipeline } from "stream";
import type { VoiceConnection } from "@discordjs/voice";
import { Decoder } from "./decoder.js";
import { logger } from "../logger.js";
import Writer from "./writer.js";

class AudioReceiver {
  /*
   * 音声を受信するクラス
   */
  private connection: VoiceConnection;
  private activeUserStreams = new Map<string, AudioReceiveStream>(); // ユーザーごとの音声ストリームのタイマーを格納するマップ
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
    receiver.speaking.on("start", (userId) => {
      if (!this.isRunning) return;
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

        if (!this.writer) {
          logger.error("Writerのインスタンスが初期化されていません。");
          return;
        }
        const { waveWriter, recFilePath } =
          this.writer.createWavFileWriter(userId);
        const decoder = new Decoder();

        pipeline(audioStream, decoder, waveWriter, async (err) => {
          this.activeUserStreams.delete(userId);
          if (err) {
            logger.error(
              `ユーザー ${userId} の音声パイプライン中にエラーが発生しました:`,
              err,
            );
          }
          await this.writer?.cleanupAudioFile(recFilePath);
        });
      } catch (error) {
        logger.error(
          `ユーザー ${userId} の音声受信の開始中にエラーが発生しました:`,
          error,
        );
      }
    });
  }

  /*
   * 音声受信を停止する関数
   * @returns {Promise<void>}
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
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

    await this.writer?.endLog().catch((error) => {
      logger.error("Writer の endLog() 中にエラーが発生しました:", error);
    });
  }
}

export { AudioReceiver };
