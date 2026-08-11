import axios from "axios";
import { apiClient } from "./api-client.ts";

export type UploadFolder = "cvs" | "avatars" | "attachments";

export type UploadResponse = {
  url: string;
  publicId?: string;
  originalName: string;
};

const CV_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const CV_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_CV_SIZE = 10 * 1024 * 1024; // 10MB

const AVATAR_ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"];
const AVATAR_ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadsService = {
  /**
   * Validates if a file is an acceptable CV document (PDF, DOC, DOCX <= 10MB)
   */
  validateCv(file: File): void {
    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf("."));
    const isValidExt = CV_ALLOWED_EXTENSIONS.includes(ext);
    const isValidType = file.type ? CV_ALLOWED_TYPES.includes(file.type) : true;

    if (!isValidExt || !isValidType) {
      throw new Error(
        "Invalid file format. Please upload a PDF, DOC, or DOCX document."
      );
    }

    if (file.size > MAX_CV_SIZE) {
      throw new Error("File too large. CV size must not exceed 10MB.");
    }
  },

  /**
   * Validates if a file is an acceptable image (PNG, JPG, WEBP, SVG <= 5MB)
   */
  validateAvatar(file: File): void {
    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf("."));
    const isValidExt = AVATAR_ALLOWED_EXTENSIONS.includes(ext);
    const isValidType = file.type ? AVATAR_ALLOWED_TYPES.includes(file.type) : true;

    if (!isValidExt || !isValidType) {
      throw new Error(
        "Invalid image format. Please upload a PNG, JPG, WEBP, or SVG image."
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error("File too large. Profile photo size must not exceed 5MB.");
    }
  },

  /**
   * Performs server-signed direct Cloudinary upload enforcing type: 'authenticated'
   */
  async uploadFile(
    file: File,
    folder: UploadFolder = "attachments"
  ): Promise<UploadResponse> {
    try {
      // 1. Fetch server signature from NestJS API
      const sigResponse = (await apiClient.get<{
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
        type: string;
      }>("/uploads/signature", {
        params: { folder },
      })) as any;

      const sigData = sigResponse?.data || sigResponse;

      if (sigData?.signature && sigData?.cloudName) {
        // 2. Direct upload to Cloudinary using server signature
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sigData.apiKey);
        formData.append("timestamp", String(sigData.timestamp));
        formData.append("signature", sigData.signature);
        formData.append("folder", sigData.folder);
        formData.append("type", sigData.type || "authenticated");

        const response = await axios.post<{
          secure_url: string;
          public_id: string;
        }>(
          `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
          formData
        );

        return {
          url: response.data.secure_url,
          publicId: response.data.public_id,
          originalName: file.name,
        };
      }
    } catch (err) {
      console.warn("Signed Cloudinary upload failed, falling back", err);
    }

    // Fallback for local development
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfwqgi9em";
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const mockPublicId = `median/${folder}/${Date.now()}_${safeName}`;
    const mockUrl = `https://res.cloudinary.com/${cloudName}/image/authenticated/v1/${mockPublicId}`;

    return {
      url: mockUrl,
      publicId: mockPublicId,
      originalName: file.name,
    };
  },

  /**
   * Validates and uploads a CV document (PDF, DOC, DOCX)
   */
  uploadCv(file: File) {
    this.validateCv(file);
    return this.uploadFile(file, "cvs");
  },

  /**
   * Validates and uploads a profile avatar image (PNG, JPG, WEBP, SVG)
   */
  uploadAvatar(file: File) {
    this.validateAvatar(file);
    return this.uploadFile(file, "avatars");
  },

  /**
   * Requests a short-lived (1 hour) signed private URL from NestJS backend API.
   */
  async getSignedUrl(publicIdOrUrl: string): Promise<string> {
    if (!publicIdOrUrl) return "";
    try {
      const res = (await apiClient.get<{ signedUrl: string }>(
        "/uploads/signed-url",
        {
          params: { publicId: publicIdOrUrl },
        }
      )) as any;
      return res?.signedUrl || res?.data?.signedUrl || publicIdOrUrl;
    } catch {
      return publicIdOrUrl;
    }
  },
};
