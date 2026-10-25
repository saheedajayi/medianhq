export type UploadFolder = "cvs" | "avatars" | "attachments";

export type UploadResponse = {
  url: string;
  publicId?: string;
  originalName: string;
};
