/** Form Agent — consistent human sprite sheets + per-action timing/frames */
window.FORM_LAB_AGENT = {
  _timer: null,
  /** "m" | "f" — persisted in localStorage */
  gender: (() => {
    try {
      const g = localStorage.getItem("form-lab-agent-gender");
      return g === "f" ? "f" : "m";
    } catch {
      return "m";
    }
  })(),

  setGender(next) {
    this.gender = next === "f" ? "f" : "m";
    try {
      localStorage.setItem("form-lab-agent-gender", this.gender);
    } catch {
      /* ignore */
    }
  },

  /** Female sheets under public/sprites/f/ (full 32-preset set) */
  femalePresets: {
    idle: true,
    "curl-both": true,
    "curl-alt": true,
    "curl-seated": true,
    kickback: true,
    dip: true,
    "oh-ext": true,
    "press-flat": true,
    "press-incline": true,
    "press-decline": true,
    "press-floor": true,
    "press-squeeze": true,
    "press-shoulder": true,
    fly: true,
    pullover: true,
    "row-wide": true,
    "row-bent": true,
    "row-one": true,
    "row-close": true,
    "row-incline": true,
    "row-squeeze": true,
    "row-seated": true,
    "leg-press": true,
    "leg-ext": true,
    squat: true,
    "split-squat": true,
    pulldown: true,
    pullup: true,
    rdl: true,
    bridge: true,
    "rev-fly": true,
    "dead-bug": true,
  },

  presetById: {
    "arms-01": "curl-both",
    "arms-02": "curl-alt",
    "arms-03": "curl-seated",
    "arms-04": "kickback",
    "arms-05": "dip",
    "arms-06": "oh-ext",
    "chest-01": "press-flat",
    "chest-02": "press-incline",
    "chest-03": "press-decline",
    "chest-04": "press-floor",
    "chest-05": "press-squeeze",
    "chest-06": "pullover",
    "back-01": "row-wide",
    "back-02": "row-bent",
    "back-03": "row-one",
    "back-04": "row-close",
    "back-05": "row-incline",
    "back-06": "row-squeeze",
    "thighs-01": "leg-press",
    "thighs-02": "leg-ext",
    "thighs-03": "squat",
    "thighs-04": "squat",
    "thighs-05": "squat",
    "thighs-06": "split-squat",
    "back-gold-01": "pulldown",
    "back-gold-02": "row-seated",
    "back-gold-03": "pullup",
    "back-gold-04": "row-bent",
    "back-gold-05": "pullup",
    "back-gold-06": "row-bent",
    "home-01": "rdl",
    "home-02": "bridge",
    "home-03": "press-shoulder",
    "home-04": "fly",
    "home-05": "rev-fly",
    "home-06": "dead-bug",
  },

  /** seconds = one loop; frames = key poses on that sheet */
  motionByPreset: {
    idle: { seconds: 2.2, frames: 4, note: "idle" },
    "curl-both": { seconds: 1.8, frames: 6, note: "controlled curl" },
    "curl-alt": { seconds: 2.8, frames: 8, note: "left then right" },
    "curl-seated": { seconds: 2.0, frames: 6, note: "seated curl" },
    kickback: { seconds: 1.9, frames: 6, note: "triceps kickback" },
    dip: { seconds: 2.2, frames: 8, note: "bench dip" },
    "oh-ext": { seconds: 2.1, frames: 6, note: "overhead extension" },
    "press-flat": { seconds: 2.4, frames: 8, note: "flat press" },
    "press-incline": { seconds: 2.4, frames: 8, note: "incline press" },
    "press-decline": { seconds: 2.4, frames: 8, note: "decline press" },
    "press-floor": { seconds: 2.2, frames: 6, note: "floor press" },
    "press-squeeze": { seconds: 2.5, frames: 8, note: "squeeze press" },
    "press-shoulder": { seconds: 2.2, frames: 6, note: "shoulder press" },
    fly: { seconds: 2.8, frames: 8, note: "chest fly" },
    pullover: { seconds: 3.0, frames: 8, note: "pullover arc" },
    "row-wide": { seconds: 2.0, frames: 6, note: "wide row" },
    "row-bent": { seconds: 2.2, frames: 8, note: "bent-over row" },
    "row-one": { seconds: 2.0, frames: 6, note: "one-arm row" },
    "row-close": { seconds: 2.0, frames: 6, note: "close row" },
    "row-incline": { seconds: 2.0, frames: 6, note: "incline row" },
    "row-squeeze": { seconds: 2.4, frames: 8, note: "squeeze row" },
    "row-seated": { seconds: 2.1, frames: 6, note: "seated row" },
    "leg-press": { seconds: 2.6, frames: 8, note: "leg press" },
    "leg-ext": { seconds: 1.9, frames: 6, note: "leg extension" },
    squat: { seconds: 2.8, frames: 8, note: "squat" },
    "split-squat": { seconds: 3.0, frames: 8, note: "bulgarian split squat" },
    pulldown: { seconds: 2.5, frames: 8, note: "lat pulldown" },
    pullup: { seconds: 3.0, frames: 8, note: "pull-up" },
    rdl: { seconds: 3.2, frames: 8, note: "RDL hinge" },
    bridge: { seconds: 2.2, frames: 6, note: "glute bridge" },
    "rev-fly": { seconds: 2.2, frames: 6, note: "reverse fly" },
    "dead-bug": { seconds: 3.4, frames: 8, note: "dead bug" },
  },

  /** if a dedicated sheet is missing, reuse closest */
  sheetAlias: {
    // filled only when needed at runtime
  },

  getMotion(preset) {
    return this.motionByPreset[preset] || this.motionByPreset.idle;
  },

  sheetFor(preset) {
    const key = this.sheetAlias[preset] || preset;
    if (this.gender === "f" && this.femalePresets[key]) {
      return `./public/sprites/f/sheet-${key}.png`;
    }
    return `./public/sprites/sheet-${key}.png`;
  },

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  svgMarkup() {
    return `<svg class="agent-svg" viewBox="0 0 200 260" aria-hidden="true">
      <ellipse cx="100" cy="242" rx="58" ry="8" fill="rgba(232,93,4,0.22)"/>
      <g class="agent-root">
        <circle cx="100" cy="62" r="20" fill="#c4a574"/>
        <line x1="100" y1="82" x2="100" y2="150" stroke="#6b6560" stroke-width="14" stroke-linecap="round"/>
        <line x1="100" y1="95" x2="70" y2="140" stroke="#6b6560" stroke-width="10" stroke-linecap="round"/>
        <line x1="100" y1="95" x2="130" y2="140" stroke="#6b6560" stroke-width="10" stroke-linecap="round"/>
        <line x1="100" y1="150" x2="82" y2="220" stroke="#1c1a17" stroke-width="12" stroke-linecap="round"/>
        <line x1="100" y1="150" x2="118" y2="220" stroke="#1c1a17" stroke-width="12" stroke-linecap="round"/>
      </g>
    </svg>`;
  },

  mount(container, exerciseId) {
    this.stop();
    const preset = this.presetById[exerciseId] || "idle";
    const motion = this.getMotion(preset);
    const frames = motion.frames;
    const seconds = motion.seconds;
    const frameMs = Math.max(50, Math.round((seconds * 1000) / frames));

    container.innerHTML = `
      <div class="agent-stage" data-preset="${preset}" data-mode="loading" data-gender="${this.gender}"
           style="--agent-cycle:${seconds}s;--agent-frames:${frames};">
        <div class="agent-stage-head">
          <div>
            <div class="agent-title" data-agent-title></div>
            <div class="agent-sub" data-agent-sub></div>
          </div>
          <div class="agent-head-actions">
            <div class="agent-gender" role="group" data-agent-gender>
              <button type="button" class="agent-gender-btn" data-gender="m" aria-pressed="${this.gender === "m"}">♂</button>
              <button type="button" class="agent-gender-btn" data-gender="f" aria-pressed="${this.gender === "f"}">♀</button>
            </div>
            <button type="button" class="agent-play" data-agent-toggle aria-pressed="true">⏸</button>
          </div>
        </div>
        <div class="agent-meta" data-agent-meta></div>
        <div class="agent-viewport playing" data-agent-view>
          <div class="sprite-clip" data-sprite-clip hidden>
            <img class="sprite-strip" data-sprite-strip alt="" draggable="false" />
          </div>
          <div class="agent-svg-wrap" data-svg-fallback>${this.svgMarkup()}</div>
        </div>
        <div class="agent-caption" data-agent-caption></div>
      </div>`;

    const stage = container.querySelector(".agent-stage");
    stage._motion = motion;
    stage._preset = preset;
    stage._exerciseId = exerciseId;

    const clip = stage.querySelector("[data-sprite-clip]");
    const strip = stage.querySelector("[data-sprite-strip]");
    const svgWrap = stage.querySelector("[data-svg-fallback]");
    const view = stage.querySelector("[data-agent-view]");

    let frame = 0;
    let playing = true;
    let cellPx = 0;

    const measure = () => {
      cellPx = clip.clientWidth || 0;
      if (!cellPx) return false;
      strip.style.width = `${frames * cellPx}px`;
      strip.style.height = `${cellPx}px`;
      return true;
    };

    const paint = () => {
      if (!measure()) return;
      strip.style.transform = `translateX(-${frame * cellPx}px)`;
    };

    const tick = () => {
      if (!playing) return;
      frame = (frame + 1) % frames;
      paint();
    };

    const startTimer = () => {
      this.stop();
      this._timer = setInterval(tick, frameMs);
    };

    const showSheet = () => {
      clip.hidden = false;
      svgWrap.hidden = true;
      stage.dataset.mode = "sheet";
      frame = 0;
      // layout after unhide
      requestAnimationFrame(() => {
        paint();
        if (playing) startTimer();
      });
    };

    const loadSheet = () => {
      this.stop();
      stage.dataset.mode = "loading";
      stage.dataset.gender = this.gender;
      clip.hidden = true;
      svgWrap.hidden = false;
      delete strip.dataset.fellBack;
      frame = 0;

      const url = this.sheetFor(preset);
      strip.onload = () => showSheet();
      strip.onerror = () => {
        const key = this.sheetAlias[preset] || preset;
        const malePath = `./public/sprites/sheet-${key}.png`;
        if (this.gender === "f" && !strip.dataset.fellBack) {
          strip.dataset.fellBack = "1";
          strip.src = malePath;
          return;
        }
        clip.hidden = true;
        svgWrap.hidden = false;
        stage.dataset.mode = "svg";
        this.stop();
      };
      // bust cache-stuck onload when re-selecting same src
      if (strip.getAttribute("src") === url) {
        strip.removeAttribute("src");
      }
      strip.src = url;
      if (strip.complete && strip.naturalWidth > 0) {
        showSheet();
      }
    };

    stage.querySelectorAll("[data-gender]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.getAttribute("data-gender");
        if (next === this.gender) return;
        this.setGender(next);
        stage.querySelectorAll("[data-gender]").forEach((b) => {
          b.setAttribute("aria-pressed", b.getAttribute("data-gender") === this.gender ? "true" : "false");
        });
        loadSheet();
      });
    });

    loadSheet();

    stage._agentApi = {
      isPlaying: () => playing,
      setPlaying: (next) => {
        playing = !!next;
        view.classList.toggle("playing", playing);
        if (playing && stage.dataset.mode === "sheet") startTimer();
        else this.stop();
      },
    };

    return stage;
  },
};
