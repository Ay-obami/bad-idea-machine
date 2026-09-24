"""Decode the cabinet layer and compare every pixel to the approved master."""

from pathlib import Path
from PIL import Image, ImageChops

TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'
master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
cabinet = Image.open(TRUTH / 'cabinet-intact.webp').convert('RGB')
assert master.size == (1000, 600)
assert cabinet.size == (205, 173)
reference = master.crop((565, 0, 770, 173))
assert ImageChops.difference(cabinet, reference).getbbox() is None, 'cabinet must retain approved pixels'
print('Open cabinet decodes at 205x173 and matches every approved-master pixel')
