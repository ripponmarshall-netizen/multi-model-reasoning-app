/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL of the Convex deployment that hosts the guarded backend.
  readonly VITE_CONVEX_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
