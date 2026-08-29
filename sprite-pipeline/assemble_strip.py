#!/usr/bin/env python3
"""Assemble processed frame PNGs into a horizontal WebP strip for the Form Lab player.

Standard delivery: square cells (default 512x512), feet-aligned, shared scale,
transparent padding — never stretch/distort frames. Runtime clips by cell width.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def fit_frames(
    images: list[Image.Image],
    cell: int,
    *,
    align: str,
    shared_scale: bool,
    margin_ratio: float,
) -> list[Image.Image]:
    margin = max(8, int(cell * margin_ratio))
    avail_w = cell - 2 * margin
    avail_h = cell - 2 * margin
    if avail_w < 16 or avail_h < 16:
        raise SystemExit("cell-size too small for margin")

    scales: list[float] = []
    for im in images:
        if im.width < 1 or im.height < 1:
            scales.append(1.0)
            continue
        scales.append(min(avail_w / im.width, avail_h / im.height))

    if shared_scale:
        scale = min(scales) if scales else 1.0
        scales = [scale] * len(images)

    out: list[Image.Image] = []
    for im, scale in zip(images, scales):
        nw = max(1, int(round(im.width * scale)))
        nh = max(1, int(round(im.height * scale)))
        resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
        x = (cell - nw) // 2
        if align == "feet":
            y = cell - margin - nh
        elif align == "center":
            y = (cell - nh) // 2
        else:
            y = margin
        y = max(0, min(y, cell - nh))
        canvas.paste(resized, (x, y), resized)
        out.append(canvas)
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--frames-dir", required=True, type=Path)
    parser.add_argument("--glob", default="frame-*.png")
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument(
        "--cell-size",
        type=int,
        default=512,
        help="Square cell size in px (0 = native bbox pad, no fixed square)",
    )
    parser.add_argument("--align", choices=("feet", "center", "top"), default="feet")
    parser.add_argument(
        "--shared-scale",
        action="store_true",
        default=True,
        help="Use one scale for all frames so size stays stable across the loop",
    )
    parser.add_argument("--no-shared-scale", action="store_false", dest="shared_scale")
    parser.add_argument("--margin-ratio", type=float, default=0.06)
    parser.add_argument(
        "--stretch",
        action="store_true",
        help="Legacy: force-resize each frame to cell (distorts). Prefer pad-fit.",
    )
    parser.add_argument(
        "--already-squared",
        action="store_true",
        help="Frames are already cell-size squares from the processor; stitch as-is.",
    )
    args = parser.parse_args()

    frames = sorted(args.frames_dir.glob(args.glob))
    if not frames:
        raise SystemExit(f"No frames matching {args.glob} in {args.frames_dir}")

    images = [Image.open(p).convert("RGBA") for p in frames]

    if args.already_squared:
        if args.cell_size <= 0:
            raise SystemExit("--already-squared requires --cell-size")
        size = (args.cell_size, args.cell_size)
        normalized = []
        for im in images:
            if im.size == size:
                normalized.append(im)
            else:
                canvas = Image.new("RGBA", size, (0, 0, 0, 0))
                x = (size[0] - im.width) // 2
                y = (size[1] - im.height) // 2
                canvas.paste(im, (x, y), im)
                normalized.append(canvas)
        images = normalized
    elif args.cell_size <= 0:
        w = max(im.width for im in images)
        h = max(im.height for im in images)
        size = (w, h)
        normalized = []
        for im in images:
            canvas = Image.new("RGBA", size, (0, 0, 0, 0))
            x = (w - im.width) // 2
            y = h - im.height
            canvas.paste(im, (x, y), im)
            normalized.append(canvas)
        images = normalized
    elif args.stretch:
        size = (args.cell_size, args.cell_size)
        images = [im.resize(size, Image.Resampling.LANCZOS) for im in images]
    else:
        size = (args.cell_size, args.cell_size)
        images = fit_frames(
            images,
            args.cell_size,
            align=args.align,
            shared_scale=args.shared_scale,
            margin_ratio=args.margin_ratio,
        )

    strip = Image.new("RGBA", (size[0] * len(images), size[1]), (0, 0, 0, 0))
    for i, im in enumerate(images):
        strip.paste(im, (i * size[0], 0), im)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    save_options: dict[str, object] = {"optimize": True}
    if args.output.suffix.lower() == ".webp":
        save_options = {"format": "WEBP", "quality": 92, "method": 6, "exact": True}
    strip.save(args.output, **save_options)
    print(f"Wrote {args.output} ({len(images)} frames, cell={size[0]}x{size[1]})")


if __name__ == "__main__":
    main()
