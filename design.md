# FORM LAB · Design system

Source of truth for visual and interaction decisions. Implement these tokens and rules; do not invent a second palette in components.

## Product

**What it is.** A Cantonese-first PWA of 36 gym *form* cards. Each card is a complete how-to sheet (setup, lowering, pressing, mistakes, sets). The site is a lab around those sheets: pick a routine, pick a load level, open a card, watch the Form Agent loop, fullscreen the sheet.

**Who it is for.** Cantonese-speaking lifters (and bilingual gym friends) checking form on a phone between sets. One-handed, fluorescent light, 20 seconds of attention. Not a coaching SaaS, not a language-learning app, not an idol photocard gallery.

**Memorable thing.** A Hong Kong gym wall 通告 you can tap. Cream paper, chop-red, ink. The cards are the product; the chrome must look like it belongs on the same sheet.

**Personality (three words).** Inked. Street-level. Exacting.

## Visual direction

Match the printed cards, which already have a system: white field, vermillion index and pills, black sans titles, red muscle callouts, a solid red footer bar.

The previous UI was a K-idol pink photocard skin (gradient headlines, mint accents, Cormorant + Outfit). That fights the cards and the PWA icon (dark field, orange **FL**). Kill it.

**Theme.** Light paper, used in gyms. Not dark-mode-for-cool. Neutrals are warm (paper / rubber / ink), tinted toward the vermillion hue.

**Layout.** Hybrid: editorial for the hero, grid-disciplined for the library. Left-aligned. No centered hero, no three equal feature cards, no gradient text.

## Tokens

Use CSS custom properties. Prefer `oklch()` so tints stay even.

### Color

```css
:root {
  --bg: oklch(0.945 0.018 75);          /* paper */
  --bg-elev: oklch(0.985 0.008 75);     /* sheet */
  --ink: oklch(0.22 0.025 50);          /* not #000 */
  --muted: oklch(0.48 0.03 55);
  --line: oklch(0.82 0.035 40);
  --chop: oklch(0.52 0.185 28);         /* vermillion — the one accent */
  --chop-ink: oklch(0.985 0.01 75);     /* text on chop */
  --brass: oklch(0.62 0.12 70);         /* kg / load only */
  --rubber: oklch(0.28 0.02 55);        /* dark rail, lightbox */
  --shadow: 0 12px 28px oklch(0.22 0.03 50 / 0.08);
}
```

60 / 30 / 10: paper + ink + line carry the page. Chop-red is rare (primary button, active chip, index numbers, focus ring). Brass is only for suggested kg. Do not introduce mint, pink, purple, or a second accent.

Semantic:

| Role | Token | Use |
|------|--------|-----|
| Danger / 忌做 | `--chop` | mistakes, required emphasis |
| Load / kg | `--brass` | numbers in stats |
| Success | none | a press + copy is enough; no green toast |
| Overlay | `--rubber` at ~0.92 | lightbox |

### Typography

Brand words: inked, street-level, exacting.

Rejected reflexes: Inter, Outfit, Cormorant Garamond, Space Grotesk, Instrument Serif, Fraunces, Playfair.

| Role | Face | Why |
|------|------|-----|
| Wordmark / Latin display | **Arial Narrow / Avenir Next Condensed** 800 | Local condensed faces keep the gym scoreboard character without a blocking web-font request. |
| UI + Chinese | **System HK sans stack** 400–700 | `PingFang HK` first on Apple platforms, then locally installed `Noto Sans HK` / `Microsoft JhengHei`. |
| Simplified fallback | **System CJK sans** | The platform supplies simplified glyphs for the `zh` locale. |
| kg / times / indexes | **SFMono / Menlo / Consolas** 500–600 | Local tabular mono faces avoid a separate font payload. |

Production does not request Google Fonts. This prevents the large Traditional and Simplified Chinese subset fan-out on a cold mobile load.

Scale (product UI, fixed rem — not fluid marketing type except the hero title):

