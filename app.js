const STORAGE_KEY = "form-lab-locale";
const LEVEL_KEY = "form-lab-level";
const FILTER_KEY = "form-lab-filter";
const SEARCH_KEY = "form-lab-search";
const INSTALL_DISMISS_KEY = "form-lab-install-dismissed";
const FEATURED_ID = "chest-01";

const { routines, exercises } = window.FORM_LAB_DATA;
const I18N = window.FORM_LAB_I18N;

let activeFilter = "all";
let activeLevel = "beginner";
let searchQuery = "";
let locale = I18N.defaultLocale;
let lastCardEl = null;
let deferredInstall = null;
let installMode = null;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function cardImagePng(image) {
  return `./public/cards/${image}`;
}

function cardImageThumb(image) {
  const base = image.replace(/\.png$/i, "");
  return `./public/cards/thumbs/${base}.webp`;
}

function isStandalonePWA() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

function isIosSafari() {
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

function shouldShowInstallBanner() {
  if (isStandalonePWA()) return false;
  try {
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) return false;
  } catch {
    /* private mode */
  }
  return installMode === "ios" || installMode === "chromium";
}

function dismissInstallBanner() {
  const bar = $("#install-banner");
  if (bar) bar.hidden = true;
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  } catch {
    /* private mode */
  }
  deferredInstall = null;
}

function updateInstallBanner() {
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
    bannerP.textContent = installMode === "ios" ? t("installBannerIos") : t("installBanner");
  }
  if (accept) {
    accept.textContent = installMode === "ios" ? t("installIosDismiss") : t("installAccept");
  }
  if (dismiss) dismiss.textContent = t("installDismiss");
  bar.hidden = false;
}

function $(sel) {
  return document.querySelector(sel);
}

function t(key) {
  return I18N.strings[locale][key] || I18N.strings.yue[key] || key;
}

function tf(key, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    t(key)
  );
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

function icon(name) {
  if (name === "play") {
    return `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M6.2 4.4v11.2L16 10z"/></svg>`;
  }
  if (name === "pause") {
    return `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="4.2" width="3.6" height="11.6" fill="currentColor"/><rect x="11.4" y="4.2" width="3.6" height="11.6" fill="currentColor"/></svg>`;
  }
  return "";
}

function persistPrefs() {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    localStorage.setItem(LEVEL_KEY, activeLevel);
    sessionStorage.setItem(FILTER_KEY, activeFilter);
    sessionStorage.setItem(SEARCH_KEY, searchQuery);
  } catch {
    /* private mode */
  }
}

function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && I18N.locales[saved]) return saved;
  return I18N.defaultLocale;
}

function detectLevel() {
  const saved = localStorage.getItem(LEVEL_KEY);
  if (saved === "beginner" || saved === "intermediate" || saved === "advanced") return saved;
  return "beginner";
}

function detectFilter() {
  try {
    const saved = sessionStorage.getItem(FILTER_KEY);
    if (saved && (saved === "all" || routines.some((r) => r.id === saved))) return saved;
  } catch {
    /* ignore */
  }
  return "all";
}

function detectSearch() {
  try {
    return sessionStorage.getItem(SEARCH_KEY) || "";
  } catch {
    return "";
  }
}

function setLocale(next) {
  if (!I18N.locales[next]) return;
  locale = next;
  persistPrefs();
  document.documentElement.lang = I18N.locales[locale].htmlLang;
  applyStaticI18n();
  renderLangSwitch();
  renderRoutines();
  renderFilterChips();
  renderLevelToggle();
  renderFeatured();
  renderCards();
}

function applyStaticI18n() {
  document.title = t("title");
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", t("description"));

  const map = {
    "[data-i18n='skipLink']": "skipLink",
    "[data-i18n='navRoutines']": "navRoutines",
    "[data-i18n='navLibrary']": "navLibrary",
    "[data-i18n='navNotes']": "navNotes",
    "[data-i18n='eyebrow']": "eyebrow",
    "[data-i18n='heroTitle']": "heroTitle",
    "[data-i18n='lede']": "lede",
    "[data-i18n='ctaLibrary']": "ctaLibrary",
    "[data-i18n='ctaRoutines']": "ctaRoutines",
    "[data-i18n='featuredCta']": "featuredCta",
    "[data-i18n='routinesKicker']": "routinesKicker",
    "[data-i18n='routinesTitle']": "routinesTitle",
    "[data-i18n='routinesDesc']": "routinesDesc",
    "[data-i18n='libraryKicker']": "libraryKicker",
    "[data-i18n='libraryTitle']": "libraryTitle",
    "[data-i18n='libraryDesc']": "libraryDesc",
    "[data-i18n='searchLabel']": "searchLabel",
    "[data-i18n='emptyTitle']": "emptyTitle",
    "[data-i18n='emptyHint']": "emptyHint",
    "[data-i18n='emptyReset']": "emptyReset",
    "[data-i18n='notesKicker']": "notesKicker",
    "[data-i18n='notesTitle']": "notesTitle",
    "[data-i18n='note1']": "note1",
    "[data-i18n='note2']": "note2",
    "[data-i18n='note3']": "note3",
    "[data-i18n='note4']": "note4",
    "[data-i18n='note5']": "note5",
    "[data-i18n='footerTag']": "footerTag",
    "[data-i18n='installHint']": "installHint",
    "[data-i18n='installBanner']": "installBanner",
    "[data-i18n='installAccept']": "installAccept",
    "[data-i18n='installDismiss']": "installDismiss",
  };
  Object.entries(map).forEach(([sel, key]) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.textContent = t(key);
    });
  });

  const search = $("#move-search");
  if (search) {
    search.setAttribute("placeholder", t("searchPlaceholder"));
    search.setAttribute("aria-label", t("searchLabel"));
    if (document.activeElement !== search) search.value = searchQuery;
  }

  const footerLoc = $("#footer-locale");
  if (footerLoc) footerLoc.textContent = I18N.locales[locale].label;

  updateInstallBanner();

  document.querySelectorAll(".modal-close, [data-lightbox-close]").forEach((btn) => {
    btn.setAttribute("aria-label", t("close"));
  });
  const fsBtn = $("[data-lightbox-fs]");
  if (fsBtn) fsBtn.setAttribute("aria-label", t("viewFullscreen"));
}

