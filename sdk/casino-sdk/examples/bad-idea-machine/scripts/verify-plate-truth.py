#!/usr/bin/env python3
"""Verify the on-disk plate atlas against the approved Kitchen photograph."""
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
from importlib.util import module_from_spec, spec_from_file_location
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.dont_write_bytecode = True
spec = spec_from_file_location('build_plate_truth', ROOT/'scripts/build-plate-truth.py')
assert spec and spec.loader
build = module_from_spec(spec)
spec.loader.exec_module(build)
master = Image.open(build.MASTER)
master.load()
atlas = Image.open(build.DEST)
atlas.load()
assert master.size == (1000,600) and atlas.size == (288,125)
assert master.format == atlas.format == 'WEBP'
for file in (build.MASTER, build.DEST, ROOT/'public/rooms/kitchen/rebuild/truth/towel-truth-atlas.webp'):
    data = file.read_bytes()
    assert len(data) == 8 + int.from_bytes(data[4:8], 'little'), f'truncated WebP: {file}'

parts = {}
for name, (sx, sy, sw, sh, dx, dy) in build.FRAMES.items():
    frame = atlas.crop((sx, sy, sx+sw, sy+sh)).convert('RGBA')
    if name in ('reference','support'):
        parts[name] = frame
    else:
        assert frame.getchannel('A').getbbox(), f'empty object: {name}'
        registered = Image.new('RGBA', (build.W, build.H), (0,0,0,0))
        registered.alpha_composite(frame, (dx,dy))
        parts[name] = registered

expected = master.crop((build.X, build.Y, build.X+build.W, build.Y+build.H)).convert('RGB')
reference = parts['reference'].convert('RGB')
assert ImageChops.difference(expected, reference).getbbox() is None, 'reference frame changed'
rest = build.composite(parts).convert('RGB')
mae = sum(ImageStat.Stat(ImageChops.difference(rest, expected)).mean)/3
assert mae < 1.2, f'intact plate reconstruction drifted: {mae:.3f}'
assert parts['heroBody'].getchannel('A').getbbox() != parts['stackBody'].getchannel('A').getbbox()
hero_bounds = parts['heroBody'].getchannel('A').getbbox()
stack_bounds = parts['stackBody'].getchannel('A').getbbox()
assert hero_bounds and stack_bounds
# The approved master has successive bright plate rims near y=90, 93 and 97.
# A single top plate may contain the first rim, but the later rims belong to
# the remaining stack even when the hero is hidden.
assert build.Y + hero_bounds[3] <= 96, 'hero body contains a second plate rim'
assert build.Y + stack_bounds[1] <= 93, 'remaining stack loses an upper plate'
for x in range(555, 579):
    for y in range(88, 121):
        assert parts['stackBody'].getchannel('A').getpixel((x-build.X,y-build.Y)) < 64, (
            f'stack body contains left cabinet pixels at {x},{y}'
        )
for shadow in ('heroShadow','stackShadow'):
    assert {p[:3] for p in parts[shadow].get_flattened_data() if p[3]} == {(31,20,13)}, f'{shadow} contains architecture pixels'

# With the upper stack absent, the restored back panel must remain wood-dark,
# rather than leaving pale ceramic ghosts or a plate-colored rectangle.
support = parts['support']
for x, y in ((590,92),(605,103),(626,110)):
    r,g,b,_ = support.getpixel((x-build.X,y-build.Y))
    assert r < 110 and g < 85 and b < 65, f'ceramic ghost in support at {x},{y}'
print(f'Plate atlas decoded, six frames registered, independent shadows clean, approved rest MAE {mae:.3f}')
