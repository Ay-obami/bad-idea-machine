#!/usr/bin/env python3
"""Extract the open cabinet's exact intact pixels from the approved master.

The surface behind the cabinet is not photographed. No inferred replacement
wall is authored here; the proof displays that missing shell as an opening.
"""

from pathlib import Path
from PIL import Image

TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'


def build():
    master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
    assert master.size == (1000, 600)
    cabinet = master.crop((565, 0, 770, 173))
    destination = TRUTH / 'cabinet-intact.webp'
    cabinet.save(destination, 'WEBP', lossless=True, method=6)
    with Image.open(destination) as decoded:
        decoded.load()
        assert decoded.size == (205, 173)
    print(f'{destination.name}: 205x173 exact approved pixels')


if __name__ == '__main__':
    build()
