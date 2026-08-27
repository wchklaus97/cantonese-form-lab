import { routines, exercises } from "../data/index.js";
import { FEATURED_ID } from "./constants.js";
import { appState } from "./state.js";
import { $ } from "./dom.js";
import {
  cardImageThumb,
  prefersReducedMotion,
} from "./helpers.js";
import {
  t,
  tf,
  L,
  levelLabel,
  formatKg,
  persistPrefs,
} from "./i18n-helpers.js";
import { openModal } from "./modal.js";

export function filteredExercises() {
  const q = appState.searchQuery.trim().toLowerCase();
  return exercises.filter((ex) => {
    if (appState.activeFilter !== "all" && ex.group !== appState.activeFilter) return false;
    if (!q) return true;
    const hay = `${L(ex.name)} ${ex.name.en} ${ex.name.yue} ${ex.name.zh}`.toLowerCase();
    return hay.includes(q);
  });
}

export function renderFilterChips() {
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
        `<button type="button" class="chip" data-filter="${id}" aria-pressed="${appState.activeFilter === id}">${t(key)}</button>`
    )
    .join("");
  root.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      appState.activeFilter = btn.dataset.filter;
      persistPrefs();
      renderFilterChips();
      renderRoutines();
      renderCards();
    });
  });
}

export function renderLevelToggle() {
  const root = $("#level-toggle");
  root.setAttribute("aria-label", t("levelAria"));
  root.innerHTML = `
    <span>${t("levelShow")}</span>
    <button type="button" class="level-btn" data-level="beginner" aria-pressed="${appState.activeLevel === "beginner"}">${t("levelBeginner")}</button>
    <button type="button" class="level-btn" data-level="intermediate" aria-pressed="${appState.activeLevel === "intermediate"}">${t("levelIntermediate")}</button>
    <button type="button" class="level-btn" data-level="advanced" aria-pressed="${appState.activeLevel === "advanced"}">${t("levelAdvanced")}</button>
  `;
  root.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      appState.activeLevel = btn.dataset.level;
      persistPrefs();
      renderLevelToggle();
      renderCards();
    });
  });
}

export function renderRoutines() {
  const root = $("#routine-grid");
  root.innerHTML = routines
    .map((r, i) => {
      const n = String(i + 1).padStart(2, "0");
      const on = appState.activeFilter === r.id;
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
      appState.activeFilter = el.dataset.jump;
      persistPrefs();
      renderFilterChips();
      renderRoutines();
      renderCards();
      $("#library").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  });
}

export function renderFeatured() {
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

export function renderCards() {
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
      const kgDisplay = formatKg(ex.kg[appState.activeLevel]);
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
              <label>${t("suggestedWeight")} · ${levelLabel(appState.activeLevel)}</label>
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
