/// <reference types="vite/client" />

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module 'canvas-confetti' {
  export default function confetti(options?: any): Promise<null> | null;
}

declare module 'heic2any';

