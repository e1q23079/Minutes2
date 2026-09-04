import { FileWriter } from "wav";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { getFileNameDate } from "./lib.js";
import { logger } from "../logger.js";

const DATA_DIR =
  process.env.DATA_DIR ?? path.resolve(process.cwd(), "..", "data");

export default class Writer {
  /*
   * 音声ファイルの作成と管理を行うクラス
   */
  private fileName: string;
  constructor(fileName: string) {
    this.fileName = fileName;
  }

  /*
   * 録音用のWAVファイルを作成する関数
   * @param userId ユーザーID
   * @returns { waveWriter: FileWriter, recFilePath: string }
   */
  public createWavFileWriter(userId: string): {
    waveWriter: FileWriter;
    recFilePath: string;
  } {
    const timestamp = getFileNameDate();
    const recFilePath = path.join(
      DATA_DIR,
      `${this.fileName}/rec_${timestamp}_${userId}.wav`,
    );
    const dir = path.dirname(recFilePath);
    fs.mkdirSync(dir, { recursive: true });
    const waveWriter = new FileWriter(recFilePath, {
      sampleRate: 48000,
      channels: 2,
      bitDepth: 16,
    });
    return { waveWriter, recFilePath };
  }

  /*
   * 録音ファイルが空である場合に削除する関数
   * @param recFilePath 録音ファイルのパス
   * @returns {Promise<void>}
   */
  public async cleanupAudioFile(recFilePath: string): Promise<void> {
    try {
      const stats = await fsPromises.stat(recFilePath);
      if (stats.size <= 44) {
        await fsPromises.unlink(recFilePath);
        logger.info("空の音声ファイルを削除しました");
      }
    } catch (error) {
      logger.error("ファイルの状態を確認中にエラーが発生しました", error);
    }
  }

  /*
   * 録音の終了をログファイルに書き込む関数
   * @returns {Promise<void>}
   */
  public async endLog() {
    const filePath = path.join(DATA_DIR, `${this.fileName}/rec_end.dat`);
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const logEntry = "\n--- End of Recording ---\n";
    try {
      await fsPromises.appendFile(filePath, logEntry, { encoding: "utf-8" });
      logger.debug(`録音の終了をログに記録しました: ${filePath}`);
    } catch (error) {
      logger.error("ログファイルへの書き込み中にエラーが発生しました:", error);
    }
  }
}
