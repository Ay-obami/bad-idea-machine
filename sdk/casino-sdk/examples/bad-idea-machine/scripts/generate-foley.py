from __future__ import annotations

import argparse
import math
import random
import struct
import wave
from pathlib import Path

RATE = 22_050
TAU = math.tau


def clamp(value: float) -> float:
    return max(-1.0, min(1.0, value))


def mix(*tracks: list[float]) -> list[float]:
    length = max((len(track) for track in tracks), default=0)
    out = [0.0] * length
    for track in tracks:
        for index, value in enumerate(track):
            out[index] += value
    return out


def normalize(samples: list[float], peak: float = 0.9) -> list[float]:
    maximum = max((abs(value) for value in samples), default=1.0)
    scale = peak / maximum if maximum > peak else 1.0
    return [clamp(value * scale) for value in samples]


def silence(seconds: float) -> list[float]:
    return [0.0] * max(1, int(seconds * RATE))


def noise(seconds: float, seed: int, gain: float = 1.0, highpass: float = 0.0) -> list[float]:
    rng = random.Random(seed)
    count = max(1, int(seconds * RATE))
    raw = [rng.uniform(-1.0, 1.0) for _ in range(count)]
    if highpass <= 0:
        return [value * gain for value in raw]
    coefficient = min(0.98, max(0.02, highpass))
    previous_input = 0.0
    previous_output = 0.0
    out: list[float] = []
    for value in raw:
        filtered = coefficient * (previous_output + value - previous_input)
        previous_input = value
        previous_output = filtered
        out.append(filtered * gain)
    return out


def resonances(seconds: float, frequencies: tuple[float, ...], decay: float, gain: float, seed: int) -> list[float]:
    rng = random.Random(seed)
    phases = [rng.random() * TAU for _ in frequencies]
    count = max(1, int(seconds * RATE))
    out: list[float] = []
    for index in range(count):
        t = index / RATE
        envelope = math.exp(-decay * t)
        value = sum(math.sin(TAU * frequency * t + phase) for frequency, phase in zip(frequencies, phases))
        out.append(value / max(1, len(frequencies)) * envelope * gain)
    return out


def thump(seconds: float, frequency: float, decay: float, gain: float) -> list[float]:
    count = max(1, int(seconds * RATE))
    out: list[float] = []
    for index in range(count):
        t = index / RATE
        sweep = frequency * (1.0 - 0.45 * min(1.0, t / max(seconds, 0.001)))
        out.append(math.sin(TAU * sweep * t) * math.exp(-decay * t) * gain)
    return out


def burst_track(seconds: float, seed: int, count: int, body: callable, gain: float = 1.0) -> list[float]:
    rng = random.Random(seed)
    out = silence(seconds)
    latest = max(0.02, seconds - 0.08)
    for burst_index in range(count):
        at = rng.uniform(0.0, latest)
        fragment = body(seed + burst_index * 101)
        offset = int(at * RATE)
        for index, value in enumerate(fragment):
            if offset + index >= len(out):
                break
            out[offset + index] += value * gain
    return out


def fade(samples: list[float], attack: float = 0.005, release: float = 0.08) -> list[float]:
    attack_frames = max(1, int(attack * RATE))
    release_frames = max(1, int(release * RATE))
    total = len(samples)
    out = samples[:]
    for index in range(min(attack_frames, total)):
        out[index] *= index / attack_frames
    for offset in range(min(release_frames, total)):
        index = total - 1 - offset
        out[index] *= offset / release_frames
    return out


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = normalize(fade(samples))
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(b''.join(struct.pack('<h', int(clamp(value) * 32767)) for value in pcm))


def spring_pop(seed: int) -> list[float]:
    click = noise(0.055, seed, 0.8, 0.75)
    ring = resonances(0.32, (620, 980, 1480), 12.0, 0.7, seed + 1)
    low = thump(0.18, 105, 16.0, 0.35)
    return mix(click, ring, low)


def metal_hit(seed: int, bright: bool = False) -> list[float]:
    freqs = (420, 770, 1330, 2140) if bright else (210, 410, 760, 1180)
    return mix(noise(0.07, seed, 0.7, 0.72), resonances(0.62, freqs, 7.0, 0.95, seed + 1), thump(0.22, 82, 14.0, 0.45))


def ceramic(seed: int) -> list[float]:
    def shard(local_seed: int) -> list[float]:
        rng = random.Random(local_seed)
        base = rng.uniform(1700, 3100)
        return mix(noise(0.035, local_seed, 0.75, 0.82), resonances(0.16, (base, base * 1.43), 20.0, 0.72, local_seed + 1))
    return mix(noise(0.09, seed, 0.55, 0.76), burst_track(0.75, seed + 2, 13, shard, 0.8))


def hiss(seconds: float, seed: int, gain: float = 0.55) -> list[float]:
    track = noise(seconds, seed, gain, 0.93)
    count = len(track)
    return [value * min(1.0, index / (RATE * 0.08)) * min(1.0, (count - index) / (RATE * 0.18)) for index, value in enumerate(track)]


