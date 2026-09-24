#!/usr/bin/env python3
"""Author only the wall unseen behind the approved open cabinet.

The lower tile is taken from the adjacent approved-master backsplash and
reflected up to the new painted wall. The painted area is a deterministic
proposal, never a replacement for any photographed master pixel.
"""

from math import exp
from pathlib import Path
from PIL import Image

TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'


def build():
    master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
    assert master.size == (1000, 600)
    backing = Image.new('RGB', (205, 173))
    pixels = backing.load()

    for y in range(173):
        for x in range(205):
            if y >= 123:
                # At the bottom this is the exact first row of the existing
                # backsplash, so the edge meets without a color jump.
                pixels[x, y] = master.getpixel((565 + x, 173 + 172 - y))
                continue

            transition = master.getpixel((565 + x, 222))
            weight = (y / 123) ** 1.8
            top = (169 + 2 * x / 205, 139 + 3 * x / 205, 113 + 2 * x / 205)
            recess = (1 - weight) * (
                0.12 * exp(-x / 9) + 0.12 * exp(-(204 - x) / 9) + 0.09 * exp(-y / 24)
            )
            grain = (((x * 73 + y * 131) ^ (x * y * 17)) % 11 - 5) * (1 - weight) * 0.24
            pixels[x, y] = tuple(max(0, min(255, round(
                ((1 - weight) * top[channel] + weight * transition[channel]) * (1 - recess) + grain
            ))) for channel in range(3))

    destination = TRUTH / 'cabinet-backing-proposal.webp'
    backing.save(destination, 'WEBP', quality=91, method=6)
    print(f'{destination.name}: {backing.width}x{backing.height}, {destination.stat().st_size} bytes')


if __name__ == '__main__':
    build()
