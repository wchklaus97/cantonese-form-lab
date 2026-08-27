import { FORM_LAB_I18N } from "../i18n.js";
import { routines } from "../data/index.js";
import {
  STORAGE_KEY,
  LEVEL_KEY,
  FILTER_KEY,
  SEARCH_KEY,
} from "./constants.js";
import { appState } from "./state.js";

export function t(key) {
  return FORM_LAB_I18N.strings[appState.locale][key] || FORM_LAB_I18N.strings.yue[key] || key;
}

export function tf(key, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    t(key)
  );
}

export function L(obj) {
  if (!obj || typeof obj !== "object") return obj;
  return obj[appState.locale] ?? obj.yue ?? obj.en ?? "";
}

export function levelLabel(level) {
  if (level === "beginner") return t("levelBeginner");
  if (level === "intermediate") return t("levelIntermediate");
  return t("levelAdvanced");
}

export function formatKg(raw) {
  const s = L(raw);
  if (/[0-9]/.test(s) && !/Bodyweight|徒手|辅助|輔助|band|Band|pause|停顿|停頓|Hold|手持/i.test(s)) {
    return /kg/i.test(s) ? s : `${s} kg`;
  }
  return s;
}

export function persistPrefs() {
  try {
    localStorage.setItem(STORAGE_KEY, appState.locale);
    localStorage.setItem(LEVEL_KEY, appState.activeLevel);
    sessionStorage.setItem(FILTER_KEY, appState.activeFilter);
    sessionStorage.setItem(SEARCH_KEY, appState.searchQuery);
  } catch {
    /* private mode */
  }
}

export function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && FORM_LAB_I18N.locales[saved]) return saved;
  return FORM_LAB_I18N.defaultLocale;
}

export function detectLevel() {
  const saved = localStorage.getItem(LEVEL_KEY);
  if (saved === "beginner" || saved === "intermediate" || saved === "advanced") return saved;
  return "beginner";
}

export function detectFilter() {
  try {
    const saved = sessionStorage.getItem(FILTER_KEY);
    if (saved && (saved === "all" || routines.some((r) => r.id === saved))) return saved;
  } catch {
    /* ignore */
  }
  return "all";
}

export function detectSearch() {
  try {
    return sessionStorage.getItem(SEARCH_KEY) || "";
  } catch {
    return "";
  }
}
