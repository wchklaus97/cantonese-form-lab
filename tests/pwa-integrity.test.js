import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { exercises } from "../data/index.js";
import { FORM_LAB_I18N } from "../i18n.js";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const sw = readFileSync(`${ROOT}sw.js`, "utf8");
const index = readFileSync(`${ROOT}index.html`, "utf8");
const cachedPaths = new Set([...sw.matchAll(/"(\.\/[^"\n]+)"/g)].map((match) => match[1]));

test("service worker precaches every imported exercise module", () => {
  for (const module of ["arms", "chest", "back", "thighs", "back-gold", "home"]) {
    assert.ok(cachedPaths.has(`./data/exercises/${module}.js`), `${module}.js is not precached`);
  }
});

test("service worker precaches every library thumbnail", () => {
  for (const exercise of exercises) {
    assert.ok(
      cachedPaths.has(`./public/cards/thumbs/${exercise.image}`),
      `${exercise.id} thumbnail is not precached`
    );
  }
});

test("cold start has no external font dependency and prioritizes the hero image", () => {
  assert.doesNotMatch(index, /fonts\.(googleapis|gstatic)\.com/);
  assert.match(index, /rel="preload" as="image"[^>]+fetchpriority="high"/);
  assert.match(index, /id="featured-img"[^>]+fetchpriority="high"/);
});

test("every static data-i18n key exists in all locales", () => {
  const keys = [...index.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]);
  for (const key of keys) {
    for (const locale of Object.keys(FORM_LAB_I18N.locales)) {
      assert.equal(typeof FORM_LAB_I18N.strings[locale][key], "string", `${locale}.${key}`);
    }
  }
});
