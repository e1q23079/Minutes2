import {
  pipeline,
  type AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let initPromise: Promise<void> | null = null;

/*
 * Whisperの初期化を行う関数
 */
async function initialize(): Promise<void> {
  if (transcriber) {
    console.log("Whisperはすでに初期化されています。");
    return;
  }
  if (initPromise) {
    console.log("Whisperの初期化中です。完了を待っています...");
    await initPromise;
    return;
  }
  initPromise = (async () => {
    try {
      console.log("Whisperの初期化をしています...");
      transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-small",
        { device: "cpu" },
      );
      console.log("Whisperの初期化が完了しました。");
    } catch (error) {
      console.error("Whisperの初期化中にエラーが発生しました:", error);
      initPromise = null;
      throw error;
    }
  })();
  await initPromise;
}

/*
 * * 音声データを文字起こしする関数
 * @param audio 音声データのFloat32Array
 * @param sampleRate 音声データのサンプリングレート
 * @returns Promise<string> 文字起こし結果の文字列
 */
async function transcribe(
  audio: Float32Array,
  sampleRate: number,
): Promise<string> {
  if (!transcriber) {
    throw new Error(
      "Whisperが初期化されていません。initializeWhisper()を呼び出してください。",
    );
  }
  const result = await transcriber(audio, {
    sampling_rate: sampleRate,
    language: "ja",
    task: "transcribe",
    // chunk_length_s: 30,
    // stride_length_s: 5,
  });
  if (Array.isArray(result)) {
    return result.map((r) => r.text).join(" ");
  }
  if (typeof result?.text === "string") {
    return result.text;
  }
  throw new Error("文字起こし結果が不正です。");
}

export default { initialize, transcribe };
