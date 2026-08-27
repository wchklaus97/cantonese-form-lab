export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function cardImagePng(image) {
  return `./public/cards/${image}`;
}

export function cardImageThumb(image) {
  const base = image.replace(/\.png$/i, "");
  return `./public/cards/thumbs/${base}.webp`;
}

export function isStandalonePWA() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

export function isIosSafari() {
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export function icon(name) {
  if (name === "play") {
    return `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M6.2 4.4v11.2L16 10z"/></svg>`;
  }
  if (name === "pause") {
    return `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4.2" width="3.6" height="11.6" fill="currentColor"/><rect x="11.4" y="4.2" width="3.6" height="11.6" fill="currentColor"/></svg>`;
  }
  return "";
}
