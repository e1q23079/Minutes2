import { Transform, type TransformCallback } from "stream";
import prism from "prism-media";
import { logger } from "../logger.js";

interface PrismOplusDecoder extends prism.opus.Decoder {
  _decode(chunk: Buffer): Buffer | null;
}

/*
 * Opusデコーダーを安全に扱うためのクラス
 * Opusデコーダーのエラーをキャッチし、ストリームを破棄する
 */
class Decoder extends Transform {
  private decoder: PrismOplusDecoder;
  constructor() {
    super();
    this.decoder = new prism.opus.Decoder({
      frameSize: 960,
      channels: 2,
      rate: 48000,
    }) as PrismOplusDecoder;

    this.decoder.on("error", (error) => {
      logger.error("Opusデコーダーでエラーが発生しました:", error);
      this.destroy(error);
    });
  }

  /*
   * Opusデコーダーでエラーが発生した場合にストリームを破棄する関数
   * @param chunk デコードするチャンク
   * @param encoding エンコーディング
   * @param callback コールバック関数
   */
  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    try {
      const pcm = this.decoder._decode(chunk);
      if (pcm) {
        this.push(pcm);
      }
    } catch (error) {
      logger.error("Opusデコーダーでエラーが発生しました:", error);
    }
    callback();
  }
}

export { Decoder };
