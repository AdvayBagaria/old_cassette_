#!/usr/bin/env python3
import os
import shutil
import sys
from pathlib import Path


def create_clean_deployment(source_dir: str = ".", dest_dir: str = "dist") -> None:
    source = Path(source_dir).resolve()
    dest = Path(dest_dir)

    SAFE_PREFIXES = {
        str(Path(source_dir).resolve()),
        str(Path.cwd().resolve()),
        str(Path.home().resolve()),
    }
    if not any(str(source).startswith(strip) for strip in SAFE_PREFIXES):
        raise ValueError("Source directory is outside the project tree.")

    dest_resolved = dest.resolve()
    source_resolved = source.resolve()
    if dest_resolved == source_resolved or dest_resolved in source_resolved.parents:
        raise ValueError(
            f"Error: Destination directory '{dest_resolved}' cannot be the source "
            f"directory '{source_resolved}' or any of its parents."
        )

    public_files = [
        "index.html",
        "main.bin",
        "solve.py",
        "Old_Cassette_Writeup_.pdf",
        "README.md",
        ".nojekyll",
    ]
    public_dirs = [
        ".github/workflows",
    ]

    emoji = sys.stdout.encoding.lower() not in ("ascii", "cp1252")

    def eprint(*args):
        msg = " ".join(str(a) for a in args)
        try:
            print(msg)
        except UnicodeEncodeError:
            print(msg.encode(sys.stdout.encoding, errors="replace").decode(sys.stdout.encoding))

    if dest.exists():
        eprint("Cleaning old deployment directory:", dest)
        shutil.rmtree(dest)
    dest.mkdir(parents=True, exist_ok=True)

    eprint("Creating clean deployment in", dest, "/")
    copied_count = 0
    missing_files = []

    for file in public_files:
        src_file = source / file
        if src_file.exists():
            dest_file = dest / file
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dest_file)
            eprint("  OK", file)
            copied_count += 1
        else:
            eprint("  MISSING", file)
            missing_files.append(file)

    if missing_files:
        raise FileNotFoundError(
            "Build failed: The following required deployment assets were not found in "
            "the source repository: " + ", ".join(missing_files)
        )

    for dir_name in public_dirs:
        src_dir_path = source / dir_name
        if src_dir_path.exists():
            dest_dir_path = dest / dir_name
            shutil.copytree(src_dir_path, dest_dir_path, dirs_exist_ok=True)
            eprint("  OK", dir_name, "/")
            copied_count += 1

    eprint("\nDeployment complete:", copied_count, "items copied")
    eprint("\nDeployment size:")
    total_size = sum(f.stat().st_size for f in dest.rglob("*") if f.is_file())
    size_mb = total_size / (1024 * 1024)
    eprint(f"  {size_mb:.2f} MB")

    eprint("\nDeployment contents:")
    for item in sorted(dest.rglob("*")):
        if item.is_file():
            rel_path = item.relative_to(dest)
            size = item.stat().st_size
            eprint("  ", rel_path, f"({size} bytes)")

    eprint("\nReady to deploy!")
    eprint("  Upload contents of", dest, "/ to GitHub Pages")


if __name__ == "__main__":
    create_clean_deployment()
