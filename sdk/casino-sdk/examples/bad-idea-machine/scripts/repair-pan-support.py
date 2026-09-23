"""Remove a pan-shaped backsplash remnant from the approved-source support.

The photographed pan, contact shadow and approved master are untouched. The
dark backsplash is extended from neighboring rows of the same local support.
"""

from pathlib import Path
from PIL import Image, ImageChops

TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'
DEST = TRUTH / 'pan-support.webp'


def repair():
    support = Image.open(DEST).convert('RGBA')
    assert support.size == (240, 110)
    if all(sum(support.getpixel(point)[:3]) / 3 < 50 for point in [(62, 58), (65, 64)]):
        print('Pan support already clean')
        return
    repaired = support.copy()
    for y in range(56, 66):
        for x in range(55, 76):
            weight = min(1, (x - 54) / 4, (76 - x) / 4, (y - 55) / 2, (66 - y) / 2)
            if weight <= 0:
                continue
            original = support.getpixel((x, y))
            neighboring = support.getpixel((x + 28, y))
            repaired.putpixel((x, y), tuple(round((1-weight)*a + weight*b) for a, b in zip(original, neighboring)))
    outside = ImageChops.difference(support.convert('RGB'), repaired.convert('RGB'))
    assert outside.getbbox() and outside.getbbox()[0] >= 55 and outside.getbbox()[1] >= 56
    assert outside.getbbox()[2] <= 76 and outside.getbbox()[3] <= 66
    repaired.save(DEST, format='WEBP', lossless=True, method=6)
    with Image.open(DEST) as decoded:
        decoded.load()
        assert decoded.size == (240, 110)
    print('Pan support rear backsplash cleaned from neighboring approved-source pixels')


if __name__ == '__main__':
    repair()
