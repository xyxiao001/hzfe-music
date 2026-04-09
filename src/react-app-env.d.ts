/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  MediaMetadata: any
}
declare module 'localforage' {
  const content: any
  export = content
}
