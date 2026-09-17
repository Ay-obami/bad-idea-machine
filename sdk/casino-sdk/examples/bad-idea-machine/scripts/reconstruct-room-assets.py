from __future__ import annotations

import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOMS = {
    "kitchen": ([1, 2, 3, 4, 5, 6], ["before", "0x", "1_2x", "3x", "10x", "100x"]),
    "garage": ([7, 8, 9, 10, 11, 12], ["before", "0x", "1_2x", "3x", "10x", "100x"]),
}

KITCHEN_OBJECTS = [
    ("pan", 0, 0),
    ("toaster", 1, 0),
    ("toast", 2, 0),
    ("kettle", 0, 1),
    ("cabinet-right", 1, 1),
    ("plates", 2, 1),
    ("ball", 0, 2),
    ("rocket", 1, 2),
    ("safe", 2, 2),
]

GARAGE_OBJECTS = [
    ("hammer", 0, 0),
    ("wrench", 1, 0),
    ("drill", 2, 0),
    ("saw", 3, 0),
    ("chain", 0, 1),
    ("tire", 1, 1),
    ("toolbox", 2, 1),
    ("shelf", 3, 1),
    ("tank", 0, 2),
    ("rocket", 1, 2),
    ("safe", 2, 2),
]


def run(*args: str) -> None:
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def key_green(cell: Image.Image) -> Image.Image:
    source = np.array(cell.convert("RGB"), dtype=np.int16)
    red = source[:, :, 0]
    green = source[:, :, 1]
    blue = source[:, :, 2]
    maximum_other = np.maximum(red, blue)

    background = (
        (green >= 150)
        & ((green - maximum_other) >= 70)
        & (green >= red * 1.45)
        & (green >= blue * 1.45)
    )

    # Pull residual chroma spill toward the local object colour at opaque edges.
    spill = (~background) & (green > red) & (green > blue) & ((green - maximum_other) > 25)
    output = source.copy()
    output[:, :, 1] = np.where(spill, maximum_other + 12, green)
    alpha = np.where(background, 0, 255).astype(np.uint8)
    rgba = np.dstack([np.clip(output, 0, 255).astype(np.uint8), alpha])
    return Image.fromarray(rgba, "RGBA")


def object_from_cell(
    sheet: Image.Image,
    column: int,
    row: int,
    cell_width: int,
    cell_height: int,
) -> Image.Image:
    cell = sheet.crop(
        (
            column * cell_width,
            row * cell_height,
            (column + 1) * cell_width,
            (row + 1) * cell_height,
        )
    )
    keyed = key_green(cell)
    bbox = keyed.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"empty room-object cell {column},{row}")

    x0, y0, x1, y1 = bbox
    padding = 8
    obj = keyed.crop(
        (
            max(0, x0 - padding),
            max(0, y0 - padding),
            min(cell_width, x1 + padding),
            min(cell_height, y1 + padding),
        )
    )

    scale = 360 / max(obj.size)
    size = (
        max(1, round(obj.width * scale)),
        max(1, round(obj.height * scale)),
    )
    return obj.resize(size, Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, path: Path, quality: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(
        path,
        "WEBP",
        quality=quality,
        method=4,
        exact=image.mode == "RGBA",
    )


def main(seed_dir: Path, output_dir: Path) -> None:
    temporary = Path(tempfile.mkdtemp(prefix="bad-idea-machine-art-"))
    try:
        frames = temporary / "frames"
        frames.mkdir()
        run(
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(seed_dir / "rooms.mkv"),
            "-vsync",
            "0",
            str(frames / "%02d.png"),
        )

        room_frames = {
            index: Image.open(frames / f"{index:02d}.png").convert("RGB")
            for index in range(1, 13)
        }

        for room, (frame_numbers, state_names) in ROOMS.items():
            for frame_number, state_name in zip(frame_numbers, state_names):
                frame = room_frames[frame_number]
                gallery = ImageOps.fit(
                    frame,
                    (720, 900),
                    method=Image.Resampling.LANCZOS,
                    centering=(0.5, 0.5),
                )
                save_webp(gallery, output_dir / room / "gallery" / f"{state_name}.webp", 88)

                if state_name == "before":
                    stage = ImageOps.fit(
                        frame,
                        (1000, 600),
                        method=Image.Resampling.LANCZOS,
                        centering=(0.5, 0.5),
                    )
                    save_webp(stage, output_dir / room / "stage" / "clean.webp", 90)
                else:
                    aftermath = ImageOps.fit(
                        frame,
                        (1024, 614),
                        method=Image.Resampling.LANCZOS,
                        centering=(0.5, 0.5),
                    )
                    save_webp(
                        aftermath,
                        output_dir / room / "aftermath" / f"{state_name}.webp",
                        90,
                    )

        object_sheets = [
            ("kitchen", 3, KITCHEN_OBJECTS),
            ("garage", 4, GARAGE_OBJECTS),
        ]
        for room, columns, objects in object_sheets:
            sheet_path = temporary / f"{room}.png"
            run(
                "ffmpeg",
                "-y",
                "-loglevel",
                "error",
                "-i",
                str(seed_dir / f"{room}.mkv"),
                "-frames:v",
                "1",
                str(sheet_path),
            )
            sheet = Image.open(sheet_path).convert("RGB")
            cell_width = sheet.width // columns
            cell_height = sheet.height // 3

            for name, column, row in objects:
                obj = object_from_cell(sheet, column, row, cell_width, cell_height)
                save_webp(obj, output_dir / room / "objects" / f"{name}.webp", 95)
    finally:
        shutil.rmtree(temporary, ignore_errors=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("seed_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    arguments = parser.parse_args()
    main(arguments.seed_dir, arguments.output_dir)
