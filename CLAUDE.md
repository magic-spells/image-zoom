# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run build` - Build the component for production
- `npm run dev` - Start development server with live reload
- `npm run serve` - Alias for dev command
- `npm run lint` - Run ESLint for code linting
- `npm run format` - Format all files with Prettier

## Code Style Guidelines
- **File Structure**: Web components in `src/components/`, styles in `src/` (plain CSS, no preprocessors)
- **Exports**: ES Modules with named exports
- **Imports**: Order imports by: 1) styles 2) components 3) utilities
- **JavaScript**: Private class fields with `#` prefix, JSDoc comments on methods
- **Formatting**: Tabs for indentation, trailing semicolons
- **Naming**: Kebab-case for components, camelCase for methods/properties

## Design Decisions
- **Two input paths, one gesture state**: Touch events drive the multi-finger path; non-touch pointer events drive mouse/pen. Pointer handlers explicitly skip `event.pointerType === 'touch'` so the two paths don't double-fire. Both paths share a `Map<id, {x,y}>` and a `mode` string (`'idle' | 'pan' | 'pinch'`).
- **`transform-origin: 0 0`**: The inner `<img>` uses a top-left origin so the anchor-point math stays linear: `newTranslate = midpoint - (startMidpoint - startTranslate) * (scale / startScale)`.
- **`scale = 1` means contain-fit**: On load the component computes a `baseScale` that fits the image inside the container without cropping. The user-facing `scale` is multiplied by this base, so `min=1` means "fills the container".
- **`touch-action` is dynamic**: Default is `pan-y` so users can still scroll the page with one finger over an unzoomed image. It switches to `none` via `image-zoom[zoomed]` / `image-zoom[gesturing]` as soon as the component owns the gesture. **Known limitation:** if a user starts a one-finger vertical scroll while unzoomed and then lands a second finger, the browser may have already latched onto the scroll and the pinch handoff won't always transfer. Mid-scroll pinch takeover is not supported.
- **`ResizeObserver` on the host**: Handles window resizes, tab/accordion reveals, and any ancestor layout change. It also covers the "mounted hidden, then shown" case where `getBoundingClientRect()` was initially zero — the observer fires when the host becomes non-zero and `#onResize` runs the first-time fit.
- **Readiness is atomic**: `#recomputeBaseScale()` assigns `#imgNaturalWidth`/`Height`/`#baseScale` only after both natural dimensions *and* a non-zero container rect are available. This way `#isReady()` is never true with a stale default `baseScale`.
- **Rubber-band resistance**: `sqrt(over) * 0.25 * min` when pinching below min, symmetric above max. Scale is capped at `min * 0.8` and `max * 1.25`. Same sqrt-based family used in `bottom-sheet`.
- **Transition only on settle**: The `[transitioning]` attribute is only set inside `#animateTo`. `#animateTo` is called from `#settle` (gesture release) and `#commitZoom` (which wraps `reset`, `zoomTo`, and double-tap). `#animateTo` early-returns on a no-op target, so `[transitioning]` never sticks when writing an identical transform. During active pinch/pan there is no CSS transition — updates land on the next frame.
- **Touch `preventDefault` is gated by gesture mode**: `#onTouchStart` and `#onTouchMove` only call `event.preventDefault()` when the gesture is actually in `pinch` mode (≥2 fingers) or `pan` mode (single finger while zoomed). Otherwise the browser keeps the default pan-y behavior so the page stays scrollable over an unzoomed image.
- **Cancel paths unwind cleanly**: `touchcancel` is bound to `#onTouchEnd`, which checks `event.type` and skips the tap-detection and pinch-to-pan re-seed branches when cancelled — a cancelled touch never synthesizes a double-tap. `pointercancel` is bound to `#onPointerUp`, same cleanup as a normal up.
- **Double-tap detection**: a tap counts when `previousSize === 1 && !#tapMoved` on `touchend`. Two consecutive taps register as a double-tap if they fall within `300ms` AND their distance² is `< 400` (≈20 CSS px radius). `#tapMoved` is set when the finger drifts more than `√100 ≈ 10 CSS px` during `touchmove`.
- **Single image assumption**: `queryDOM()` calls `this.querySelector('img')`. The component assumes exactly one image child and does not re-run when `img.src` changes after mount.
- **Disconnect clears gesture state**: `disconnectedCallback` clears the pointer map, resets `mode` to `idle`, resets tap state, cancels any pending resize rAF, disconnects the `ResizeObserver`, and drops the `gesturing`/`transitioning` attributes so reconnecting the same node doesn't resume from a stale interaction.

## Elements
| Element | Class | Description |
|---|---|---|
| `<image-zoom>` | `ImageZoom` | Root container with pinch-zoom + pan behavior |

## Attributes (author-provided)
| Attribute | Default | Description |
|---|---|---|
| `min` | `1` | Minimum scale multiplier (1 = contain-fit) |
| `max` | `3` | Maximum scale multiplier |

## Attributes (set by the component)
These are the public styling hooks. Consumers target them via `image-zoom[zoomed]`, etc.

| Attribute | When it's set | Purpose |
|---|---|---|
| `zoomed` | While `#scale > min + 0.001` | Style the container as "currently zoomed" (cursor, touch-action, etc.) |
| `gesturing` | Between `#beginPinch`/`#beginPan` and the matching end | Style during an active gesture; also flips `touch-action` to `none` |
| `transitioning` | During a CSS-animated settle or programmatic zoom | Enables the `transform` transition on the inner `<img>` |

## Events
| Event | Detail | Description |
|---|---|---|
| `image-zoom:zoomstart` | `{ scale }` | A pinch gesture begins, or a programmatic `reset()` / `zoomTo()` / double-tap is about to change the transform. Suppressed when the call is a no-op (target already equals current state). |
| `image-zoom:zoomend` | `{ scale }` | A pinch gesture has settled, or a programmatic transform change has been committed. Fires immediately after the commit, not after the CSS transition completes. Also suppressed on no-op calls. |
| `image-zoom:change` | `{ scale, translateX, translateY }` | Any transform write. Fires frequently during gestures. Does NOT fire when `#animateTo` or `#commitZoom` early-returns on a no-op target. |

## Public API
- `element.min`, `element.max`, `element.scale`, `element.translateX`, `element.translateY` — getters (all readonly)
- `element.reset({ animate = true })` — animate back to `min` and recenter
- `element.zoomTo(scale, { animate = true })` — animate to a specific scale, container-center anchored

Note: neither method returns a value. Both are no-ops when `#isReady()` is false (image not yet loaded / container still zero-sized). Both go through `#commitZoom`, which short-circuits when the target equals the current transform — no events fire in that case.

## CSS Custom Properties
Defined on `:root` in `src/image-zoom.css`. All consumer-overridable.

| Variable | Default | Description |
|---|---|---|
| `--image-zoom-bg` | `#000` | Container background |
| `--image-zoom-radius` | `0` | Container border-radius |
| `--image-zoom-aspect` | `4 / 3` | Container `aspect-ratio` |
| `--image-zoom-cursor` | `grab` | Cursor when idle |
| `--image-zoom-cursor-active` | `grabbing` | Cursor when `[gesturing]` or `[zoomed]` |
| `--image-zoom-transition-duration` | `300ms` | Settle-animation duration |
| `--image-zoom-transition-easing` | `cubic-bezier(0.22, 1, 0.36, 1)` | Settle-animation easing |

## Example Structure
```html
<image-zoom min="1" max="3">
  <img src="photo.jpg" alt="" />
</image-zoom>
```
