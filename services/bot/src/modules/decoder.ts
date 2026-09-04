import prism from "prism-media";
import { logger } from "../logger.js";

/*
 * Opusデコーダーを安全に扱うためのクラス
 * Opusデコーダーのエラーをキャッチし、ストリームを破棄する
 */
class Decoder extends prism.opus.Decoder {
  constructor() {
    super({ frameSize: 960, channels: 2, rate: 48000 });

    this.on("error", (error) => {
      if ("code" in error && error.code === "ERR_STREAM_DESTROYED") {
        return;
      }
      logger.error("Opusデコーダーでエラーが発生しました:", error);

      if (!this.destroyed) {
        this.destroy(error);
      }
    });
  }
}

export { Decoder };
