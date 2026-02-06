/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SERVICE_ID: string;
  readonly VITE_APP_TEMPLATE_ID: string;
  readonly VITE_APP_EMAILJS_RECIEVER: string;
  readonly VITE_APP_EMAILJS_KEY: string;
  readonly VITE_GITHUB_TOKEN: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
