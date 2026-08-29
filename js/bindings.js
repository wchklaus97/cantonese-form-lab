import { exercises } from "../data/index.js";
import { FEATURED_ID } from "./constants.js";
import { appState } from "./state.js";
import { $ } from "./dom.js";
import { isIosSafari } from "./helpers.js";
import { t, persistPrefs } from "./i18n-helpers.js";
import {
  dismissInstallBanner,
  updateInstallBanner,
} from "./install.js";
import {
  renderFilterChips,
  renderRoutines,
  renderCards,
} from "./render-library.js";
import {
  openModal,
  closeLightbox,
  clearCardHash,
  readCardHash,
} from "./modal.js";

export function bindModal() {
  $(".modal-close").addEventListener("click", () => $("#detail-modal").close());
  $("#detail-modal").addEventListener("click", (e) => {
    if (e.target.id === "detail-modal") e.target.close();
  });
  $("#detail-modal").addEventListener("close", () => {
    closeLightbox();
    clearCardHash();
    appState.lastCardEl?.focus?.();
  });

  const box = $("#lightbox");
  if (!box) return;
  box.querySelector("[data-lightbox-close]").addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox();
  });
  box.addEventListener("click", (e) => {
    const until = Number(box.dataset.ignoreClickUntil || 0);
    if (Date.now() < until) return;
    if (e.target.closest(".lightbox-toolbar")) return;
    if (e.target === box || e.target.hasAttribute("data-lightbox-hint")) {
      closeLightbox();
    }
  });
  box.querySelector("[data-lightbox-fs]").addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        e.currentTarget.setAttribute("aria-label", t("viewFullscreen"));
      } else if (box.requestFullscreen) {
        await box.requestFullscreen();
        e.currentTarget.setAttribute("aria-label", t("exitFullscreen"));
      }
    } catch {
      /* ignore unsupported / denied */
    }
  });
}

export function bindSearch() {
  const input = $("#move-search");
  if (!input) return;
  input.value = appState.searchQuery;
  input.addEventListener("input", () => {
    appState.searchQuery = input.value;
    renderCards();
  });
  $("#empty-reset")?.addEventListener("click", () => {
    appState.searchQuery = "";
    appState.activeFilter = "all";
    persistPrefs();
    if (input) input.value = "";
    renderFilterChips();
    renderRoutines();
    renderCards();
    input?.focus();
  });
}

export function bindFeatured() {
  $("#featured-card")?.addEventListener("click", () => openModal(FEATURED_ID));
}

export function bindSlashSearch() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
    if ($("#detail-modal")?.open || $("#lightbox")?.open) return;
    e.preventDefault();
    $("#move-search")?.focus();
  });
}

export function bindCardArrows() {
  const root = $("#card-grid");
  root.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const cards = [...root.querySelectorAll(".ex-card")];
    const i = cards.indexOf(document.activeElement);
    if (i < 0) return;
    const styles = getComputedStyle(root);
    const cols = Math.max(1, styles.gridTemplateColumns.split(" ").filter(Boolean).length);
    let next = i;
    if (e.key === "ArrowLeft") next = (i - 1 + cards.length) % cards.length;
    if (e.key === "ArrowRight") next = (i + 1) % cards.length;
    if (e.key === "ArrowUp") next = Math.max(0, i - cols);
    if (e.key === "ArrowDown") next = Math.min(cards.length - 1, i + cols);
    if (next === i) return;
    e.preventDefault();
    cards[next].focus();
  });
}

export function bindScrollSpy() {
  const links = [...document.querySelectorAll(".nav a[data-section]")];
  const sections = links
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);
  if (!sections.length) return;

  const header = document.querySelector(".site-header");
  const offset = 12;

  const pick = () => {
    const line = (header?.offsetHeight ?? 0) + offset;
    const y = window.scrollY + line;
    let current = sections[0];
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec;
    }
    links.forEach((a) => {
      a.classList.toggle("is-current", a.dataset.section === current.id);
    });
  };

  pick();
  window.addEventListener("scroll", pick, { passive: true });
}

export function bindInstall() {
  const bar = $("#install-banner");
  const accept = $("#install-accept");
  const dismiss = $("#install-dismiss");
  if (!bar) return;

  if (isIosSafari()) {
    appState.installMode = "ios";
    updateInstallBanner();
    accept?.addEventListener("click", dismissInstallBanner);
    dismiss?.addEventListener("click", dismissInstallBanner);
    return;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    appState.deferredInstall = e;
    appState.installMode = "chromium";
    updateInstallBanner();
  });
  accept?.addEventListener("click", async () => {
    if (!appState.deferredInstall) return;
    appState.deferredInstall.prompt();
    await appState.deferredInstall.userChoice.catch(() => {});
    appState.deferredInstall = null;
    bar.hidden = true;
  });
  dismiss?.addEventListener("click", dismissInstallBanner);
  window.addEventListener("appinstalled", () => {
    bar.hidden = true;
    appState.deferredInstall = null;
  });
}

export function consumeDeepLink() {
  const id = readCardHash();
  if (id && exercises.some((ex) => ex.id === id)) {
    openModal(id);
  }
}

export function registerPWA() {
  if (!("serviceWorker" in navigator)) return;
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloadScheduled = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloadScheduled) return;
    reloadScheduled = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

export function bindAll() {
  bindModal();
  bindSearch();
  bindFeatured();
  bindSlashSearch();
  bindCardArrows();
  bindScrollSpy();
  bindInstall();
  registerPWA();
  consumeDeepLink();
  window.addEventListener("hashchange", consumeDeepLink);
}
