import {
  pipeline,
  type AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";

export default class Transcriber {
  /*
   * 文字お越しを行うクラス
   */
  private transcriber: AutomaticSpeechRecognitionPipeline | null = null;
  /*
   * Whisperの初期化を行う関数
   */
  public async initialize() {
    console.log("Whisperの初期化を開始します...");
    this.transcriber = await pipeline(
      "automatic-speech-recognition",
      "onnx-community/whisper-small",
      { device: "cpu" },
    );
    console.log("Whisperの初期化が完了しました。");
  }

  /*
   * * 音声データを文字起こしする関数
   * @param audio 音声データのFloat32Array
   * @param sampleRate 音声データのサンプリングレート
   * @returns Promise<string> 文字起こし結果の文字列
   */
  public async transcribe(
    audio: Float32Array,
    sampleRate: number,
  ): Promise<string> {
    if (!this.transcriber) {
      throw new Error(
        "Whisperが初期化されていません。initializeWhisper()を呼び出してください。",
      );
    }
    const result = await this.transcriber(audio, {
      sampling_rate: sampleRate,
      language: "ja",
      task: "transcribe",
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    return result.text;
  }
}
