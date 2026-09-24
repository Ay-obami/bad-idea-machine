#!/usr/bin/env python3
"""Check the new visible face and contact remain separate local layers."""
from pathlib import Path
from PIL import Image

truth = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'
master = Image.open(truth / 'approved-master.webp')
master.load()
rest = Image.open(truth / 'plate-truth-atlas.webp')
rest.load()
tilt = Image.open(truth / 'plate-tilt-atlas.webp').convert('RGBA')
tilt.load()

assert master.size == (1000, 600)
assert rest.size == (288, 125)
assert tilt.size == (166, 40), 'two 82×40 layers with a 2px gutter'
assert len((truth / 'plate-tilt-atlas.webp').read_bytes()) == 8 + int.from_bytes(
    (truth / 'plate-tilt-atlas.webp').read_bytes()[4:8], 'little'
), 'truncated plate tilt asset'

face = tilt.crop((0, 0, 82, 40))
shadow = tilt.crop((84, 0, 166, 40))
face_box = face.getchannel('A').getbbox()
shadow_box = shadow.getchannel('A').getbbox()
assert face_box and face_box[2] - face_box[0] >= 70 and face_box[3] - face_box[1] >= 22, (
    'stressed plate must expose a legible face at room scale'
)
assert shadow_box and shadow_box != face_box, 'contact must be independent of the face'
assert all(p[:3] == (31, 20, 13) for p in shadow.get_flattened_data() if p[3]), (
    'contact layer must contain shading only'
)
center = face.getpixel((40, 17))
assert center[3] > 220 and 95 < center[0] < 225 and center[0] > center[1] > center[2], (
    'visible plate face must read as warm ceramic'
)
assert not face.getchannel('A').getpixel((0, 0)), 'no rectangular face backing'
assert not shadow.getchannel('A').getpixel((0, 0)), 'no rectangular contact backing'
print('Plate tilt atlas decodes: separate ceramic face and clean contact shadow')
