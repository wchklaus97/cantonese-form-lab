import { INSTALL_DISMISS_KEY } from "./constants.js";
import { appState } from "./state.js";
import { $ } from "./dom.js";
import { isIosSafari, isStandalonePWA } from "./helpers.js";
import { t } from "./i18n-helpers.js";

export function shouldShowInstallBanner() {
  if (isStandalonePWA()) return false;
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) return false;
  } catch {
    /* private mode */
  }
  return appState.installMode === "ios" || appState.installMode === "chromium";
}

export function dismissInstallBanner() {
  const bar = $("#install-banner");
  if (bar) bar.hidden = true;
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  } catch {
    /* private mode */
  }
  appState.deferredInstall = null;
}

export function updateInstallBanner() {
  const bar = $("#install-banner");
  const accept = $("#install-accept");
  const dismiss = $("#install-dismiss");
  if (!bar) return;
  if (!shouldShowInstallBanner()) {
    bar.hidden = true;
    return;
  }
  const bannerP = bar.querySelector("p");
  if (bannerP) {
    bannerP.textContent =
      appState.installMode === "ios" ? t("installBannerIos") : t("installBanner");
  }
  if (accept) {
    accept.textContent =
      appState.installMode === "ios" ? t("installIosDismiss") : t("installAccept");
  }
  if (dismiss) dismiss.textContent = t("installDismiss");
  bar.hidden = false;
}