| Token | Size | Weight | Line | Use |
|-------|------|--------|------|-----|
| `--type-hero` | clamp(2.4rem, 6vw, 3.6rem) | 800 display / 700 HK | 1.05 | Page title (Chinese) |
| `--type-display` | 1.35rem | 700 | 1.2 | Section heads |
| `--type-card` | 1.05rem | 650 | 1.25 | Card titles |
| `--type-body` | 1rem | 400 | 1.55 | Lede, notes |
| `--type-ui` | 0.875rem | 500 | 1.3 | Nav, chips, buttons |
| `--type-meta` | 0.75rem | 500 | 1.3 | Labels, kg captions |

Body line length ≤ 65ch. All-caps only for 4–12 letter Latin labels (wordmark, `LAB`, `KG`). Never all-caps Chinese.

### Spacing

4pt scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.

```css
--space-2xs: 4px;
--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

Page gutter: `clamp(16px, 5vw, 72px)`. Section gap: 64–96px. Sibling gap inside a component: 8–12px. Do not pad every box the same.

### Radius

The cards themselves use modest rounding. Mirror that.

- Controls (chip, button, input): `--radius-ctl: 8px`
- Sheets / modal: `--radius-sheet: 12px`
- Never 20–28px “app card” blobs

### Elevation

One tinted shadow. Hover may deepen it slightly. No neon glow, no stacked glass.

### Motion

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1); /* expo-ish */
--dur-press: 120ms;
--dur-ui: 220ms;
--dur-enter: 380ms;
```

Animate **transform** and **opacity** only. No bounce, no elastic.

`prefers-reduced-motion: reduce` — kill decorative drift; keep Form Agent available but start **paused**; `scroll-behavior: auto`.

## Components

### Buttons

- **Primary.** Solid `--chop`, text `--chop-ink`. Hover: 4% darker via `color-mix`. Active: `scale(0.98)`. No gradient fill.
- **Ghost.** Transparent, 1px `--line`, ink text. Hover: paper-elev background.
- Height ≥ 44px. Padding 12×16. Font `--type-ui`.
- Focus-visible: 2px `--chop` ring, 3px offset.

### Inputs / search

Label above or visually-hidden with `for`. Helper optional. Error below (this app has no account forms; search is the only field). Search is `type="search"`, submit not required — filter as you type.

### Chips / segmented controls

Filter chips and load-level are the same control family: 1px line, paper fill, muted text. **Active** uses `aria-pressed="true"`, chop outline, chop-tint fill, ink text. Hover is a line darkening, not a jump to primary.

Language switch is the same family, compact.

### Cards (exercise)

The photograph *is* the card. Chrome around it is a thin sheet: 1px line, 12px radius, no holographic overlay, no gradient foil.

- Hover (pointer only): translateY(−3px), shadow deepens, “撳開” cue fades in.
- Active: scale(0.99).
- Focus-visible: chop ring on the sheet.
- Agent badge: small chop pill, bottom-left of the photo. Not orange, not emoji.

Do not put a second card inside the card (no nested stat boxes with extra radius). Stats sit as a two-column definition list under the title.

### Routine board

Not a grid of identical cards. A **timetable / 通告 board**: numbered rows (01–06), name, focus, move count, minutes. The whole row is the hit target. Hover: chop index + translateX(2px). Keyboard: Enter / Space.

### Navigation

Logo top-left (`FORM LAB` in Big Shoulders). Three section links. Language on the right.

- Persistent on every width. **Do not `display: none` the nav on mobile.** Wrap it.
- Current section: ink + a 1px chop underline (scroll spy).
- Skip link as the first focusable control.

### Feedback

- Filter result count in a live region (`polite`).
- Empty search: a short 通告, not a blank grid. Action: clear search / reset filter.
- Modal: native `<dialog>.showModal()`. Close on ×, backdrop click, Escape. Restore focus to the card that opened it.
- Lightbox: rubber field, white sheet, Esc / backdrop / ×. Fullscreen toggle is a labeled button, not a unicode glyph.
- Form Agent: play/pause is an SVG icon with `aria-pressed` and an accessible name. Gender is 男 / 女 (or locale), not ♂ ♀.
- PWA: if `beforeinstallprompt` fires, show a real install bar. iOS keeps the Home Screen hint.

## Interaction principles

