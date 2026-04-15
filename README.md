# @magic-spells/image-zoom

Pinch-to-zoom and pan web component for images. Mobile-first, light-DOM, no dependencies.

🔍 **[Live Demo](https://magic-spells.github.io/image-zoom/demo/)** - See it in action!

## Install

```sh
npm install @magic-spells/image-zoom
```

## Usage

```js
import '@magic-spells/image-zoom';
import '@magic-spells/image-zoom/css';
```

```html
<image-zoom min="1" max="3">
  <img src="photo.jpg" alt="" />
</image-zoom>
```

- Mobile: two-finger pinch to zoom, one-finger drag to pan when zoomed.
- Desktop: double-click to toggle between `min` and `max`.
- Rubber-band resistance when pinching below `min` or above `max`, with animated snap-back on release.

## Attributes

| Attribute | Default | Description |
|---|---|---|
| `min` | `1` | Minimum scale multiplier. `1` = image fills the container (contain-fit). |
| `max` | `3` | Maximum scale multiplier. |

## Events

| Event | Detail | Description |
|---|---|---|
| `image-zoom:zoomstart` | `{ scale }` | Pinch gesture begins. |
| `image-zoom:zoomend` | `{ scale }` | Gesture has ended and settled. |
| `image-zoom:change` | `{ scale, translateX, translateY }` | Any transform update (fires frequently during gestures). |

## Public API

```js
const el = document.querySelector('image-zoom');
el.scale;           // current scale (number)
el.min;             // minimum scale
el.max;             // maximum scale
el.reset();         // animate back to min, recentered
el.zoomTo(2);       // animate to a specific scale
el.zoomTo(2, { animate: false });
```

## CSS variables

| Variable | Default | Description |
|---|---|---|
| `--image-zoom-bg` | `#000` | Background color of the container |
| `--image-zoom-radius` | `0` | Border radius |
| `--image-zoom-aspect` | `4 / 3` | `aspect-ratio` of the container |
| `--image-zoom-cursor` | `grab` | Cursor when idle |
| `--image-zoom-cursor-active` | `grabbing` | Cursor when gesturing / zoomed |
| `--image-zoom-transition-duration` | `300ms` | Snap-back animation duration |
| `--image-zoom-transition-easing` | `cubic-bezier(0.22, 1, 0.36, 1)` | Snap-back easing |

## License

MIT

---

<p align="center">
  Made by <a href="https://github.com/coryschulz">Cory Schulz</a>
</p>
