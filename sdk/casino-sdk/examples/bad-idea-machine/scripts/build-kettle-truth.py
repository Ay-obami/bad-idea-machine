#!/usr/bin/env python3
"""Extract the stationary kettle from the repository's approved Kitchen master.

Only the occluded tile/counter is reconstructed, using adjacent pixels of the
same image. No older Kitchen plate, network asset, or generated image is used.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / 'public/rooms/kitchen/rebuild/truth/approved-master.webp'
DEST = ROOT / 'public/rooms/kitchen/rebuild/truth/kettle-truth-atlas.webp'
X, Y, W, H = 720, 216, 120, 120
FRAMES = {
    'reference': (0, 0, W, H, 0, 0),
    'support': (122, 0, W, H, 0, 0),
    'body': (0, 122, 75, 93, 19, 10),
    'shadow': (78, 122, 76, 28, 19, 90),
    'reflection': (78, 152, 76, 22, 19, 98),
}


def photographed_body(reference):
    mask = Image.new('L', (W, H), 0)
    draw = ImageDraw.Draw(mask)
    outline = [
        (769, 233), (780, 232), (785, 234), (791, 235),
        (796, 237), (801, 240), (806, 245), (809, 253),
        (810, 266), (808, 279), (804, 290), (797, 301),
        (794, 310), (792, 315), (747, 315), (745, 312),
        (747, 300), (747, 274), (745, 260), (744, 249),
        (754, 247), (758, 243), (764, 235),
    ]
    opening = [
        (791, 254), (793, 250), (795, 255), (798, 265),
        (798, 272), (795, 276), (793, 269), (791, 259),
    ]
    draw.polygon([(x-X, y-Y) for x, y in outline], fill=255)
    draw.polygon([(x-X, y-Y) for x, y in opening], fill=0)
    body = reference.copy()
    body.putalpha(mask.filter(ImageFilter.GaussianBlur(.55)))
    return body


def clean_counter(master, reference):
    support = reference.copy()
    pixels = support.load()
    for y in range(228, 336):
        for x in range(740, 815):
            u = (x-740)/74
            left = master.getpixel((737, y))
            right = master.getpixel((814, y))
            if y >= 309:
                # Nearby photographed stone, reflected back and forth along the
                # counter. This also removes the kettle's bright front reflection.
                source_x = 738-abs(((x-740) % 38)-19)
                stone = master.getpixel((source_x, y))
                color = tuple(round(.7*stone[c] + .3*((1-u)*left[c] + u*right[c])) for c in range(3))
            else:
                # Interpolate each photographed tile row separately so grout
                # lines and the dark backsplash stay at their original height.
                color = tuple(round((1-u)*left[c] + u*right[c]) for c in range(3))
            weight = max(0, min(1, (x-739)/5, (815-x)/5, (y-227)/4, (336-y)/3))
            original = pixels[x-X, y-Y]
            pixels[x-X, y-Y] = tuple(round(original[c]*(1-weight)+color[c]*weight) for c in range(3))+(255,)
    return support


def contact_shadow():
    alpha = Image.new('L', (W, H), 0)
    ImageDraw.Draw(alpha).ellipse((20, 93, 95, 107), fill=78)
    alpha = alpha.filter(ImageFilter.GaussianBlur(2))
    shade = Image.new('RGBA', (W, H), (30, 21, 12, 0))
    shade.putalpha(alpha)
    return shade


def counter_reflection(reference):
    # The approved source contains a strong silver reflection in the stone.
    # Keep it in its own soft mask so an empty counter has no kettle reflection.
    alpha = Image.new('L', (W, H), 0)
    draw = ImageDraw.Draw(alpha)
    draw.ellipse((23, 99, 88, 116), fill=255)
    reflection = reference.copy()
    reflection.putalpha(alpha.filter(ImageFilter.GaussianBlur(1.3)))
    return reflection


def build():
    master = Image.open(MASTER).convert('RGB')
    assert master.size == (1000, 600)
    reference = master.crop((X, Y, X+W, Y+H)).convert('RGBA')
    parts = {
        'reference': reference,
        'support': clean_counter(master, reference),
        'body': photographed_body(reference),
        'shadow': contact_shadow(),
        'reflection': counter_reflection(reference),
    }
    atlas = Image.new('RGBA', (242, 217), (0, 0, 0, 0))
    for name, (sx, sy, sw, sh, dx, dy) in FRAMES.items():
        atlas.paste(parts[name].crop((dx, dy, dx+sw, dy+sh)), (sx, sy))
    DEST.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(DEST, format='WEBP', lossless=True, method=6)

    rest = parts['support']
    for key in ('shadow', 'reflection', 'body'):
        rest = Image.alpha_composite(rest, parts[key])
    mae = sum(ImageStat.Stat(ImageChops.difference(reference.convert('RGB'), rest.convert('RGB'))).mean)/3
    print(f'{DEST.relative_to(ROOT)}: {atlas.width}x{atlas.height}; rest MAE {mae:.3f}')
    assert mae < 4.5, 'Stationary rest differs too much from approved crop'
    assert Image.open(DEST).size == (242, 217)


if __name__ == '__main__':
    build()
