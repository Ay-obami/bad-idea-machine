#!/usr/bin/env python3
"""Author only the plate surface hidden in the approved edge-on photograph.

The intact hero rim and remaining stack stay in plate-truth-atlas.webp. This
small, independent face uses the master plate's photographed ceramic palette;
it never edits the master or supplies a replacement cabinet.
"""
from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
TRUTH = ROOT / 'public/rooms/kitchen/rebuild/truth'
DEST = TRUTH / 'plate-tilt-atlas.webp'
W, H, SCALE = 82, 40, 4


def plate_face(master):
    mask = Image.new('L', (W * SCALE, H * SCALE))
    coverage = mask.load()
    for py in range(H * SCALE):
        y = (py + .5) / SCALE
        for px in range(W * SCALE):
            x = (px + .5) / SCALE
            middle = 20.0 + (x - 41) * .07
            radius = 37.5 * (1 + .008 * math.sin(x * .22))
            q = ((x - 41) / radius) ** 2 + ((y - middle) / 12.8) ** 2
            if q <= 1:
                coverage[px, py] = 255
    mask = mask.resize((W, H), Image.Resampling.LANCZOS)
    under_high = Image.new('L', (W * SCALE, H * SCALE))
    under_pixels = under_high.load()
    for py in range(H * SCALE):
        y = (py + .5) / SCALE
        for px in range(W * SCALE):
            x = (px + .5) / SCALE
            middle = 20 + (x - 41) * .07
            below = ((x - 41) / 37.5) ** 2 + ((y - middle - 2.4) / 12.8) ** 2
            if y > middle and below < 1:
                under_pixels[px, py] = 225
    underside = Image.new('RGBA', (W, H), (112, 81, 60, 0))
    underside.putalpha(under_high.resize((W, H), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(.45)))
    face = Image.new('RGBA', (W, H))
    pixels = face.load()
    for y in range(H):
        for x in range(W):
            alpha = mask.getpixel((x, y))
            if not alpha:
                continue
            middle = 20 + (x - 41) * .07
            q = ((x - 41) / 37.5) ** 2 + ((y - middle) / 12.8) ** 2
            sx = max(585, min(635, round(585 + x * 50 / 82)))
            source = master.getpixel((sx, 90))
            # Keep photographed horizontal variation without stretching its
            # single bright highlight into a stripe across the whole face.
            base = (138, 106, 82)
            texture = [(c - base[i]) * .24 for i, c in enumerate(source)]
            rim = 21 * math.exp(-((math.sqrt(q) - .83) / .115) ** 2)
            well = -8 * math.exp(-q / .23)
            well_edge = -7 * math.exp(-((math.sqrt(q) - .57) / .085) ** 2)
            contour = -16 * max(0, (q - .89) / .11)
            front = -11 * max(0, (y - middle) / 13)
            light = 5 * (1 - q) + 3 * (41 - x) / 41
            tone = rim + well + well_edge + contour + front + light
            pixels[x, y] = tuple(max(0, min(255, round(c + tone + texture[i]))) for i, c in enumerate(base)) + (alpha,)
    return Image.alpha_composite(underside, face)


def plate_contact():
    high = Image.new('L', (W * SCALE, H * SCALE))
    pen = ImageDraw.Draw(high)
    pen.ellipse((11*SCALE, 27*SCALE, 72*SCALE, 39*SCALE), fill=105)
    alpha = high.resize((W, H), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(1.3))
    shadow = Image.new('RGBA', (W, H), (31, 20, 13, 0))
    shadow.putalpha(alpha)
    return shadow


def build():
    master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
    assert master.size == (1000, 600)
    atlas = Image.new('RGBA', (166, H))
    atlas.paste(plate_face(master), (0, 0))
    atlas.paste(plate_contact(), (84, 0))
    atlas.save(DEST, 'WEBP', lossless=True, method=6)
    decoded = Image.open(DEST)
    decoded.load()
    assert decoded.size == (166, 40)
    print(f'{DEST.relative_to(ROOT)}: {decoded.width}×{decoded.height}, {DEST.stat().st_size} bytes')


if __name__ == '__main__':
    build()
