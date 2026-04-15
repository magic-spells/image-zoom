export class ImageZoom extends HTMLElement {
	readonly min: number;
	readonly max: number;
	readonly scale: number;
	readonly translateX: number;
	readonly translateY: number;
	reset(options?: { animate?: boolean }): void;
	zoomTo(scale: number, options?: { animate?: boolean }): void;
}

declare global {
	interface HTMLElementTagNameMap {
		'image-zoom': ImageZoom;
	}

	interface HTMLElementEventMap {
		'image-zoom:change': CustomEvent<{
			scale: number;
			translateX: number;
			translateY: number;
		}>;
		'image-zoom:zoomstart': CustomEvent<{ scale: number }>;
		'image-zoom:zoomend': CustomEvent<{ scale: number }>;
	}
}
