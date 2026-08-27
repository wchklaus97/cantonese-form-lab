import { exercises } from "../data/index.js";
import { FORM_LAB_AGENT } from "../agent.js";
import { appState } from "./state.js";
import { $ } from "./dom.js";
import {
  cardImagePng,
  prefersReducedMotion,
  icon,
} from "./helpers.js";
import { t, L, formatKg } from "./i18n-helpers.js";

export function bindAgentControls(stage) {
  if (!stage) return;
  const btn = stage.querySelector("[data-agent-toggle]");
  const title = stage.querySelector("[data-agent-title]");
  const sub = stage.querySelector("[data-agent-sub]");
  const caption = stage.querySelector("[data-agent-caption]");
  const meta = stage.querySelector("[data-agent-meta]");
  const motion = stage._motion || { seconds: 1, frames: 6, note: "" };
  if (title) title.textContent = t("agentTitle");
  if (sub) sub.textContent = t("agentSub");
  if (caption) {
    const tip = motion.note ? ` · ${motion.note}` : "";
    caption.textContent = `${t("agentCaption")}${tip}`;
  }
  if (meta) {
    meta.innerHTML = `
      <span class="pill"><strong>${motion.seconds}s</strong> / ${t("agentLoop")}</span>
      <span class="pill"><strong>${motion.frames}</strong> ${t("agentFrames")}</span>`;
  }
  stage.querySelectorAll("[data-gender]").forEach((el) => {
    const g = el.getAttribute("data-gender");
    el.textContent = g === "f" ? t("agentGenderF") : t("agentGenderM");
    el.setAttribute(
      "aria-label",
      `${t("agentGenderLabel")}: ${g === "f" ? t("agentGenderF") : t("agentGenderM")}`
    );
  });
  const api = stage._agentApi;
  const syncBtn = () => {
    const playing = api ? api.isPlaying() : true;
    btn.innerHTML = playing ? icon("pause") : icon("play");
    btn.setAttribute("aria-label", playing ? t("agentPause") : t("agentPlay"));
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
  };
  syncBtn();
  btn.addEventListener("click", () => {
    if (!api) return;
    api.setPlaying(!api.isPlaying());
    syncBtn();
  });
  if (prefersReducedMotion() && api?.isPlaying()) {
    api.setPlaying(false);
    syncBtn();
  }
  const modal = $("#detail-modal");
  const onClose = () => {
    FORM_LAB_AGENT.stop();
    modal.removeEventListener("close", onClose);
  };
  modal.addEventListener("close", onClose);
}

export function openLightbox(src, alt) {
  const box = $("#lightbox");
  if (!box) return;
  const img = box.querySelector("[data-lightbox-img]");
  const hint = box.querySelector("[data-lightbox-hint]");
  img.src = src;
  img.alt = alt || t("cardFullAlt");
  if (hint) hint.textContent = t("lightboxHint");
  const fsBtn = box.querySelector("[data-lightbox-fs]");
  if (fsBtn) fsBtn.setAttribute("aria-label", t("viewFullscreen"));
  const closeBtn = box.querySelector("[data-lightbox-close]");
  if (closeBtn) closeBtn.setAttribute("aria-label", t("close"));
  box.dataset.ignoreClickUntil = String(Date.now() + 400);
  requestAnimationFrame(() => {
    if (!box.open) box.showModal();
    closeBtn?.focus?.();
  });
}

export function closeLightbox() {
  const box = $("#lightbox");
  if (!box || !box.open) return;
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  box.close();
  const img = box.querySelector("[data-lightbox-img]");
  if (img) img.removeAttribute("src");
}

export function setCardHash(id) {
  const next = `#card-${id}`;
  if (location.hash !== next) history.replaceState(null, "", next);
}

export function clearCardHash() {
  if (location.hash.startsWith("#card-")) {
    history.replaceState(null, "", "#library");
  }
}

export function readCardHash() {
  const m = location.hash.match(/^#card-(.+)$/);
  return m ? m[1] : null;
}

export function openModal(id) {
  const ex = exercises.find((e) => e.id === id);
  if (!ex) return;
  appState.lastCardEl =
    document.querySelector(`.ex-card[data-id="${id}"]`) || document.activeElement;
  const body = $("#modal-body");
  const cardSrc = cardImagePng(ex.image);
  const cardAlt = `${L(ex.name)} ${t("cardFullAlt")}`;
  body.innerHTML = `
    <figure class="card-frame" data-open-lightbox tabindex="0" role="button" aria-label="${t("viewFullscreen")}">
      <img src="${cardSrc}" alt="${cardAlt}" />
      <button type="button" class="card-fs-btn" data-open-lightbox-btn>${t("viewFullscreen")}</button>
    </figure>
    <div class="modal-copy">
      <h2 id="modal-heading">${L(ex.name)}</h2>
      <p class="ex-en">${ex.name.en} · ${L(ex.setsReps)}</p>
      <div class="stats">
        <div class="stat"><label>${t("estComplete")}</label><b>${ex.minutes} ${t("minutesUnit")}</b></div>
        <div class="stat"><label>${t("unitLabel")}</label><b>${L(ex.unit)}</b></div>
      </div>
      <div data-agent-host></div>
      <table class="kg-table">
        <thead><tr><th>${t("levelCol")}</th><th>${t("weightCol")}</th></tr></thead>
        <tbody>
          <tr><td>${t("levelBeginner")}</td><td>${formatKg(ex.kg.beginner)}</td></tr>
          <tr><td>${t("levelIntermediate")}</td><td>${formatKg(ex.kg.intermediate)}</td></tr>
          <tr><td>${t("levelAdvanced")}</td><td>${formatKg(ex.kg.advanced)}</td></tr>
        </tbody>
      </table>
      <div class="advance-box">
        <h3>${t("advancedPose")}</h3>
        <strong>${L(ex.advanced.name)}</strong>
        <div class="advance-en">${ex.advanced.name.en}</div>
        <p class="advance-note">${L(ex.advanced.note)}</p>
      </div>
    </div>`;
  const frame = body.querySelector("[data-open-lightbox]");
  const fsBtn = body.querySelector("[data-open-lightbox-btn]");
  const openFs = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openLightbox(cardSrc, cardAlt);
  };
  if (frame) {
    frame.addEventListener("click", openFs);
    frame.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openFs(e);
    });
  }
  if (fsBtn) fsBtn.addEventListener("click", openFs);
  const host = body.querySelector("[data-agent-host]");
  const stage = FORM_LAB_AGENT.mount(host, ex.id);
  bindAgentControls(stage);
  setCardHash(id);
  $("#detail-modal").showModal();
}
