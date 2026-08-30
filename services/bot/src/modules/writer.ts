import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "../logger.js";

const DATA_DIR =
  process.env.DATA_DIR ?? path.resolve(process.cwd(), "..", "data");

export default class Writer {
  /*
   * ログファイルに文字起こし結果を書き込むクラス
   */
  private logFilePath: string;
  constructor(fileName: string) {
    this.logFilePath = path.join(DATA_DIR, `transcription_${fileName}.txt`);
  }
  /*
   * * 文字起こし結果をログファイルに書き込む関数
   * @param userId ユーザーID
   *   @param text 文字起こし結果の文字列
   * @returns {Promise<void>}
   */
  public async logTranscription(text: string) {
    const logEntry = `${text}\n`;
    try {
      await fs.appendFile(this.logFilePath, logEntry, { encoding: "utf-8" });
      logger.debug(
        `文字起こし結果をログファイルに保存しました: ${this.logFilePath}`,
      );
    } catch (error) {
      logger.error("ログファイルへの書き込み中にエラーが発生しました:", error);
    }
  }
}
