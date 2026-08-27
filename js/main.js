import { initLocale, renderLangSwitch } from "./locale-ui.js";
import {
  renderRoutines,
  renderFilterChips,
  renderLevelToggle,
  renderFeatured,
  renderCards,
} from "./render-library.js";
import { bindAll } from "./bindings.js";

initLocale();
renderLangSwitch();
renderRoutines();
renderFilterChips();
renderLevelToggle();
renderFeatured();
renderCards();
bindAll();
