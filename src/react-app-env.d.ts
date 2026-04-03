/// <reference types="vite/client" />

interface Window {
  MediaMetadata: any
}
declare module 'localforage' {
  const content: any
  export = content
}
