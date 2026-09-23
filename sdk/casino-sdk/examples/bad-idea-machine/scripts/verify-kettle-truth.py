#!/usr/bin/env python3
"""Decode the local kettle atlas and check it against the approved master."""

from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / 'public/rooms/kitchen/rebuild/truth/approved-master.webp'
ATLAS = ROOT / 'public/rooms/kitchen/rebuild/truth/kettle-truth-atlas.webp'
FRAMES = {
    'reference': (0, 0, 120, 120, 0, 0),
    'support': (122, 0, 120, 120, 0, 0),
    'body': (0, 122, 75, 93, 19, 10),
    'shadow': (78, 122, 76, 28, 19, 90),
    'reflection': (78, 152, 76, 22, 19, 98),
}


def main():
    master = Image.open(MASTER).convert('RGBA')
    master.load()
    assert master.size == (1000, 600)
    atlas = Image.open(ATLAS).convert('RGBA')
    atlas.load()
    assert atlas.size == (242, 217)
    parts = {}
    for name, (x, y, width, height, dx, dy) in FRAMES.items():
        layer = Image.new('RGBA', (120, 120))
        layer.alpha_composite(atlas.crop((x, y, x+width, y+height)), (dx, dy))
        parts[name] = layer

    approved = master.crop((720, 216, 840, 336))
    assert ImageChops.difference(parts['reference'], approved).getbbox() is None
    assert parts['support'].getchannel('A').getextrema() == (255, 255)
    # Counter without the kettle contains tile/stone, never the silver body or
    # the bright rectangular reflection visible under the photographed kettle.
    for x, y in ((50, 44), (60, 65), (63, 107)):
        assert sum(parts['support'].getpixel((x, y))[:3]) < 490, (x, y)
    assert parts['body'].getchannel('A').getbbox() is not None
    assert parts['body'].getchannel('A').getpixel((0, 0)) == 0
    assert parts['shadow'].getchannel('A').getbbox() is not None
    assert parts['reflection'].getchannel('A').getbbox() is not None
    shadow_colors = {pixel[:3] for pixel in parts['shadow'].get_flattened_data() if pixel[3]}
    assert shadow_colors == {(30, 21, 12)}, shadow_colors

    result = parts['support']
    for name in ('shadow', 'reflection', 'body'):
        result = Image.alpha_composite(result, parts[name])
    mae = sum(ImageStat.Stat(ImageChops.difference(result.convert('RGB'), approved.convert('RGB'))).mean)/3
    assert mae < 2.5, f'kettle rest MAE {mae:.3f} exceeds approved crop tolerance'
    print(f'Kettle atlas decoded; approved reference exact; clean support and separate layers; rest MAE {mae:.3f}')


if __name__ == '__main__':
    main()
