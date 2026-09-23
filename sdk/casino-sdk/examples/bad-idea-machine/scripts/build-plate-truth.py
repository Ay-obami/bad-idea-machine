#!/usr/bin/env python3
"""Rebuild the static plate proof from the repository-local approved master.

Requires Pillow. The rest sprites copy photographed pixels; only the hidden
cabinet backing is reconstructed from unobstructed pixels in that cabinet.
No motion or aftermath assets are produced here.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / 'public/rooms/kitchen/rebuild/truth/approved-master.webp'
DEST = ROOT / 'public/rooms/kitchen/rebuild/truth/plate-truth-atlas.webp'
X, Y, W, H = 555, 67, 135, 85
FRAMES = {
    'reference': (0, 0, 135, 85, 0, 0),
    'support': (137, 0, 135, 85, 0, 0),
    'heroBody': (0, 87, 70, 20, 18, 18),
    'heroShadow': (72, 87, 70, 20, 18, 25),
    'stackBody': (144, 87, 70, 29, 18, 28),
    'stackShadow': (216, 87, 70, 18, 18, 44),
}


def silhouette(points, radius):
    layer = Image.new('L', (W, H), 0)
    ImageDraw.Draw(layer).polygon([(x-X, y-Y) for x, y in points], fill=255)
    return layer.filter(ImageFilter.GaussianBlur(radius))


def photographic_body(reference, polygon, radius):
    body = reference.copy()
    body.putalpha(silhouette(polygon, radius))
    return body


def contact_shadow(polygon, opacity):
    # Pure translucent shading. A shadow cannot smuggle in cabinet pixels.
    alpha = silhouette(polygon, 1.35).point(lambda a: round(a*opacity/255))
    shadow = Image.new('RGBA', (W, H), (31, 20, 13, 0))
    shadow.putalpha(alpha)
    return shadow


def cabinet_support(master, reference):
    support = reference.copy()
    px = support.load()
    original = reference.load()
    for gy in range(80, 124):
        for gx in range(569, 650):
            source_y = 79 + int((gy-80)*.12)
            # The wood above the plate is the photographed material. The visible
            # wood at x=646 provides the vertical lighting correction.
            wood = master.getpixel((max(gx, 576), source_y))
            near = master.getpixel((646, source_y))
            lit = master.getpixel((646, min(gy, 113)))
            sample = [max(0, min(255, wood[c]+lit[c]-near[c])) for c in range(3)]
            weight = min(1, (gx-569)/8, (650-gx)/9, (gy-80)/9)
            if gy > 121:
                weight = min(weight, (123-gy)/2)
            weight = max(0, weight)
            current = original[gx-X, gy-Y]
            px[gx-X, gy-Y] = tuple(round(current[c]*(1-weight)+sample[c]*weight) for c in range(3)) + (255,)
    return support


def composite(parts):
    output = parts['support'].copy()
    for key in ('stackShadow', 'stackBody', 'heroShadow', 'heroBody'):
        output = Image.alpha_composite(output, parts[key])
    return output


def build():
    master = Image.open(MASTER).convert('RGB')
    assert master.size == (1000, 600), master.size
    reference = master.crop((X, Y, X+W, Y+H)).convert('RGBA')
    parts = {
        'reference': reference,
        'support': cabinet_support(master, reference),
        'heroBody': photographic_body(reference, [
            (577,94),(580,91),(588,89),(606,88),(626,89),(637,91),
            (641,94),(638,96),(633,97),(583,97),(578,96),
        ], .7),
        'stackBody': photographic_body(reference, [
            (579,99),(584,97),(634,97),(641,99),(641,111),
            (639,117),(633,120),(583,120),(577,117),(575,109),
        ], .8),
        'heroShadow': contact_shadow([
            (580,95),(588,95),(634,95),(640,96),(636,99),(582,99),
        ], 43),
        'stackShadow': contact_shadow([
            (577,115),(583,116),(633,116),(640,116),(636,123),(583,124),
        ], 53),
    }
    atlas = Image.new('RGBA', (288, 125), (0, 0, 0, 0))
    for name, (sx, sy, sw, sh, dx, dy) in FRAMES.items():
        atlas.paste(parts[name].crop((dx, dy, dx+sw, dy+sh)), (sx, sy))
    DEST.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(DEST, format='WEBP', lossless=True, method=6)
    reconstructed = composite(parts)
    mae = sum(ImageStat.Stat(ImageChops.difference(reference.convert('RGB'), reconstructed.convert('RGB'))).mean)/3
    print(f'{DEST.relative_to(ROOT)}: {atlas.width}x{atlas.height}; rest reconstruction MAE {mae:.3f}')
    assert mae < 1.2, 'Photographed intact rest state drifted from approved master'
    assert parts['heroBody'].getchannel('A').getbbox() != parts['stackBody'].getchannel('A').getbbox()
    for key in ('heroShadow', 'stackShadow'):
        colors = parts[key].get_flattened_data()
        assert all(pixel[:3] == (31,20,13) for pixel in colors), f'{key} contains room pixels'
    check = Image.open(DEST)
    check.load()
    assert check.size == (288, 125)

if __name__ == '__main__':
    build()
