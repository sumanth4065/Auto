# Command: Documentation

Use this after implementing a new behavior or updating existing logic.

## Goal

- Capture only notable changes, not a full dictionary of every function.
- Keep README.md at a high level so engineers can understand the system and onboard quickly.
- Prefer clear inline documentation (JSDoc, comments) where code intent is not obvious.

## Add documentation when

1. README.md is non-existent
2. README.md is outdated
3. Major change (worthy of mentioning) is not reflected in README.md
4. Code clarity of purpose is needed
5. Description of implementation is needed
6. Function misses JSDoc and it's not trivial, simple, or clear
7. Explanation of change is needed, e.g. major/important architecture or business flow is changed

## Skip documentation when

1. Change is minimal and changed areas are already obvious or well-documented.
2. Test-only updates.
3. Dependency bump with no runtime impact.
