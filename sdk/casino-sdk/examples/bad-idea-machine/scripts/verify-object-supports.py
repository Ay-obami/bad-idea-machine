"""Decode the toast/towel atlases and check the static support separation."""

from pathlib import Path

from PIL import Image, ImageChops, ImageStat


TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'
toast = Image.open(TRUTH/'toast-truth-atlas.webp').convert('RGBA')
towel = Image.open(TRUTH/'towel-truth-atlas.webp').convert('RGBA')
assert toast.size == (304, 165) and towel.size == (252, 325)

toast_support = toast.crop((152, 0, 302, 130))
remaining = toast.crop((124, 132, 150, 154))
assert remaining.getchannel('A').getbbox(), 'the second toast slice has no independent pixels'
assert sum(toast_support.getpixel((59, 38))[:3])/3 > 115, 'toast tip remains in empty toaster support'
assert sum(toast_support.getpixel((55, 42))[:3])/3 > 110, 'toast edge remains in empty toaster support'

rest = toast_support.copy()
rest.alpha_composite(remaining, (47, 30))
rest.alpha_composite(toast.crop((40, 132, 75, 150)), (60, 33))
rest.alpha_composite(toast.crop((0, 132, 37, 151)), (58, 32))
reference = toast.crop((0, 0, 150, 130)).convert('RGB')
toast_error = sum(ImageStat.Stat(ImageChops.difference(reference, rest.convert('RGB'))).mean)/3
assert toast_error < 3.2, f'toast intact rest differs from approved crop: {toast_error:.3f}'

towel_support = towel.crop((127, 0, 252, 175))
assert sum(towel_support.getpixel((23, 28))[:3])/3 < 130, 'towel trace remains on oven handle'
assert sum(towel_support.getpixel((22, 100))[:3])/3 < 95, 'towel trace remains on oven door'

print(f'Toast and towel supports decode cleanly; independent second slice intact; toast rest MAE {toast_error:.3f}')
