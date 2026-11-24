/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BRAND_NAME?: string;
  readonly VITE_BRAND_SUBTITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
