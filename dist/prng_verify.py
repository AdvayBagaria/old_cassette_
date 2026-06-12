#!/usr/bin/env python3
from __future__ import annotations

"""Solve helper for the Old Cassette CHIP-8 challenge.

Usage:
    python3 prng_verify.py [path/to/main.bin]

This script verifies the PRNG orbit used by the ROM and prints the
cycle start/length that collapses exponential timing into modular arithmetic.
"""

import argparse
from pathlib import Path

CONSTS: tuple[int, int, int, int] = (0xA9, 0x5C, 0xD3, 0x76)

CHIP8_MEMORY_SIZE = 0x1000
CHIP8_LOAD_OFFSET = 0x200
MAX_ROM_SIZE = CHIP8_MEMORY_SIZE - CHIP8_LOAD_OFFSET
PRNG_MEM_BASE = 0x800
WALK_CYCLE_CAP = 0x10000


def load_rom(path: Path) -> bytes:
    if path.stat().st_size > MAX_ROM_SIZE:
        raise ValueError(f"{path} is too large ({path.stat().st_size} bytes); "
                         f"maximum CHIP-8 ROM size is {MAX_ROM_SIZE} bytes")
    data = path.read_bytes()
    if not data:
        raise ValueError(f"{path} is empty")
    mem = bytearray(CHIP8_MEMORY_SIZE)
    mem[CHIP8_LOAD_OFFSET : CHIP8_LOAD_OFFSET + len(data)] = data
    return bytes(mem)


def step_prng(mem: bytes, va: int, vb: int) -> tuple[int, int]:
    """Exact PRNG state transition used by the ROM's subroutine at 0x2C0."""
    v2, v3 = va & 0xFF, vb & 0xFF

    v0 = mem[PRNG_MEM_BASE + vb]
    v0 ^= vb
    v0 ^= CONSTS[vb >> 6]

    carry = (vb + v0) >> 8
    vb = (vb + v0) & 0xFF
    va = (va + carry) & 0xFF

    for _ in range(5):
        c3 = (v3 >> 7) & 1
        v3 = (v3 << 1) & 0xFF
        c2 = (v2 >> 7) & 1
        v2 = (v2 << 1) & 0xFF
        v2 |= c3
        v3 |= c2

    va ^= v2
    vb ^= v3
    return va & 0xFF, vb & 0xFF


def walk_cycle(mem: bytes, seed: tuple[int, int]) -> tuple[int, int, tuple[int, int]]:
    seen: dict[int, int] = {}
    va, vb = seed[0] & 0xFF, seed[1] & 0xFF
    step = 0

    while True:
        key = (va << 8) | vb
        if key in seen:
            break
        seen[key] = step
        va, vb = step_prng(mem, va, vb)
        step += 1
        if step >= WALK_CYCLE_CAP:
            raise RuntimeError(
                f"PRNG walk exceeded {WALK_CYCLE_CAP} steps without cycle detection"
            )

    return seen[key], step - seen[key], (va, vb)


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify the Old Cassette PRNG cycle.")
    parser.add_argument("rom", nargs="?", default="main.bin", help="Path to main.bin")
    args = parser.parse_args()

    rom_path = Path(args.rom)
    mem = load_rom(rom_path)

    seed = (0xA7, 0xC3)
    cycle_start, cycle_length, repeat_state = walk_cycle(mem, seed)

    print(f"seed = ({seed[0]:02X}, {seed[1]:02X})")
    print(f"first repeat at step = {cycle_start}")
    print(f"cycle length = {cycle_length}")
    print(f"repeat state = ({repeat_state[0]:02X}, {repeat_state[1]:02X})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
