const STORAGE_KEY = "form-lab-locale";

const { routines, exercises } = window.FORM_LAB_DATA;
const I18N = window.FORM_LAB_I18N;

let activeFilter = "all";
let activeLevel = "beginner";
let locale = I18N.defaultLocale;

function $(sel) {
  return document.querySelector(sel);
}

function t(key) {
  return I18N.strings[locale][key] || I18N.strings.yue[key] || key;
}

function L(obj) {
  if (!obj || typeof obj !== "object") return obj;
  return obj[locale] ?? obj.yue ?? obj.en ?? "";
}

function levelLabel(level) {
  if (level === "beginner") return t("levelBeginner");
  if (level === "intermediate") return t("levelIntermediate");
  return t("levelAdvanced");
}

function formatKg(raw) {
  const s = L(raw);
  if (/[0-9]/.test(s) && !/Bodyweight|徒手|辅助|輔助|band|Band|pause|停顿|停頓|Hold|手持/i.test(s)) {
    return /kg/i.test(s) ? s : `${s} kg`;
  }
  return s;
}

function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && I18N.locales[saved]) return saved;
  return I18N.defaultLocale; // always default Traditional Cantonese
}

function setLocale(next) {
  if (!I18N.locales[next]) return;
  locale = next;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = I18N.locales[locale].htmlLang;
  applyStaticI18n();
  renderLangSwitch();
  renderRoutines();
  renderFilterChips();
  renderLevelToggle();
  renderCards();
}

function applyStaticI18n() {
  document.title = t("title");
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", t("description"));

  const map = {
    "[data-i18n='navRoutines']": "navRoutines",
    "[data-i18n='navLibrary']": "navLibrary",
    "[data-i18n='navNotes']": "navNotes",
    "[data-i18n='eyebrow']": "eyebrow",
    "[data-i18n='lede']": "lede",
    "[data-i18n='ctaLibrary']": "ctaLibrary",
    "[data-i18n='ctaRoutines']": "ctaRoutines",
    "[data-i18n='routinesTitle']": "routinesTitle",
    "[data-i18n='routinesDesc']": "routinesDesc",
    "[data-i18n='libraryTitle']": "libraryTitle",
    "[data-i18n='libraryDesc']": "libraryDesc",
    "[data-i18n='notesTitle']": "notesTitle",
    "[data-i18n='note1']": "note1",
    "[data-i18n='note2']": "note2",
    "[data-i18n='note3']": "note3",
    "[data-i18n='note4']": "note4",
    "[data-i18n='note5']": "note5",
    "[data-i18n='footerTag']": "footerTag",
    "[data-i18n='installHint']": "installHint",
  };
  Object.entries(map).forEach(([sel, key]) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.textContent = t(key);
    });
  });
  const closeBtn = $(".modal-close");
  if (closeBtn) closeBtn.setAttribute("aria-label", t("close"));
}

function renderLangSwitch() {
  const root = $("#lang-switch");
  if (!root) return;
  root.setAttribute("aria-label", t("langAria"));
  root.innerHTML = Object.values(I18N.locales)
    .map(
      (loc) => `
      <button type="button" class="lang-btn ${loc.code === locale ? "active" : ""}" data-locale="${loc.code}">
        ${loc.label}
      </button>`
    )
    .join("");
  root.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLocale(btn.dataset.locale));
  });
}

function renderFilterChips() {
  const root = $("#filters");
  const filters = [
    ["all", "filterAll"],
    ["arms", "filterArms"],
    ["chest", "filterChest"],
    ["back", "filterBack"],
    ["thighs", "filterThighs"],
    ["back-gold", "filterBackGold"],
    ["home", "filterHome"],
  ];
  root.setAttribute("aria-label", t("filterAria"));
  root.innerHTML = filters
    .map(
      ([id, key]) =>
        `<button class="chip ${activeFilter === id ? "active" : ""}" data-filter="${id}">${t(key)}</button>`
    )
    .join("");
  root.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      renderFilterChips();
      renderCards();
    });
  });
}

function renderLevelToggle() {
  const root = $("#level-toggle");
  root.setAttribute("aria-label", t("levelAria"));
  root.innerHTML = `
    <span>${t("levelShow")}</span>
    <button class="level-btn ${activeLevel === "beginner" ? "active" : ""}" data-level="beginner">${t("levelBeginner")}</button>
    <button class="level-btn ${activeLevel === "intermediate" ? "active" : ""}" data-level="intermediate">${t("levelIntermediate")}</button>
    <button class="level-btn ${activeLevel === "advanced" ? "active" : ""}" data-level="advanced">${t("levelAdvanced")}</button>
  `;
  root.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeLevel = btn.dataset.level;
      renderLevelToggle();
      renderCards();
    });
  });
}

function renderRoutines() {
  const root = $("#routine-grid");
  root.innerHTML = routines
    .map(
      (r) => `
      <article class="routine-card" data-jump="${r.id}" tabindex="0">
        <h3>${L(r.name)}</h3>
        <p style="margin:0;color:var(--muted);font-size:0.92rem">${L(r.focus)}</p>
        <div class="routine-meta">
          <span class="pill"><strong>${r.count}</strong> ${t("moves")}</span>
          <span class="pill">${t("about")} <strong>${L(r.minutes)}</strong></span>
        </div>
      </article>`
    )
    .join("");

  root.querySelectorAll(".routine-card").forEach((el) => {
    const jump = () => {
      activeFilter = el.dataset.jump;
      renderFilterChips();
      renderCards();
      $("#library").scrollIntoView({ behavior: "smooth" });
    };
    el.addEventListener("click", jump);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        jump();
      }
    });
  });
}

