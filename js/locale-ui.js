import { FORM_LAB_I18N } from "../i18n.js";
import { appState } from "./state.js";
import { $ } from "./dom.js";
import {
  t,
  persistPrefs,
  detectLocale,
  detectLevel,
  detectFilter,
  detectSearch,
} from "./i18n-helpers.js";
import { updateInstallBanner } from "./install.js";
import {
  renderRoutines,
  renderFilterChips,
  renderLevelToggle,
  renderFeatured,
  renderCards,
} from "./render-library.js";

export function applyStaticI18n() {
  document.title = t("title");
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", t("description"));

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  const search = $("#move-search");
  if (search) {
    search.setAttribute("placeholder", t("searchPlaceholder"));
    search.setAttribute("aria-label", t("searchLabel"));
    if (document.activeElement !== search) search.value = appState.searchQuery;
  }

  const footerLoc = $("#footer-locale");
  if (footerLoc) footerLoc.textContent = FORM_LAB_I18N.locales[appState.locale].label;

  updateInstallBanner();

  document.querySelectorAll(".modal-close, [data-lightbox-close]").forEach((btn) => {
    btn.setAttribute("aria-label", t("close"));
  });
  const fsBtn = $("[data-lightbox-fs]");
  if (fsBtn) fsBtn.setAttribute("aria-label", t("viewFullscreen"));
}

export function renderLangSwitch() {
  const root = $("#lang-switch");
  if (!root) return;
  root.setAttribute("aria-label", t("langAria"));
  root.innerHTML = Object.values(FORM_LAB_I18N.locales)
    .map(
      (loc) => `
      <button type="button" class="lang-btn" data-locale="${loc.code}" aria-pressed="${loc.code === appState.locale}">
        <span class="lang-full">${loc.label}</span>
        <span class="lang-short">${loc.short}</span>
      </button>`
    )
    .join("");
  root.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLocale(btn.dataset.locale));
  });
}

export function setLocale(next) {
  if (!FORM_LAB_I18N.locales[next]) return;
  appState.locale = next;
  persistPrefs();
  document.documentElement.lang = FORM_LAB_I18N.locales[appState.locale].htmlLang;
  applyStaticI18n();
  renderLangSwitch();
  renderRoutines();
  renderFilterChips();
  renderLevelToggle();
  renderFeatured();
  renderCards();
}

export function initLocale() {
  appState.locale = detectLocale();
  appState.activeLevel = detectLevel();
  appState.activeFilter = detectFilter();
  appState.searchQuery = detectSearch();
  document.documentElement.lang = FORM_LAB_I18N.locales[appState.locale].htmlLang;
  applyStaticI18n();
}
