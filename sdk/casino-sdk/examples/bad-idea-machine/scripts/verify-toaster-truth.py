"""Decode the local toaster layers and compare their intact rest to the master."""

from pathlib import Path
from PIL import Image, ImageChops, ImageStat

TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'
master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
reference = master.crop((585, 205, 735, 335)).convert('RGBA')
atlas = Image.open(TRUTH / 'toaster-truth-atlas.webp').convert('RGBA')
toast = Image.open(TRUTH / 'toast-truth-atlas.webp').convert('RGBA')
assert master.size == (1000, 600)
assert atlas.size == (180, 235)

frames = {
    'support': ((0, 0, 150, 130), (0, 0)),
    'body': ((0, 132, 90, 204), (35, 42)),
    'cord': ((92, 132, 117, 184), (113, 40)),
    'wallShadow': ((120, 132, 150, 197), (25, 45)),
    'contactShadow': ((0, 207, 90, 225), (35, 100)),
    'reflection': ((92, 207, 167, 228), (35, 108)),
}
parts = {name: atlas.crop(frame) for name, (frame, _) in frames.items()}
support = parts['support']
assert support.getchannel('A').getextrema() == (255, 255)
assert support.getpixel((65, 65))[0] > 135, 'toaster metal remains on wall support'
assert sum(support.getpixel((83, 95))[:3]) < 90, 'toaster base remains on backsplash'
assert support.getpixel((124, 70))[1] > 70, 'power lead remains on outlet support'
assert support.getpixel((65, 118))[0] < 150, 'toaster reflection remains on stone'
assert parts['body'].getchannel('A').getextrema() == (0, 255)
assert parts['body'].getpixel((40, 38))[:3] == reference.getpixel((75, 80))[:3], 'toaster front must retain exact approved pixels'
assert parts['cord'].getchannel('A').getextrema()[0] == 0
assert parts['cord'].getpixel((10, 8))[:3] == reference.getpixel((123, 48))[:3], 'plug must retain exact approved pixels'
assert parts['contactShadow'].getchannel('A').getextrema()[1] < 130
assert parts['wallShadow'].getchannel('A').getextrema()[1] < 130
assert parts['reflection'].getchannel('A').getextrema()[1] > 100

rest = support.copy()
for name in ('wallShadow', 'contactShadow', 'reflection', 'body', 'cord'):
    rest.alpha_composite(parts[name], frames[name][1])
for frame, position in [((124, 132, 150, 154), (47, 30)),
                        ((40, 132, 75, 150), (60, 33)),
                        ((0, 132, 37, 151), (58, 32))]:
    rest.alpha_composite(toast.crop(frame), position)
mae = sum(ImageStat.Stat(ImageChops.difference(reference.convert('RGB'), rest.convert('RGB'))).mean) / 3
assert mae < 4.8, f'toaster and toast rest drifted from approved master: {mae:.3f}'
print(f'Toaster support, body, cord, two shadows and reflection decode; approved rest MAE {mae:.3f}')