function renderCards() {
  const root = $("#card-grid");
  const list =
    activeFilter === "all"
      ? exercises
      : exercises.filter((ex) => ex.group === activeFilter);

  root.innerHTML = list
    .map((ex) => {
      const kgDisplay = formatKg(ex.kg[activeLevel]);
      return `
      <article class="ex-card" data-id="${ex.id}" tabindex="0">
        <div class="ex-media">
          <img src="./public/cards/${ex.image}" alt="${L(ex.name)} ${t("cardAlt")}" loading="lazy" />
          <span class="agent-badge-pill">▶ ${t("agentBadge")}</span>
        </div>
        <div class="ex-body">
          <h3>${L(ex.name)}</h3>
          <p class="ex-en">${ex.name.en}</p>
          <div class="stats">
            <div class="stat">
              <label>${t("suggestedWeight")}（${levelLabel(activeLevel)}）</label>
              <b>${kgDisplay}</b>
              <div style="font-size:0.72rem;color:var(--muted)">${L(ex.unit)}</div>
            </div>
            <div class="stat">
              <label>${t("estTime")}</label>
              <b>${ex.minutes} ${t("minutesUnit")}</b>
              <div style="font-size:0.72rem;color:var(--muted)">${L(ex.setsReps)}</div>
            </div>
          </div>
          <div class="advanced-line">${t("advancedArrow")} ${L(ex.advanced.name)}</div>
        </div>
      </article>`;
    })
    .join("");

  root.querySelectorAll(".ex-card").forEach((el) => {
    const open = () => openModal(el.dataset.id);
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

function bindAgentControls(stage) {
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
    el.setAttribute("aria-label", `${t("agentGenderLabel")}: ${g === "f" ? t("agentGenderF") : t("agentGenderM")}`);
  });
  const api = stage._agentApi;
  const syncBtn = () => {
    const playing = api ? api.isPlaying() : true;
    btn.textContent = playing ? "⏸" : "▶";
    btn.setAttribute("aria-label", playing ? t("agentPause") : t("agentPlay"));
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
  };
  syncBtn();
  btn.addEventListener("click", () => {
    if (!api) return;
    api.setPlaying(!api.isPlaying());
    syncBtn();
  });
  const modal = $("#detail-modal");
  const onClose = () => {
    if (window.FORM_LAB_AGENT) window.FORM_LAB_AGENT.stop();
    modal.removeEventListener("close", onClose);
  };
  modal.addEventListener("close", onClose);
}

function openLightbox(src, alt) {
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
  // Defer so the opening click cannot immediately dismiss the new top-layer dialog.
  box.dataset.ignoreClickUntil = String(Date.now() + 400);
  requestAnimationFrame(() => {
    if (!box.open) box.showModal();
    closeBtn?.focus?.();
  });
}

function closeLightbox() {
  const box = $("#lightbox");
  if (!box || !box.open) return;
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  box.close();
  const img = box.querySelector("[data-lightbox-img]");
  if (img) img.removeAttribute("src");
}

function openModal(id) {
  const ex = exercises.find((e) => e.id === id);
  if (!ex) return;
  const body = $("#modal-body");
  const cardSrc = `./public/cards/${ex.image}`;
  const cardAlt = `${L(ex.name)} ${t("cardFullAlt")}`;
  body.innerHTML = `
    <figure class="card-frame" data-open-lightbox tabindex="0" role="button" aria-label="${t("viewFullscreen")}">
      <img src="${cardSrc}" alt="${cardAlt}" />
      <button type="button" class="card-fs-btn" data-open-lightbox-btn>${t("viewFullscreen")}</button>
    </figure>
    <div class="modal-copy">
      <h2>${L(ex.name)}</h2>
      <p class="ex-en" style="margin:0">${ex.name.en} · ${L(ex.setsReps)}</p>
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
        <div style="color:var(--muted);font-size:0.88rem">${ex.advanced.name.en}</div>
        <p style="margin:0.45rem 0 0;color:var(--muted);font-size:0.9rem">${L(ex.advanced.note)}</p>
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
  const stage = window.FORM_LAB_AGENT.mount(host, ex.id);
  bindAgentControls(stage);
  $("#detail-modal").showModal();
}

function bindModal() {
  $(".modal-close").addEventListener("click", () => $("#detail-modal").close());
  $("#detail-modal").addEventListener("click", (e) => {
    if (e.target.id === "detail-modal") e.target.close();
  });
  $("#detail-modal").addEventListener("close", () => closeLightbox());

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
      } else if (box.requestFullscreen) {
        await box.requestFullscreen();
      }
    } catch (_) {
      /* ignore unsupported / denied */
    }
  });
}

function registerPWA() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

locale = detectLocale();
document.documentElement.lang = I18N.locales[locale].htmlLang;
applyStaticI18n();
renderLangSwitch();
renderRoutines();
renderFilterChips();
renderLevelToggle();
renderCards();
bindModal();
registerPWA();