def motor(seconds: float, seed: int, base: float, teeth: float) -> list[float]:
    rng = random.Random(seed)
    count = int(seconds * RATE)
    out: list[float] = []
    for index in range(count):
        t = index / RATE
        wobble = 1.0 + 0.035 * math.sin(TAU * 5.4 * t)
        phase = TAU * base * wobble * t
        buzz = math.sin(phase) + 0.48 * math.sin(phase * 2.03) + 0.24 * math.sin(TAU * teeth * t)
        grit = rng.uniform(-1.0, 1.0) * 0.22
        envelope = min(1.0, t / 0.08) * min(1.0, (seconds - t) / 0.11)
        out.append((buzz * 0.27 + grit) * envelope)
    return out


def chain(seed: int) -> list[float]:
    def link(local_seed: int) -> list[float]:
        return metal_hit(local_seed, bright=True)[: int(0.18 * RATE)]
    return burst_track(1.05, seed, 12, link, 0.72)


def tire(seed: int) -> list[float]:
    out = silence(1.1)
    for n, at in enumerate((0.0, 0.34, 0.61, 0.82)):
        fragment = mix(thump(0.28, 58 + n * 4, 12 + n * 2, 0.92 / (1 + n * .25)), noise(0.065, seed + n, 0.2, 0.35))
        offset = int(at * RATE)
        for index, value in enumerate(fragment):
            if offset + index >= len(out):
                break
            out[offset + index] += value
    return out


def wood_crack(seed: int) -> list[float]:
    return mix(noise(0.16, seed, 0.9, 0.45), resonances(0.5, (118, 246, 410), 10.0, 0.54, seed + 1), thump(0.25, 72, 14.0, 0.55))


def heavy_crash(seed: int) -> list[float]:
    def debris(local_seed: int) -> list[float]:
        return mix(noise(0.06, local_seed, 0.55, 0.56), resonances(0.15, (160, 360, 710), 17.0, 0.35, local_seed + 1))
    return mix(thump(0.8, 54, 6.8, 1.0), noise(0.42, seed, 0.56, 0.24), resonances(1.15, (92, 187, 372), 4.2, 0.65, seed + 1), burst_track(1.25, seed + 2, 10, debris, 0.75))


def rocket(seed: int) -> list[float]:
    rng = random.Random(seed)
    seconds = 1.3
    count = int(seconds * RATE)
    out: list[float] = []
    previous = 0.0
    for index in range(count):
        t = index / RATE
        raw = rng.uniform(-1, 1)
        previous = previous * 0.82 + raw * 0.18
        rise = min(1.0, t / 0.25)
        rumble = math.sin(TAU * (48 + 24 * t) * t) * 0.22
        out.append((previous * 0.72 + rumble) * rise * min(1.0, (seconds - t) / 0.16))
    return out


def sparks(seed: int) -> list[float]:
    def spark(local_seed: int) -> list[float]:
        rng = random.Random(local_seed)
        freq = rng.uniform(2400, 4800)
        return mix(noise(0.025, local_seed, 0.5, 0.96), resonances(0.07, (freq,), 34.0, 0.5, local_seed + 1))
    return burst_track(0.75, seed, 16, spark, 0.8)


def debris(seed: int) -> list[float]:
    def bit(local_seed: int) -> list[float]:
        rng = random.Random(local_seed)
        freq = rng.uniform(120, 760)
        return mix(noise(0.04, local_seed, 0.36, 0.55), resonances(0.13, (freq, freq * 1.71), 22.0, 0.38, local_seed + 1))
    return burst_track(1.25, seed, 15, bit, 0.85)


def fire(seconds: float, seed: int, quiet: bool = False) -> list[float]:
    rng = random.Random(seed)
    out = noise(seconds, seed, 0.12 if quiet else 0.2, 0.58)
    crackles = 18 if quiet else 28
    for crackle in range(crackles):
        at = rng.uniform(0, max(0.01, seconds - 0.03))
        fragment = noise(rng.uniform(0.012, 0.045), seed + 300 + crackle, 0.3 if quiet else 0.55, 0.9)
        offset = int(at * RATE)
        for index, value in enumerate(fragment):
            if offset + index >= len(out):
                break
            out[offset + index] += value
    return out


def garage_ambience(seed: int) -> list[float]:
    base = noise(4.0, seed, 0.055, 0.36)
    ticks = burst_track(4.0, seed + 1, 7, lambda local_seed: metal_hit(local_seed, True)[: int(.08 * RATE)], 0.14)
    return mix(base, ticks)


def main(output: Path) -> None:
    assets = {
        'kitchen-toaster-pop.wav': spring_pop(101),
        'kitchen-steam-hiss.wav': hiss(1.25, 102),
        'kitchen-ceramic-break.wav': ceramic(103),
        'kitchen-pan-hit.wav': metal_hit(104, bright=True),
        'garage-drill.wav': motor(1.15, 105, 142, 1060),
        'garage-saw.wav': motor(1.15, 106, 188, 1780),
        'garage-chain.wav': chain(107),
        'garage-tire.wav': tire(108),
        'metal-impact.wav': metal_hit(109),
        'wood-crack.wav': wood_crack(110),
        'heavy-crash.wav': heavy_crash(111),
        'rocket-whoosh.wav': rocket(112),
        'sparks-burst.wav': sparks(113),
        'debris-fall.wav': debris(114),
        'fire-crackle.wav': fire(2.4, 115),
        'kitchen-aftermath.wav': mix(fire(4.0, 116, quiet=True), debris(117) + silence(2.75)),
        'garage-aftermath.wav': garage_ambience(118),
    }
    for name, samples in assets.items():
        write_wav(output / name, samples)
    print(f'Generated {len(assets)} foley samples in {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    main(args.output)
