import fs from "node:fs/promises";
import { logger } from "../logger.js";

export default class Writer {
  /*
   * ログファイルに文字起こし結果を書き込むクラス
   */
  private logFilePath: string;
  constructor(logFilePath: string) {
    this.logFilePath = logFilePath;
  }
  /*
   * * 文字起こし結果をログファイルに書き込む関数
   * @param userId ユーザーID
   *   @param text 文字起こし結果の文字列
   * @returns {Promise<void>}
   */
  public async logTranscription(userId: string, text: string) {
    const logEntry = `ユーザー ${userId} の文字起こし結果: ${text}\n`;
    try {
      await fs.appendFile(this.logFilePath, logEntry, { encoding: "utf-8" });
      logger.info(
        `文字起こし結果をログファイルに保存しました: ${this.logFilePath}`,
      );
    } catch (error) {
      logger.error("ログファイルへの書き込み中にエラーが発生しました:", error);
    }
  }
}
