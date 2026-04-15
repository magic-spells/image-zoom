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
- **Pointer events**: Uses pointer events (not touch events) with a `Map<pointerId, {x,y}>` so desktop and mobile share one code path. Two pointers enter pinch mode, one pointer enters pan mode.
- **`transform-origin: 0 0`**: The inner `<img>` uses a top-left origin so the anchor-point math stays linear: `newTranslate = midpoint - (startMidpoint - startTranslate) * (scale / startScale)`.
- **`scale = 1` means contain-fit**: On load the component computes a `baseScale` that fits the image inside the container without cropping. The user-facing `scale` is multiplied by this base, so `min=1` means "fills the container".
- **`touch-action: none`** on the host suppresses browser-default pinch and panning so we can own the gesture.
- **Rubber-band resistance**: `sqrt(over) * 0.25 * min` when pinching below min, symmetric above max. Scale is capped at `min * 0.8` and `max * 1.25`. Same sqrt-based family used in `bottom-sheet`.
- **Transition only on settle**: The `[transitioning]` attribute is only set during `#animateTo` (called from `reset`/`zoomTo`/`#settle`/double-click). During active pinch/pan there is no CSS transition — updates land on the next frame.
- **Single image assumption**: `queryDOM()` calls `this.querySelector('img')`. The component assumes exactly one image child.

## Elements
| Element | Class | Description |
|---|---|---|
| `<image-zoom>` | `ImageZoom` | Root container with pinch-zoom + pan behavior |

## Attributes
| Attribute | Default | Description |
|---|---|---|
| `min` | `1` | Minimum scale multiplier (1 = contain-fit) |
| `max` | `3` | Maximum scale multiplier |

## Events
| Event | Detail | Description |
|---|---|---|
| `image-zoom:zoomstart` | `{ scale }` | Fired when a pinch gesture begins |
| `image-zoom:zoomend` | `{ scale }` | Fired after a gesture settles |
| `image-zoom:change` | `{ scale, translateX, translateY }` | Fired on every transform update |

## Public API
- `element.min`, `element.max`, `element.scale`, `element.translateX`, `element.translateY` — getters
- `element.reset({ animate = true })` — animate back to `min` and recenter
- `element.zoomTo(scale, { animate = true })` — animate to a specific scale, container-center anchored

## Example Structure
```html
<image-zoom min="1" max="3">
  <img src="photo.jpg" alt="" />
</image-zoom>
```
