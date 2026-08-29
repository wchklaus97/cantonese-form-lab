#!/usr/bin/env bash
# Process one raw sheet and assemble a runtime strip.
set -euo pipefail
ROOT="/Users/klaus_mac/Projects/01-Active/cantonese-form-lab"
ASSETS="/Users/klaus_mac/.cursor/projects/Users-klaus-mac-Projects-01-Active-cantonese-form-lab/assets"
SCRIPT="/Users/klaus_mac/.codex/skills/generate2dsprite/scripts/generate2dsprite.py"
ASSEMBLE="$ROOT/sprite-pipeline/assemble_strip.py"
RAW="$ROOT/sprite-pipeline/raw"
PROC="$ROOT/sprite-pipeline/processed"
OUT="$ROOT/public/sprites"

name="$1"
rows="$2"
cols="$3"
raw_src="${4:-}"

if [[ -n "$raw_src" ]]; then
  cp "$raw_src" "$RAW/$name.png"
elif [[ -f "$ASSETS/raw-$name-${rows}x${cols}.png" ]]; then
  cp "$ASSETS/raw-$name-${rows}x${cols}.png" "$RAW/$name.png"
else
  echo "Missing raw for $name" >&2
  exit 1
fi

outdir="$PROC/$name"
rm -rf "$outdir"
mkdir -p "$outdir"
python3 "$SCRIPT" process \
  --input "$RAW/$name.png" \
  --target asset \
  --mode idle \
  --output-dir "$outdir" \
  --rows "$rows" \
  --cols "$cols" \
  --cell-size 512 \
  --align feet \
  --shared-scale \
  --component-mode largest \
  --fit-scale 0.82 \
  --prompt "Form Agent $name" \
  --duration 120

python3 - <<PY
import json
m=json.load(open("$outdir/pipeline-meta.json"))
print("$name edge_touch:", m.get("edge_touch_frames"))
PY

python3 "$ASSEMBLE" --frames-dir "$outdir" --glob "idle-*.png" --output "$OUT/sheet-$name.webp" --cell-size 512 --align feet --already-squared
echo "OK $name"
