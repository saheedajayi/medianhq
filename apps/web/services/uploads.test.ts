import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { uploadsService } from "./uploads.ts";

function createDummyFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob(["a".repeat(Math.min(sizeBytes, 1000))], { type });
  Object.defineProperty(blob, "name", { value: name });
  Object.defineProperty(blob, "size", { value: sizeBytes });
  return blob as File;
}

describe("uploadsService validations", () => {
  describe("validateCv", () => {
    it("accepts valid PDF documents under 10MB", () => {
      const file = createDummyFile("resume.pdf", "application/pdf", 1024 * 1024);
      assert.doesNotThrow(() => uploadsService.validateCv(file));
    });

    it("accepts valid DOC and DOCX documents under 10MB", () => {
      const docFile = createDummyFile("cv.doc", "application/msword", 500 * 1024);
      const docxFile = createDummyFile(
        "cv.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        2 * 1024 * 1024
      );

      assert.doesNotThrow(() => uploadsService.validateCv(docFile));
      assert.doesNotThrow(() => uploadsService.validateCv(docxFile));
    });

    it("handles uppercase file extension (RESUME.PDF)", () => {
      const file = createDummyFile("MY_RESUME.PDF", "application/pdf", 1024 * 1024);
      assert.doesNotThrow(() => uploadsService.validateCv(file));
    });

    it("rejects non-document file types (PNG, JPG, MP4, TXT, EXE)", () => {
      const pngFile = createDummyFile("photo.png", "image/png", 1024 * 1024);
      const exeFile = createDummyFile("virus.exe", "application/x-msdownload", 1024);

      assert.throws(
        () => uploadsService.validateCv(pngFile),
        /Invalid file format. Please upload a PDF, DOC, or DOCX document./
      );

      assert.throws(
        () => uploadsService.validateCv(exeFile),
        /Invalid file format. Please upload a PDF, DOC, or DOCX document./
      );
    });

    it("rejects CV documents exceeding 10MB size limit", () => {
      const largeFile = createDummyFile(
        "portfolio.pdf",
        "application/pdf",
        11 * 1024 * 1024
      );

      assert.throws(
        () => uploadsService.validateCv(largeFile),
        /File too large. CV size must not exceed 10MB./
      );
    });
  });

  describe("validateAvatar", () => {
    it("accepts valid PNG, JPG, WEBP, SVG, and GIF images under 5MB", () => {
      const png = createDummyFile("avatar.png", "image/png", 1024 * 1024);
      const jpg = createDummyFile("photo.jpg", "image/jpeg", 2 * 1024 * 1024);
      const webp = createDummyFile("pic.webp", "image/webp", 500 * 1024);
      const svg = createDummyFile("logo.svg", "image/svg+xml", 100 * 1024);

      assert.doesNotThrow(() => uploadsService.validateAvatar(png));
      assert.doesNotThrow(() => uploadsService.validateAvatar(jpg));
      assert.doesNotThrow(() => uploadsService.validateAvatar(webp));
      assert.doesNotThrow(() => uploadsService.validateAvatar(svg));
    });

    it("rejects non-image document file types (PDF, DOCX)", () => {
      const pdf = createDummyFile("document.pdf", "application/pdf", 1024 * 1024);

      assert.throws(
        () => uploadsService.validateAvatar(pdf),
        /Invalid image format. Please upload a PNG, JPG, WEBP, or SVG image./
      );
    });

    it("rejects avatar images exceeding 5MB size limit", () => {
      const heavyImage = createDummyFile(
        "huge_photo.png",
        "image/png",
        6 * 1024 * 1024
      );

      assert.throws(
        () => uploadsService.validateAvatar(heavyImage),
        /File too large. Profile photo size must not exceed 5MB./
      );
    });
  });
});
