#!/usr/bin/env python3
"""Separate the stationary toaster from the approved Kitchen master.

The approved master supplies the visible housing and plug. The approved-source
toast support supplies only the slot occluded by bread. Occluded tile, the
unplugged outlet and stone use neighboring approved-source pixels. A second
outlet in the same master supplies the tiny socket marks.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]
TRUTH = ROOT / 'public/rooms/kitchen/rebuild/truth'
DEST = TRUTH / 'toaster-truth-atlas.webp'


def clean_support(source, master):
    support = source.copy()
    for y in range(40, 130):
        for x in range(20, 135):
            if y < 82:
                if x >= 119:
                    continue
                left, right = source.getpixel((14, y)), source.getpixel((140, y))
                u = (x - 14) / 126
                target = tuple(round((1-u)*left[c] + u*right[c]) for c in range(3))
                weight = min(1, max(0, (x-20)/3), max(0, (119-x)/3), max(0, (y-40)/2))
            elif y < 110:
                sx = 131 + abs(((x-25)*7+y*3) % 36-18)
                target = source.getpixel((sx, y))[:3]
                weight = min(1, max(0, (x-25)/4), max(0, (132-x)/4), max(0, (y-80)/2))
            else:
                sx = 129 + abs(((x-28)*5+y*7) % 40-20)
                target = source.getpixel((sx, y))[:3]
                weight = min(1, max(0, (x-30)/5), max(0, (127-x)/5),
                             max(0, (y-108)/2), max(0, (130-y)/2))
            if weight <= 0:
                continue
            old = source.getpixel((x, y))
            support.putpixel((x, y), tuple(round((1-weight)*old[c] + weight*target[c])
                                              for c in range(3)) + (255,))

    # Preserve the outlet plate and remove its black plug and dangling lead.
    for y in range(42, 85):
        for x in range(117, 133):
            left, right = source.getpixel((116, y)), source.getpixel((133, y))
            u = (x - 116) / 17
            target = tuple(round((1-u)*left[c] + u*right[c]) for c in range(3))
            weight = min(1, max(0, (y-41)/2), max(0, (85-y)/2))
            old = support.getpixel((x, y))
            support.putpixel((x, y), tuple(round((1-weight)*old[c] + weight*target[c])
                                              for c in range(3)) + (255,))

    # Small socket holes are taken from an unoccupied outlet in this master.
    donor = master.crop((819, 239, 830, 250))
    background = master.getpixel((818, 240))
    for j in range(11):
        for i in range(11):
            x, y = 119+i, 42+j
            old, sample = support.getpixel((x, y)), donor.getpixel((i, j))
            feather = max(0, min(1, (i+1)/2, (10-i)/2, (j+1)/2, (10-j)/2))
            color = tuple(round(old[c] + feather*.7*(sample[c]-background[c])) for c in range(3))
            support.putpixel((x, y), color + (255,))
    return support


def photographed_parts(source, reference):
    mask = Image.new('L', (150, 130))
    draw = ImageDraw.Draw(mask)
    draw.polygon([(43,43),(52,42),(92,42),(102,44),(107,48),(111,53),
                  (113,64),(113,103),(110,109),(102,112),(45,112),
                  (42,109),(41,104),(41,57)], fill=255)
    draw.polygon([(108,60),(117,60),(117,65),(109,67)], fill=255)
    body = reference.copy()
    # Bread occludes the slot in the master. Only that narrow strip uses the
    # approved-source empty-slot reconstruction from the toast truth atlas.
    body.paste(source.crop((40, 40, 94, 52)), (40, 40))
    body.putalpha(mask.filter(ImageFilter.GaussianBlur(.55)))

    cord_mask = Image.new('L', (150, 130))
    draw = ImageDraw.Draw(cord_mask)
    draw.ellipse((118,42,129,56), fill=255)
    draw.polygon([(123,53),(128,53),(125,75),(126,83),(123,87),(120,79)], fill=255)
    cord = reference.copy()
    alpha = cord_mask.filter(ImageFilter.GaussianBlur(.45))
    for y in range(40, 88):
        for x in range(117, 131):
            green = source.getpixel((x, y))[1]
            alpha.putpixel((x, y), round(alpha.getpixel((x, y))*max(0, min(1, (85-green)/25))))
    cord.putalpha(alpha.filter(ImageFilter.GaussianBlur(.5)))
    return body, cord


def shadow_parts(source):
    wall_alpha = Image.new('L', (150, 130))
    ImageDraw.Draw(wall_alpha).ellipse((29,46,58,106), fill=95)
    wall = Image.new('RGBA', (150, 130), (25,18,13,0))
    wall.putalpha(wall_alpha.filter(ImageFilter.GaussianBlur(4)))

    contact_alpha = Image.new('L', (150, 130))
    ImageDraw.Draw(contact_alpha).ellipse((37,102,116,115), fill=75)
    contact = Image.new('RGBA', (150, 130), (23,16,11,0))
    contact.putalpha(contact_alpha.filter(ImageFilter.GaussianBlur(2)))

    reflection_alpha = Image.new('L', (150, 130))
    ImageDraw.Draw(reflection_alpha).ellipse((48,110,111,126), fill=210)
    reflection = source.copy()
    reflection.putalpha(reflection_alpha.filter(ImageFilter.GaussianBlur(2)))
    return wall, contact, reflection


def build():
    master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
    toast = Image.open(TRUTH / 'toast-truth-atlas.webp').convert('RGBA')
    assert master.size == (1000, 600) and toast.size == (304, 165)
    source = toast.crop((152, 0, 302, 130))
    support = clean_support(source, master)
    reference = master.crop((585, 205, 735, 335)).convert('RGBA')
    body, cord = photographed_parts(source, reference)
    wall, contact, reflection = shadow_parts(source)

    atlas = Image.new('RGBA', (180, 235))
    frames = [
        (support, (0,0,150,130), (0,0)),
        (body, (35,42,125,114), (0,132)),
        (cord, (113,40,138,92), (92,132)),
        (wall, (25,45,55,110), (120,132)),
        (contact, (35,100,125,118), (0,207)),
        (reflection, (35,108,110,129), (92,207)),
    ]
    for part, crop, position in frames:
        atlas.paste(part.crop(crop), position)
    atlas.save(DEST, format='WEBP', lossless=True, method=6)
    with Image.open(DEST) as decoded:
        decoded.load()
        assert decoded.size == (180, 235)

    rest = support.copy()
    for part in (wall, contact, reflection, body, cord):
        rest.alpha_composite(part)
    mae = sum(ImageStat.Stat(ImageChops.difference(reference.convert('RGB'), rest.convert('RGB'))).mean)/3
    print(f'{DEST.relative_to(ROOT)}: {atlas.width}x{atlas.height}; empty-slot rest MAE {mae:.3f}')


if __name__ == '__main__':
    build()
