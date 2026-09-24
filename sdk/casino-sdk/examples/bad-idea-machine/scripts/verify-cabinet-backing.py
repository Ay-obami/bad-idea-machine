#!/usr/bin/env python3
"""Check the proposed unseen backing without treating it as approved master art."""

from pathlib import Path
from PIL import Image, ImageChops, ImageStat

TRUTH = Path(__file__).resolve().parents[1] / 'public/rooms/kitchen/rebuild/truth'
master = Image.open(TRUTH / 'approved-master.webp').convert('RGB')
backing = Image.open(TRUTH / 'cabinet-backing-proposal.webp').convert('RGB')
backing.load()
assert backing.size == (205, 173)
assert ImageChops.difference(backing, master.crop((565, 0, 770, 173))).getbbox(), 'backing cannot be the intact cabinet'
assert min(ImageStat.Stat(backing.crop((15, 15, 190, 140))).mean) > 85, 'backing cannot be an unfilled dark patch'
edge = ImageChops.difference(backing.crop((0, 172, 205, 173)), master.crop((565, 173, 770, 174)))
assert max(ImageStat.Stat(edge).mean) < 12, 'backing must meet the approved backsplash below it'
print('Proposed cabinet backing decodes at 205x173, is distinct from the master cabinet and meets the photographed backsplash')
