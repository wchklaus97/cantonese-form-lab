# Form Lab sprite pipeline (generate2dsprite)

Workflow used for Form Agent demo sheets:

1. **Reference lock** — `public/sprites/agent-human-ref.png`
2. **Layout guides** — `guides/2x2|2x3|2x4-layout-guide.png`
3. **Generate** raw multi-row grids with solid magenta `#FF00FF` via Cursor `GenerateImage` (not 1×N strips)
4. **Process** with `~/.codex/skills/generate2dsprite/scripts/generate2dsprite.py process`
   - `--align feet --shared-scale --component-mode largest`
5. **Assemble** horizontal runtime strips with `assemble_strip.py` → `public/sprites/sheet-<preset>.png`

Helpers:

- `process_one.sh <name> <rows> <cols> [raw.png]`
- `assemble_strip.py --frames-dir ... --glob 'idle-*.png' --output ... --cell-size 384`

Grid map: 4f→2×2, 6f→2×3, 8f→2×4.
