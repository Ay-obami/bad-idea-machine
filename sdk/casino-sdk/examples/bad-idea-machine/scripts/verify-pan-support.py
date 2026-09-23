"""Check the decoded pan support and intact rest against the approved master."""

from pathlib import Path
from PIL import Image, ImageChops, ImageStat

TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'
master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
support = Image.open(TRUTH / 'pan-support.webp').convert('RGBA')
shadow = Image.open(TRUTH / 'pan-shadow.webp').convert('RGBA')
body = Image.open(TRUTH / 'pan-body.webp').convert('RGBA')
assert master.size == (1000, 600)
assert support.size == shadow.size == body.size == (240, 110)

# The rear strip is dark backsplash. These bright pixels formerly formed a
# triangular pan-shaped remnant when the pan was hidden in the room proof.
for point in [(62, 58), (65, 60), (65, 64)]:
    brightness = sum(support.getpixel(point)[:3]) / 3
    assert brightness < 50, f'pan remnant on backsplash at {point}: {brightness:.1f}'

rest = support.copy()
rest.alpha_composite(shadow)
rest.alpha_composite(body)
reference = master.crop((325, 235, 565, 345))
mae = sum(ImageStat.Stat(ImageChops.difference(reference, rest.convert('RGB'))).mean) / 3
assert mae < 4, f'pan rest differs from approved master: {mae:.3f}'
print(f'Pan support decodes cleanly; rear backsplash clear; approved rest MAE {mae:.3f}')
