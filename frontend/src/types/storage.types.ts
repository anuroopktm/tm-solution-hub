export interface FileUploadResponse {
  file_key: string;
  url: string;
  filename: string;
  content_type: string;
  file_size_bytes: number;
}

export interface PresignedUploadRequest {
  filename: string;
  content_type: string;
  folder?: string;
  expires_in?: number;
}

export interface PresignedUploadResponse {
  upload_url: string;
  file_key: string;
  public_url: string;
  expires_in: number;
}