1. **Every control has default / hover / focus-visible / active.** Keyboard users never see hover; the ring is mandatory.
2. **Press is physical.** `scale(0.98)` on buttons, `scale(0.99)` on sheets. 120ms.
3. **Filters are instant.** No spinner for 36 items. Stagger new cards 40ms × index, cap at 8.
4. **State is rememberable.** Locale and load level in `localStorage`. Filter + search in the session. Open card in the hash (`#card-chest-01`) so back/share works.
5. **Slash focuses search** when the target is not an input.
6. **Arrow keys** move among visible library cards (left/right, wrapping).
7. **One-handed gym use.** 44px targets. Sticky library toolbar under the header so chips do not scroll away.
8. **Agent is the motion that matters.** Decorative background drift is optional and must yield to reduced motion. The sprite loop is instructional — do not auto-disable it; start paused under reduced motion.

## Page specs

Single page, three sections plus modal/lightbox. `min-height: 100dvh` on `body`, never `height: 100vh` for the hero.

### Hero

Asymmetric: copy left, featured step card right (real `<img>`, not a CSS background). No 88vh dead field — height is content + padding (`clamp(24px, 5vh, 48px)` vertical).

- Eyebrow: chop, `--type-ui`, tracking on Latin only.
- Wordmark: `FORM LAB`.
- `h1`: Cantonese-first title from i18n, not a gradient English logo.
- Two CTAs: primary → library, ghost → routines.
- Featured card is a button; activates `openModal('chest-01')`.
- Mobile: card first (order −1), then copy. Full width.

### Routines

Section title + one-line description. Then the 通告 board (one column, max 720px on desktop so it does not stretch into a sparse table). Clicking a row sets the library filter, updates chips, scrolls to `#library`.

### Library

Sticky toolbar (`top: header-height`): search, filter chips, load-level segmented control, live count.

Grid: `repeat(auto-fill, minmax(min(100%, 260px), 1fr))`, gap 16–24. Click / Enter opens the modal.

Empty: title + hint + “show all” button.

### Modal

Two columns on `≥900px`: sheet | copy + agent + kg table + advanced. One column on small, sheet capped at ~45vh, copy scrolls.

Kg table is a real `<table>`. Advanced is a paper inset with brass label — not a mint box, not a left stripe.

### Notes

Numbered 通告 (01–05), not a muted bullet list. Max width 65ch.

### Footer

Wordmark + tagline + current locale name. Quiet top line.

## Do

- Let the step cards’ vermillion lead. Chrome is paper and ink.
- Cantonese first: default `yue`, HK glyphs, titles in Chinese.
- Keep Form Agent, lightbox, language switch, level toggle, routine→filter jump.
- Use native `dialog`, sticky toolbar, skip link, `aria-pressed`, live count.
- Tint neutrals toward hue 28–75. Keep saturation of `--chop` under 0.2 chroma.

## Don’t

- Gradient text, gradient CTA, pink blobs, mint “advanced”, purple anything.
- Cormorant, Outfit, Inter, Space Grotesk, system-ui as the display face.
- Hide nav on mobile. Hide chips on mobile. Amputate the agent on mobile.
- Emoji as UI (play, gender, fullscreen, close). Use SVG or text.
- `outline: none` without `:focus-visible`.
- Three equal routine cards with icon + heading + paragraph.
- Side-stripe (`border-left > 1px`) callouts.
- Decorative glassmorphism, holographic foil on exercise cards.
- `h-screen` heroes and 88vh empty stages.
- Generic “Elevate / Seamless / Unleash” copy. Speak like a gym 通告.

## Repo structure

Keep each source file under **~600 lines** so modules stay readable without a bundler.

| Area | Path | Role |
|------|------|------|
| Entry | `js/main.js` | boot |
| UI | `js/locale-ui.js`, `js/render-library.js`, `js/modal.js`, `js/bindings.js` | screens + interaction |
| Shared | `js/state.js`, `js/i18n-helpers.js`, `js/helpers.js` | state + helpers |
| Data | `data/routines.js`, `data/exercises/*.js` | one file per muscle group |
| Styles | `css/*.css` | tokens → layout → components → agent |
| Agent | `agent.js` | sprite player |

When a file approaches 600 lines, split by responsibility—not by arbitrary line count.
