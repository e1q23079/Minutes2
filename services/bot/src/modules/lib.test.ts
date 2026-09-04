import { describe, expect, it } from "vitest";
import { getFileNameDate } from "./lib.js";

describe("getFileNameDate", () => {
  it("YYYY-MM-DD_HH-MM-SS 形式の文字列を返す", () => {
    const fileName = getFileNameDate();
    expect(fileName).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
  });
});
