import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { exercises, routines } from "../data/index.js";
import { FORM_LAB_AGENT } from "../agent.js";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const LOCALES = ["yue", "zh", "en"];
const GROUPS = ["arms", "chest", "back", "thighs", "back-gold", "home"];

function assertLocalized(value, label) {
  for (const locale of LOCALES) {
    assert.equal(typeof value?.[locale], "string", `${label}.${locale} must be a string`);
    assert.ok(value[locale].trim(), `${label}.${locale} must not be empty`);
  }
}

function collectEnglish(value, path = "root", output = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectEnglish(item, `${path}[${index}]`, output));
    return output;
  }
  if (!value || typeof value !== "object") return output;
  if (typeof value.en === "string") output.push([`${path}.en`, value.en]);
  for (const [key, child] of Object.entries(value)) {
    if (key !== "en") collectEnglish(child, `${path}.${key}`, output);
  }
  return output;
}

function readWebpDimensions(file) {
  const buffer = readFileSync(file);
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF", `${file} is not RIFF`);
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP", `${file} is not WebP`);

  for (let offset = 12; offset + 8 <= buffer.length; ) {
    const tag = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (tag === "VP8X") {
      return {
        width: buffer.readUIntLE(data + 4, 3) + 1,
        height: buffer.readUIntLE(data + 7, 3) + 1,
      };
    }
    if (tag === "VP8 ") {
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
      };
    }
    if (tag === "VP8L") {
      const bits = buffer.readUInt32LE(data + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    offset = data + size + (size % 2);
  }
  throw new Error(`No WebP image chunk found in ${file}`);
}

test("exercise and routine inventory is complete", () => {
  assert.equal(exercises.length, 36);
  assert.equal(routines.length, 6);
  assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 36);
  for (const group of GROUPS) {
    assert.equal(exercises.filter((exercise) => exercise.group === group).length, 6, group);
  }
});

test("exercise copy has all three locales and English contains no Han characters", () => {
  for (const exercise of exercises) {
    assertLocalized(exercise.name, `${exercise.id}.name`);
    assertLocalized(exercise.unit, `${exercise.id}.unit`);
    assertLocalized(exercise.setsReps, `${exercise.id}.setsReps`);
    assertLocalized(exercise.advanced.name, `${exercise.id}.advanced.name`);
    assertLocalized(exercise.advanced.note, `${exercise.id}.advanced.note`);
  }

  const englishValues = collectEnglish(exercises);
  const contaminated = englishValues.filter(([, value]) => /[\u3400-\u9fff]/u.test(value));
  assert.deepEqual(contaminated, []);
  assert.doesNotMatch(JSON.stringify(exercises), /[–—]/u);
});

test("every exercise has a full card, thumbnail, motion preset, and both sprite genders", () => {
  for (const exercise of exercises) {
    const fullCard = join(ROOT, "public", "cards", exercise.image);
    const thumbnail = join(ROOT, "public", "cards", "thumbs", exercise.image);
    assert.ok(existsSync(fullCard), `${exercise.id} full card is missing`);
    assert.ok(existsSync(thumbnail), `${exercise.id} thumbnail is missing`);
    assert.deepEqual(readWebpDimensions(fullCard), { width: 1024, height: 1536 }, fullCard);
    assert.deepEqual(readWebpDimensions(thumbnail), { width: 640, height: 960 }, thumbnail);

    const preset = FORM_LAB_AGENT.presetById[exercise.id];
    assert.ok(preset, `${exercise.id} has no motion preset`);
    assert.ok(FORM_LAB_AGENT.motionByPreset[preset], `${preset} has no motion metadata`);
    assert.ok(existsSync(join(ROOT, "public", "sprites", `sheet-${preset}.webp`)), `${preset} male sheet is missing`);
    assert.ok(existsSync(join(ROOT, "public", "sprites", "f", `sheet-${preset}.webp`)), `${preset} female sheet is missing`);
  }
});

test("sprite sheet dimensions match frame metadata", () => {
  for (const preset of Object.keys(FORM_LAB_AGENT.femalePresets)) {
    const frames = FORM_LAB_AGENT.motionByPreset[preset].frames;
    for (const genderPath of [[], ["f"]]) {
      const file = join(ROOT, "public", "sprites", ...genderPath, `sheet-${preset}.webp`);
      const dimensions = readWebpDimensions(file);
      assert.deepEqual(dimensions, { width: frames * 512, height: 512 }, file);
    }
  }
});
