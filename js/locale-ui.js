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
