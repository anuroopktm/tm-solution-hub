import { apiClient } from "@/api/axios";
import type {
  FileUploadResponse,
  PresignedUploadRequest,
  PresignedUploadResponse,
} from "@/types/storage.types";

interface BaseResponse<T> {
  detail: string;
  data: T;
}

export const storageApi = {
  /**
   * Upload a file via the backend to MinIO/S3.
   * @param file The file to upload.
   * @param folder Destination folder prefix in the bucket (e.g., 'thumbnails', 'documents').
   * @param onProgress Optional progress callback.
   */
  uploadFile: async (
    file: File,
    folder: string = "general",
    onProgress?: (percent: number) => void,
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const { data } = await apiClient.post<BaseResponse<FileUploadResponse>>(
      "/storage/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percent);
          }
        },
      },
    );

    return data.data;
  },

  /**
   * Generate a pre-signed PUT URL for direct client-to-MinIO uploads.
   */
  getPresignedUploadUrl: async (
    payload: PresignedUploadRequest,
  ): Promise<PresignedUploadResponse> => {
    const { data } = await apiClient.post<
      BaseResponse<PresignedUploadResponse>
    >("/storage/presigned-url", payload);
    return data.data;
  },

  /**
   * Delete an object from MinIO/S3 by its key.
   */
  deleteFile: async (fileKey: string): Promise<void> => {
    await apiClient.delete(`/storage/${fileKey}`);
  },
};
