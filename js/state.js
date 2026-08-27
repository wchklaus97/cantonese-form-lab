import { FORM_LAB_I18N } from "../i18n.js";

export const appState = {
  activeFilter: "all",
  activeLevel: "beginner",
  searchQuery: "",
  locale: FORM_LAB_I18N.defaultLocale,
  lastCardEl: null,
  deferredInstall: null,
  installMode: null,
};
