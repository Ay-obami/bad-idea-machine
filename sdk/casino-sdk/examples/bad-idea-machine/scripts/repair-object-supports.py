"""Separate the remaining toast and clean narrow towel traces in local truth atlases.

The reference, hero body, and shadow pixels are retained from the existing
approved-source atlases. Only the support pixels hidden behind the objects are
reconstructed from adjacent pixels of those same atlases.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageStat, ImageChops


ROOT = Path(__file__).resolve().parents[1]
TRUTH = ROOT / 'public/rooms/kitchen/rebuild/truth'


def brightness(pixel):
    return sum(pixel[:3]) / 3


def clean_toast_support(atlas):
    support = atlas.crop((152, 0, 302, 130))
    remaining_box = (124, 132, 150, 154)
    remaining = atlas.crop(remaining_box)
    if remaining.getchannel('A').getbbox() is None:
        alpha = Image.new('L', support.size)
        ImageDraw.Draw(alpha).polygon([
            (48, 47), (49, 42), (52, 38), (54, 35), (58, 33),
            (63, 33), (66, 36), (67, 46), (68, 49), (48, 49),
        ], fill=255)
        alpha = alpha.filter(ImageFilter.GaussianBlur(.55))
        remaining = support.crop((47, 30, 73, 52))
        remaining.putalpha(alpha.crop((47, 30, 73, 52)))
        atlas.paste(remaining, remaining_box[:2])

    if brightness(support.getpixel((59, 38))) < 95:
        mask = Image.new('L', support.size)
        ImageDraw.Draw(mask).rectangle((47, 31, 71, 47), fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(1))
        cleaned = support.copy()
        for y in range(28, 51):
            for x in range(44, 75):
                opacity = mask.getpixel((x, y)) / 255
                if not opacity:
                    continue
                if y <= 44:
                    left = support.getpixel((44, y))
                    right = support.getpixel((74, y))
                    fraction = (x - 44) / 30
                    target = tuple(round((1-fraction)*a + fraction*b) for a, b in zip(left, right))
                else:
                    target = support.getpixel((78, y))
                original = support.getpixel((x, y))
                cleaned.putpixel((x, y), tuple(round((1-opacity)*a + opacity*b) for a, b in zip(original, target)))
        atlas.paste(cleaned, (152, 0))
    return atlas


def clean_towel_support(atlas):
    support = atlas.crop((127, 0, 252, 175))
    if brightness(support.getpixel((23, 28))) < 150 and brightness(support.getpixel((22, 100))) < 95:
        return atlas
    mask = Image.new('L', support.size)
    draw = ImageDraw.Draw(mask)
    draw.polygon([(20, 24), (26, 24), (26, 33), (21, 34)], fill=255)
    draw.polygon([(20, 92), (24, 92), (24, 110), (26, 125), (27, 136), (20, 136)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(.7))
    cleaned = support.copy()
    for y in range(20, 140):
        for x in range(18, 30):
            opacity = mask.getpixel((x, y)) / 255
            if opacity:
                original = support.getpixel((x, y))
                adjacent = support.getpixel((x + 9, y))
                cleaned.putpixel((x, y), tuple(round((1-opacity)*a + opacity*b) for a, b in zip(original, adjacent)))
    atlas.paste(cleaned, (127, 0))
    return atlas


def main():
    for name, repair in [('toast', clean_toast_support), ('towel', clean_towel_support)]:
        path = TRUTH / f'{name}-truth-atlas.webp'
        original = Image.open(path).convert('RGBA')
        repaired = repair(original.copy())
        if ImageChops.difference(original.convert('RGB'), repaired.convert('RGB')).getbbox() is None:
            print(f'{name}: already clean')
            continue
        # Lossless re-encoding keeps every decoded approved reference and body
        # pixel identical; only the support and new remaining-slice frame move.
        if name == 'toast':
            for box in [(0, 0, 150, 130), (0, 132, 37, 151), (40, 132, 75, 150), (80, 132, 121, 163)]:
                assert ImageChops.difference(original.crop(box).convert('RGB'), repaired.crop(box).convert('RGB')).getbbox() is None
            reference = repaired.crop((0, 0, 150, 130)).convert('RGB')
            support = repaired.crop((152, 0, 302, 130))
            support.alpha_composite(repaired.crop((124, 132, 150, 154)), (47, 30))
            support.alpha_composite(repaired.crop((40, 132, 75, 150)), (60, 33))
            support.alpha_composite(repaired.crop((0, 132, 37, 151)), (58, 32))
            error = sum(ImageStat.Stat(ImageChops.difference(reference, support.convert('RGB'))).mean) / 3
            assert error < 3.2, f'toast rest registration drifted: {error:.3f}'
            print(f'toast intact-rest MAE: {error:.3f}')
        else:
            for box in [(0, 0, 125, 175), (0, 177, 77, 320), (79, 177, 160, 325)]:
                assert ImageChops.difference(original.crop(box).convert('RGB'), repaired.crop(box).convert('RGB')).getbbox() is None
        repaired.save(path, format='WEBP', lossless=True, method=6)
        with Image.open(path) as decoded:
            decoded.load()
            assert decoded.size == original.size
        print(f'{name}: repaired {path.name}')


if __name__ == '__main__':
    main()