function renderLangSwitch() {
  const root = $("#lang-switch");
  if (!root) return;
  root.setAttribute("aria-label", t("langAria"));
  root.innerHTML = Object.values(I18N.locales)
    .map(
      (loc) => `
      <button type="button" class="lang-btn" data-locale="${loc.code}" aria-pressed="${loc.code === locale}">
        <span class="lang-full">${loc.label}</span>
        <span class="lang-short">${loc.short}</span>
      </button>`
    )
    .join("");
  root.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLocale(btn.dataset.locale));
  });
}

function filteredExercises() {
  const q = searchQuery.trim().toLowerCase();
  return exercises.filter((ex) => {
    if (activeFilter !== "all" && ex.group !== activeFilter) return false;
    if (!q) return true;
    const hay = `${L(ex.name)} ${ex.name.en} ${ex.name.yue} ${ex.name.zh}`.toLowerCase();
    return hay.includes(q);
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
        `<button type="button" class="chip" data-filter="${id}" aria-pressed="${activeFilter === id}">${t(key)}</button>`
    )
    .join("");
  root.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      persistPrefs();
      renderFilterChips();
      renderRoutines();
      renderCards();
    });
  });
}

function renderLevelToggle() {
  const root = $("#level-toggle");
  root.setAttribute("aria-label", t("levelAria"));
  root.innerHTML = `
    <span>${t("levelShow")}</span>
    <button type="button" class="level-btn" data-level="beginner" aria-pressed="${activeLevel === "beginner"}">${t("levelBeginner")}</button>
    <button type="button" class="level-btn" data-level="intermediate" aria-pressed="${activeLevel === "intermediate"}">${t("levelIntermediate")}</button>
    <button type="button" class="level-btn" data-level="advanced" aria-pressed="${activeLevel === "advanced"}">${t("levelAdvanced")}</button>
  `;
  root.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeLevel = btn.dataset.level;
      persistPrefs();
      renderLevelToggle();
      renderCards();
    });
  });
}

