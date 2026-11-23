import { useMutation } from "@tanstack/react-query";
import { storageApi } from "@/api/storage.api";
import type { FileUploadResponse } from "@/types/storage.types";

export interface UploadFileVariables {
  file: File;
  folder?: string;
  onProgress?: (percent: number) => void;
}

/**
 * React Query mutation hook for uploading files to MinIO/S3.
 */
export function useUploadFile() {
  return useMutation<FileUploadResponse, Error, UploadFileVariables>({
    mutationFn: ({
      file,
      folder = "general",
      onProgress,
    }: UploadFileVariables) => storageApi.uploadFile(file, folder, onProgress),
  });
}
