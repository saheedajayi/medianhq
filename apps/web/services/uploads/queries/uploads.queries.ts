"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { uploadsService, type UploadResponse } from "@/services/uploads";
import { uploadsQueryKeys } from "./query-keys";

// Signed URLs live for an hour, so reuse one for most of that window
const SIGNED_URL_STALE_TIME = 50 * 60 * 1000;

export const useSignedUrl = (publicIdOrUrl: string) => {
  return useQuery<string, Error>({
    queryKey: uploadsQueryKeys.signedUrl(publicIdOrUrl),
    queryFn: () => uploadsService.getSignedUrl(publicIdOrUrl),
    enabled: !!publicIdOrUrl,
    staleTime: SIGNED_URL_STALE_TIME,
  });
};

// Upload errors are plain Errors (validation messages), not ApiErrors
export const useUploadAvatar = () => {
  return useMutation<UploadResponse, Error, File>({
    mutationKey: uploadsQueryKeys.avatar(),
    mutationFn: (file) => uploadsService.uploadAvatar(file),
  });
};

export const useUploadCv = () => {
  return useMutation<UploadResponse, Error, File>({
    mutationKey: uploadsQueryKeys.cv(),
    mutationFn: (file) => uploadsService.uploadCv(file),
  });
};
