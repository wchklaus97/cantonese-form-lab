#!/usr/bin/env python3
"""Build a generate2dsprite-ready prompt for one Form Lab preset + gender."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOCUS = Path(__file__).resolve().parent / "form-focus.json"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset", required=True)
    ap.add_argument("--gender", choices=("m", "f"), required=True)
    args = ap.parse_args()

    data = json.loads(FOCUS.read_text())
    spec = data["presets"].get(args.preset)
    if not spec:
        raise SystemExit(f"Unknown preset: {args.preset}")

    rows, cols = spec["grid"]
    who = (
        "athletic young woman Form Agent (black high ponytail, gray tee, black shorts, white sneakers, black wristbands)"
        if args.gender == "f"
        else "athletic muscular young man Form Agent (short black hair, gray tee, black shorts, white sneakers, black wristbands)"
    )
    ref = (
        "Use the attached female character reference as identity lock."
        if args.gender == "f"
        else "Use the attached male character reference as identity lock."
    )

    must = "; ".join(spec["mustShow"])
    prompt = f"""Clean HD 2D game sprite animation sheet. {ref} Same {who}, clean anime-inspired line art, soft cell shading. Solid flat magenta background #FF00FF only — no gradients, no text, no labels, no UI, no arrows, no borders between cells.

Exact layout: {rows} rows x {cols} columns equal invisible cells ({spec['frames']} frames), left-to-right then top-to-bottom. Same character scale and feet/seat anchor in every cell. Full subject + needed equipment inside each cell with magenta margin; nothing crosses cell edges. Body in central 60-70% safe area.

Camera: {spec['view']}.

FORM FOCUS (must be the most readable thing in every frame): {spec['focus']}
Also must clearly show: {must}.
Sell the cue with pose, silhouette, and lighting emphasis on the critical joints — never with text or callout graphics.

Action: {args.preset} workout demo, loop-friendly start≈end. Equipment solid and attached every frame. No floating weights, no ghost limbs, no second character. Do not make pixel art."""

    print(prompt)
    print(f"\n--- meta grid={rows}x{cols} frames={spec['frames']} cell={data['cellSize']} ---")


if __name__ == "__main__":
    main()
