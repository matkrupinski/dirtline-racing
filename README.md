# Dirtline

A compact Three.js foundation for a single-player, low-poly dirt racing game. It follows the supplied reference with an elevated chase camera, a warm late-afternoon palette, simple roadside stalls and tents, and a bottom telemetry bar inspired by arcade racers.

## Run locally

```bash
pnpm install
pnpm dev
```

The project uses Vite + TypeScript. Open the local URL printed by Vite, then drive with **WASD** or the **Arrow keys**.

## Controls

| Input | Action |
| --- | --- |
| `W` / `ArrowUp` | Accelerate |
| `S` / `ArrowDown` | Brake / reverse near rest |
| `A` / `ArrowLeft` | Steer left |
| `D` / `ArrowRight` | Steer right |

## Architecture

```text
src/
├── main.ts                    # renderer, scene loop, resize handling
├── game/racing/
│   ├── input.ts               # keyboard state abstraction
│   ├── vehicle.ts             # car model + acceleration, drag, grip, drift
│   ├── camera.ts              # elevated, damped chase camera
│   ├── world.ts               # track, lighting, stalls, tents, banners, props
│   └── hud.ts                 # HTML overlay telemetry updates
└── styles/main.css            # warm reference-inspired HUD and layout
```

## Tuning points

- **Vehicle feel:** edit the constants in `Vehicle.update()` for engine force, drag, side grip, steering authority, and speed cap.
- **Camera framing:** edit the follow distance/height in `ChaseCamera`.
- **Track dressing:** add or rearrange roadside props in `RaceWorld.buildRoadsideProps()`.
- **HUD:** keep gameplay state in `Vehicle`; `RacingHud` is intentionally a thin DOM view.

The controller intentionally uses lightweight arcade dynamics rather than a rigid-body physics engine: longitudinal acceleration, rolling drag, speed-sensitive steering, and reduced lateral tire grip while turning at speed create a simple controllable slide. The module boundaries leave room for checkpoints, lap timing, alternate tracks, AI, audio, or a fuller physics layer later.

## Notes

- The project keeps the Vite/Three.js starter tooling already present in the workspace.
- `public/manus-routes.json` exposes the single `/` route for the local web runtime.
- No external art assets are required; all visible geometry is generated from flat-shaded Three.js primitives.