function renderRoutines() {
  const root = $("#routine-grid");
  root.innerHTML = routines
    .map((r, i) => {
      const n = String(i + 1).padStart(2, "0");
      const on = activeFilter === r.id;
      return `
      <button type="button" class="routine-row" data-jump="${r.id}" aria-pressed="${on}">
        <span class="routine-index">${n}</span>
        <span class="routine-copy">
          <span class="routine-name">${L(r.name)}</span>
          <span class="routine-focus">${L(r.focus)}</span>
        </span>
        <span class="routine-meta">
          <span><b>${r.count}</b> ${t("moves")}</span>
          <span>${t("about")} <b>${L(r.minutes)}</b></span>
        </span>
      </button>`;
    })
    .join("");

  root.querySelectorAll(".routine-row").forEach((el) => {
    el.addEventListener("click", () => {
      activeFilter = el.dataset.jump;
      persistPrefs();
      renderFilterChips();
      renderRoutines();
      renderCards();
      $("#library").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  });
}

function renderFeatured() {
  const ex = exercises.find((e) => e.id === FEATURED_ID);
  const btn = $("#featured-card");
  if (!ex || !btn) return;
  const title = $("#featured-title");
  const img = $("#featured-img");
  if (title) title.textContent = L(ex.name);
  if (img) {
    img.src = cardImageThumb(ex.image);
    img.alt = `${L(ex.name)} ${t("cardAlt")}`;
  }
  btn.setAttribute("aria-label", `${t("featuredAria")}: ${L(ex.name)}`);
}

function updateLibraryStatus(count) {
  const status = $("#library-status");
  if (status) status.textContent = tf("resultCount", { n: count });
}

function renderCards() {
  const root = $("#card-grid");
  const empty = $("#card-empty");
  const list = filteredExercises();
  updateLibraryStatus(list.length);
  persistPrefs();

  if (empty) empty.hidden = list.length > 0;
  root.hidden = list.length === 0;
  if (list.length === 0) {
    root.innerHTML = "";
    return;
  }

  root.innerHTML = list
    .map((ex, i) => {
      const kgDisplay = formatKg(ex.kg[activeLevel]);
      return `
      <article class="ex-card" data-id="${ex.id}" tabindex="0" style="--i:${Math.min(i, 8)}">
        <div class="ex-media">
          <img src="${cardImageThumb(ex.image)}" alt="${L(ex.name)} ${t("cardAlt")}" loading="lazy" width="640" height="960" />
          <span class="agent-badge-pill">${t("agentBadge")}</span>
          <span class="open-cue">${t("openCue")}</span>
        </div>
        <div class="ex-body">
          <h3>${L(ex.name)}</h3>
          <p class="ex-en">${ex.name.en}</p>
          <div class="stats">
            <div class="stat">
              <label>${t("suggestedWeight")} · ${levelLabel(activeLevel)}</label>
              <b>${kgDisplay}</b>
              <div class="stat-sub">${L(ex.unit)}</div>
            </div>
            <div class="stat">
              <label>${t("estTime")}</label>
              <b>${ex.minutes} ${t("minutesUnit")}</b>
              <div class="stat-sub">${L(ex.setsReps)}</div>
            </div>
          </div>
          <div class="advanced-line"><span>${t("advancedArrow")}</span> ${L(ex.advanced.name)}</div>
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

function setCardHash(id) {
  const next = `#card-${id}`;
  if (location.hash !== next) history.replaceState(null, "", next);
}

function clearCardHash() {
  if (location.hash.startsWith("#card-")) {
    history.replaceState(null, "", "#library");
  }
}

function readCardHash() {
  const m = location.hash.match(/^#card-(.+)$/);
  return m ? m[1] : null;
}

function openModal(id) {
  const ex = exercises.find((e) => e.id === id);
  if (!ex) return;
  lastCardEl = document.querySelector(`.ex-card[data-id="${id}"]`) || document.activeElement;
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
  const stage = window.FORM_LAB_AGENT.mount(host, ex.id);
  bindAgentControls(stage);
  setCardHash(id);
  $("#detail-modal").showModal();
}

function bindModal() {
  $(".modal-close").addEventListener("click", () => $("#detail-modal").close());
  $("#detail-modal").addEventListener("click", (e) => {
    if (e.target.id === "detail-modal") e.target.close();
  });
  $("#detail-modal").addEventListener("close", () => {
    closeLightbox();
    clearCardHash();
    lastCardEl?.focus?.();
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
    } catch (_) {
      /* ignore unsupported / denied */
    }
  });
}

function bindSearch() {
  const input = $("#move-search");
  if (!input) return;
  input.value = searchQuery;
  input.addEventListener("input", () => {
    searchQuery = input.value;
    renderCards();
  });
  $("#empty-reset")?.addEventListener("click", () => {
    searchQuery = "";
    activeFilter = "all";
    persistPrefs();
    if (input) input.value = "";
    renderFilterChips();
    renderRoutines();
    renderCards();
    input?.focus();
  });
}

function bindFeatured() {
  $("#featured-card")?.addEventListener("click", () => openModal(FEATURED_ID));
}

function bindSlashSearch() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
    if ($("#detail-modal")?.open || $("#lightbox")?.open) return;
    e.preventDefault();
    $("#move-search")?.focus();
  });
}

function bindCardArrows() {
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

function bindScrollSpy() {
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

function bindInstall() {
  const bar = $("#install-banner");
  const accept = $("#install-accept");
  const dismiss = $("#install-dismiss");
  if (!bar) return;

  if (isIosSafari()) {
    installMode = "ios";
    updateInstallBanner();
    accept?.addEventListener("click", dismissInstallBanner);
    dismiss?.addEventListener("click", dismissInstallBanner);
    return;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e;
    installMode = "chromium";
    updateInstallBanner();
  });
  accept?.addEventListener("click", async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice.catch(() => {});
    deferredInstall = null;
    bar.hidden = true;
  });
  dismiss?.addEventListener("click", dismissInstallBanner);
  window.addEventListener("appinstalled", () => {
    bar.hidden = true;
    deferredInstall = null;
  });
}

function consumeDeepLink() {
  const id = readCardHash();
  if (id && exercises.some((ex) => ex.id === id)) {
    openModal(id);
  }
}

function registerPWA() {
  if (!("serviceWorker" in navigator)) return;
  let reloadScheduled = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadScheduled) return;
    reloadScheduled = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

locale = detectLocale();
activeLevel = detectLevel();
activeFilter = detectFilter();
searchQuery = detectSearch();
document.documentElement.lang = I18N.locales[locale].htmlLang;
applyStaticI18n();
renderLangSwitch();
renderRoutines();
renderFilterChips();
renderLevelToggle();
renderFeatured();
renderCards();
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
