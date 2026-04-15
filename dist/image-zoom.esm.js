/**
 * image-zoom component — pinch-to-zoom and pan for a single contained image.
 *
 * - Pointer events drive both desktop and mobile.
 * - Two pointers → pinch. One pointer → pan (only when zoomed).
 * - `scale = 1` means the image is contain-fit inside the container.
 * - Pinch below min or above max is rubber-banded and snaps back on release.
 *
 * @class ImageZoom
 * @extends HTMLElement
 */
class ImageZoom extends HTMLElement {
	#img;
	#imgNaturalWidth = 0;
	#imgNaturalHeight = 0;
	#baseScale = 1;
	#scale = 1;
	#translateX = 0;
	#translateY = 0;
	#containerRect = null;
	#gesture = {
		mode: 'idle',
		pointers: new Map(),
		startScale: 1,
		startTranslateX: 0,
		startTranslateY: 0,
		startDistance: 0,
		startMidpointX: 0,
		startMidpointY: 0,
	};
	#tapStartX = 0;
	#tapStartY = 0;
	#tapMoved = false;
	#lastTapTime = 0;
	#lastTapX = 0;
	#lastTapY = 0;
	#resizeFrame = 0;
	#resizeObserver = null;

	static get observedAttributes() {
		return ['min', 'max'];
	}

	constructor() {
		super();
		this.handlers = {};
	}

	get min() {
		const value = parseFloat(this.getAttribute('min'));
		return Number.isFinite(value) && value > 0 ? value : 1;
	}

	get max() {
		const value = parseFloat(this.getAttribute('max'));
		return Number.isFinite(value) && value > 0 ? value : 3;
	}

	get scale() {
		return this.#scale;
	}

	get translateX() {
		return this.#translateX;
	}

	get translateY() {
		return this.#translateY;
	}

	/**
	 * Lifecycle — element connected to DOM.
	 */
	connectedCallback() {
		const _ = this;
		_.queryDOM();
		if (!_.#img) return;

		_.#scale = _.min;
		if (_.#img.complete && _.#img.naturalWidth) {
			_.#initialiseFit();
		} else {
			_.#img.addEventListener('load', () => _.#initialiseFit(), { once: true });
		}
		_.attachListeners();
	}

	/**
	 * Lifecycle — element disconnected from DOM.
	 */
	disconnectedCallback() {
		const _ = this;
		_.detachListeners();
		if (_.#resizeFrame) {
			cancelAnimationFrame(_.#resizeFrame);
			_.#resizeFrame = 0;
		}
		_.#gesture.pointers.clear();
		_.#gesture.mode = 'idle';
		_.#tapMoved = false;
		_.#lastTapTime = 0;
		_.removeAttribute('gesturing');
		_.removeAttribute('transitioning');
	}

	/**
	 * Lifecycle — observed attribute changed.
	 * @param {string} name
	 */
	attributeChangedCallback(name) {
		if (!this.#isReady()) return;
		if (name === 'min' || name === 'max') {
			if (this.#scale < this.min) this.reset();
			else if (this.#scale > this.max) this.zoomTo(this.max);
		}
	}

	/**
	 * Find the inner image element.
	 */
	queryDOM() {
		this.#img = this.querySelector('img');
	}

	/**
	 * Bind all event listeners. Touch events drive the multi-touch path
	 * (and Chrome DevTools' Shift+drag pinch simulation); pointer events
	 * drive mouse-only pan.
	 */
	attachListeners() {
		const _ = this;
		_.handlers.touchStart = _.#onTouchStart.bind(_);
		_.handlers.touchMove = _.#onTouchMove.bind(_);
		_.handlers.touchEnd = _.#onTouchEnd.bind(_);
		_.handlers.pointerDown = _.#onPointerDown.bind(_);
		_.handlers.pointerMove = _.#onPointerMove.bind(_);
		_.handlers.pointerUp = _.#onPointerUp.bind(_);
		_.handlers.dblClick = _.#onDoubleClick.bind(_);
		_.handlers.transitionEnd = () => _.removeAttribute('transitioning');

		_.addEventListener('touchstart', _.handlers.touchStart, { passive: false });
		_.addEventListener('touchmove', _.handlers.touchMove, { passive: false });
		_.addEventListener('touchend', _.handlers.touchEnd);
		_.addEventListener('touchcancel', _.handlers.touchEnd);
		_.addEventListener('pointerdown', _.handlers.pointerDown);
		window.addEventListener('pointermove', _.handlers.pointerMove, { passive: false });
		window.addEventListener('pointerup', _.handlers.pointerUp);
		window.addEventListener('pointercancel', _.handlers.pointerUp);
		_.addEventListener('dblclick', _.handlers.dblClick);
		_.addEventListener('transitionend', _.handlers.transitionEnd);

		// ResizeObserver covers window resizes, tab/accordion reveals, and any
		// ancestor layout change — catches the hidden-then-shown init case too.
		_.#resizeObserver = new ResizeObserver(() => _.#onResize());
		_.#resizeObserver.observe(_);
	}

	/**
	 * Remove all event listeners.
	 */
	detachListeners() {
		const _ = this;
		if (!_.handlers.pointerDown) return;
		_.removeEventListener('touchstart', _.handlers.touchStart);
		_.removeEventListener('touchmove', _.handlers.touchMove);
		_.removeEventListener('touchend', _.handlers.touchEnd);
		_.removeEventListener('touchcancel', _.handlers.touchEnd);
		_.removeEventListener('pointerdown', _.handlers.pointerDown);
		window.removeEventListener('pointermove', _.handlers.pointerMove);
		window.removeEventListener('pointerup', _.handlers.pointerUp);
		window.removeEventListener('pointercancel', _.handlers.pointerUp);
		_.removeEventListener('dblclick', _.handlers.dblClick);
		_.removeEventListener('transitionend', _.handlers.transitionEnd);
		if (_.#resizeObserver) {
			_.#resizeObserver.disconnect();
			_.#resizeObserver = null;
		}
	}

	/**
	 * Reset scale and position back to min.
	 * @param {{ animate?: boolean }} [options]
	 */
	reset({ animate = true } = {}) {
		const _ = this;
		if (!_.#isReady()) return;
		const rect = _.getBoundingClientRect();
		_.#containerRect = rect;
		const target = _.min;
		const width = _.#imgNaturalWidth * _.#baseScale * target;
		const height = _.#imgNaturalHeight * _.#baseScale * target;
		const nextTranslateX = (rect.width - width) / 2;
		const nextTranslateY = (rect.height - height) / 2;
		_.#commitZoom(target, nextTranslateX, nextTranslateY, animate);
	}

	/**
	 * Zoom to a specific scale, centered on the container.
	 * @param {number} nextScale
	 * @param {{ animate?: boolean }} [options]
	 */
	zoomTo(nextScale, { animate = true } = {}) {
		const _ = this;
		if (!_.#isReady()) return;
		const rect = _.getBoundingClientRect();
		_.#containerRect = rect;
		const target = Math.max(_.min, Math.min(_.max, nextScale));
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rawX = centerX - (centerX - _.#translateX) * (target / _.#scale);
		const rawY = centerY - (centerY - _.#translateY) * (target / _.#scale);
		const constrained = _.#constrainTranslate(rawX, rawY, target);
		_.#commitZoom(target, constrained.translateX, constrained.translateY, animate);
	}

	/**
	 * Readiness check — true when the inner image exists and has known dimensions.
	 * @private
	 */
	#isReady() {
		return !!(this.#img && this.#imgNaturalWidth);
	}

	/**
	 * Read natural image dimensions and compute the contain-fit base scale.
	 * Updates #containerRect. Does not touch user-facing scale or translate.
	 * @private
	 */
	#recomputeBaseScale() {
		const _ = this;
		const naturalWidth = _.#img.naturalWidth;
		const naturalHeight = _.#img.naturalHeight;
		if (!naturalWidth || !naturalHeight) return false;
		const rect = _.getBoundingClientRect();
		if (!rect.width || !rect.height) return false;
		_.#imgNaturalWidth = naturalWidth;
		_.#imgNaturalHeight = naturalHeight;
		_.#containerRect = rect;
		_.#baseScale = Math.min(
			rect.width / naturalWidth,
			rect.height / naturalHeight
		);
		return true;
	}

	/**
	 * Initial fit: compute base scale and center the image at min zoom.
	 * @private
	 */
	#initialiseFit() {
		const _ = this;
		if (!_.#recomputeBaseScale()) return;
		const rect = _.#containerRect;
		_.#scale = _.min;
		const width = _.#imgNaturalWidth * _.#baseScale * _.#scale;
		const height = _.#imgNaturalHeight * _.#baseScale * _.#scale;
		_.#translateX = (rect.width - width) / 2;
		_.#translateY = (rect.height - height) / 2;
		_.#applyTransform();
	}

	/**
	 * Write the current transform to the image element.
	 * @private
	 */
	#applyTransform() {
		const _ = this;
		const effectiveScale = _.#scale * _.#baseScale;
		_.#img.style.transform =
			`translate(${_.#translateX}px, ${_.#translateY}px) scale(${effectiveScale})`;
		if (_.#scale > _.min + 0.001) _.setAttribute('zoomed', '');
		else _.removeAttribute('zoomed');
		_.dispatchEvent(
			new CustomEvent('image-zoom:change', {
				bubbles: true,
				detail: {
					scale: _.#scale,
					translateX: _.#translateX,
					translateY: _.#translateY,
				},
			})
		);
	}

	/**
	 * Convert a pointer event or touch to container-local coordinates.
	 * @param {PointerEvent|Touch} event
	 * @private
	 */
	#toLocal(event) {
		const rect = this.#containerRect;
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	/**
	 * Rebuild the pointers map from a TouchList in container-local coordinates.
	 * @param {TouchList} touchList
	 * @private
	 */
	#syncTouches(touchList) {
		const _ = this;
		_.#gesture.pointers.clear();
		for (const touch of touchList) {
			_.#gesture.pointers.set(touch.identifier, _.#toLocal(touch));
		}
	}

	/**
	 * Clamp translate values so the image cannot leave the container when larger
	 * than it, and center the image when smaller than the container.
	 * @private
	 */
	#constrainTranslate(translateX, translateY, scale) {
		const _ = this;
		const rect = _.#containerRect || _.getBoundingClientRect();
		const width = _.#imgNaturalWidth * _.#baseScale * scale;
		const height = _.#imgNaturalHeight * _.#baseScale * scale;
		let clampedX;
		let clampedY;
		if (width <= rect.width) {
			clampedX = (rect.width - width) / 2;
		} else {
			const minX = rect.width - width;
			clampedX = Math.min(0, Math.max(minX, translateX));
		}
		if (height <= rect.height) {
			clampedY = (rect.height - height) / 2;
		} else {
			const minY = rect.height - height;
			clampedY = Math.min(0, Math.max(minY, translateY));
		}
		return { translateX: clampedX, translateY: clampedY };
	}

	/**
	 * Apply rubber-band resistance when the raw scale is outside [min, max].
	 * @private
	 */
	#rubberBandScale(raw) {
		const _ = this;
		const min = _.min;
		const max = _.max;
		if (raw < min) {
			const over = min - raw;
			const resisted = Math.sqrt(over) * 0.25 * min;
			return Math.max(min * 0.8, min - resisted);
		}
		if (raw > max) {
			const over = raw - max;
			const resisted = Math.sqrt(over) * 0.25 * max;
			return Math.min(max * 1.25, max + resisted);
		}
		return raw;
	}

	/**
	 * @param {PointerEvent} event
	 * @private
	 */
	#onPointerDown(event) {
		const _ = this;
		if (!_.#isReady()) return;
		// Touch events handle the touch path — skip to avoid double-firing.
		if (event.pointerType === 'touch') return;
		_.#containerRect = _.getBoundingClientRect();
		if (_.setPointerCapture) {
			try {
				_.setPointerCapture(event.pointerId);
			} catch {
				// ignore
			}
		}
		_.removeAttribute('transitioning');
		_.#gesture.pointers.set(event.pointerId, _.#toLocal(event));

		if (_.#gesture.pointers.size === 2) {
			_.#beginPinch();
		} else if (_.#gesture.pointers.size === 1) {
			_.#beginPan();
		}
	}

	/**
	 * @param {PointerEvent} event
	 * @private
	 */
	#onPointerMove(event) {
		const _ = this;
		if (event.pointerType === 'touch') return;
		if (!_.#gesture.pointers.has(event.pointerId)) return;
		if (event.cancelable) event.preventDefault();
		_.#gesture.pointers.set(event.pointerId, _.#toLocal(event));

		if (_.#gesture.mode === 'pinch' && _.#gesture.pointers.size >= 2) {
			_.#updatePinch();
		} else if (_.#gesture.mode === 'pan') {
			_.#updatePan();
		}
	}

	/**
	 * @param {PointerEvent} event
	 * @private
	 */
	#onPointerUp(event) {
		const _ = this;
		if (event.pointerType === 'touch') return;
		if (!_.#gesture.pointers.has(event.pointerId)) return;
		_.#gesture.pointers.delete(event.pointerId);

		if (_.#gesture.mode === 'pinch' && _.#gesture.pointers.size < 2) {
			_.#settle();
			if (_.#gesture.pointers.size === 1 && _.#scale > _.min + 0.001) {
				_.#beginPan();
			} else {
				_.#gesture.mode = 'idle';
				_.removeAttribute('gesturing');
			}
			return;
		}

		if (_.#gesture.pointers.size === 0) {
			if (_.#gesture.mode === 'pan') _.#settle();
			_.#gesture.mode = 'idle';
			_.removeAttribute('gesturing');
		}
	}

	/**
	 * @private
	 */
	#beginPinch() {
		const _ = this;
		const [firstPointer, secondPointer] = [..._.#gesture.pointers.values()];
		const midpointX = (firstPointer.x + secondPointer.x) / 2;
		const midpointY = (firstPointer.y + secondPointer.y) / 2;
		_.#gesture.mode = 'pinch';
		_.#gesture.startScale = _.#scale;
		_.#gesture.startTranslateX = _.#translateX;
		_.#gesture.startTranslateY = _.#translateY;
		_.#gesture.startDistance = Math.hypot(
			secondPointer.x - firstPointer.x,
			secondPointer.y - firstPointer.y
		) || 1;
		_.#gesture.startMidpointX = midpointX;
		_.#gesture.startMidpointY = midpointY;
		_.setAttribute('gesturing', '');
		_.dispatchEvent(
			new CustomEvent('image-zoom:zoomstart', {
				bubbles: true,
				detail: { scale: _.#scale },
			})
		);
	}

	/**
	 * @private
	 */
	#updatePinch() {
		const _ = this;
		const [firstPointer, secondPointer] = [..._.#gesture.pointers.values()];
		const distance = Math.hypot(
			secondPointer.x - firstPointer.x,
			secondPointer.y - firstPointer.y
		);
		const midpointX = (firstPointer.x + secondPointer.x) / 2;
		const midpointY = (firstPointer.y + secondPointer.y) / 2;
		const gesture = _.#gesture;

		const rawScale = gesture.startScale * (distance / gesture.startDistance);
		const nextScale = _.#rubberBandScale(rawScale);
		const ratio = nextScale / gesture.startScale;

		let nextTranslateX = midpointX - (gesture.startMidpointX - gesture.startTranslateX) * ratio;
		let nextTranslateY = midpointY - (gesture.startMidpointY - gesture.startTranslateY) * ratio;

		_.#scale = nextScale;
		if (nextScale >= _.min && nextScale <= _.max) {
			const constrained = _.#constrainTranslate(nextTranslateX, nextTranslateY, nextScale);
			nextTranslateX = constrained.translateX;
			nextTranslateY = constrained.translateY;
		}
		_.#translateX = nextTranslateX;
		_.#translateY = nextTranslateY;
		_.#applyTransform();
	}

	/**
	 * @private
	 */
	#beginPan() {
		const _ = this;
		if (_.#scale <= _.min + 0.001) {
			_.#gesture.mode = 'idle';
			return;
		}
		const [pointer] = [..._.#gesture.pointers.values()];
		_.#gesture.mode = 'pan';
		_.#gesture.startScale = _.#scale;
		_.#gesture.startTranslateX = _.#translateX;
		_.#gesture.startTranslateY = _.#translateY;
		_.#gesture.startMidpointX = pointer.x;
		_.#gesture.startMidpointY = pointer.y;
		_.setAttribute('gesturing', '');
	}

	/**
	 * @private
	 */
	#updatePan() {
		const _ = this;
		const [pointer] = [..._.#gesture.pointers.values()];
		const gesture = _.#gesture;
		const rawX = gesture.startTranslateX + (pointer.x - gesture.startMidpointX);
		const rawY = gesture.startTranslateY + (pointer.y - gesture.startMidpointY);
		const constrained = _.#constrainTranslate(rawX, rawY, _.#scale);
		_.#translateX = constrained.translateX;
		_.#translateY = constrained.translateY;
		_.#applyTransform();
	}

	/**
	 * Animate back into valid [min, max] range after a gesture ends.
	 * @private
	 */
	#settle() {
		const _ = this;
		let target = _.#scale;
		if (target < _.min) target = _.min;
		else if (target > _.max) target = _.max;

		let nextTranslateX = _.#translateX;
		let nextTranslateY = _.#translateY;
		if (target !== _.#scale) {
			const midpointX = _.#gesture.startMidpointX;
			const midpointY = _.#gesture.startMidpointY;
			const ratio = target / _.#scale;
			nextTranslateX = midpointX - (midpointX - _.#translateX) * ratio;
			nextTranslateY = midpointY - (midpointY - _.#translateY) * ratio;
		}
		const constrained = _.#constrainTranslate(nextTranslateX, nextTranslateY, target);
		_.#animateTo(target, constrained.translateX, constrained.translateY);
		_.dispatchEvent(
			new CustomEvent('image-zoom:zoomend', {
				bubbles: true,
				detail: { scale: target },
			})
		);
	}

	/**
	 * Write a target transform with a CSS transition. Internal — no events.
	 * Skips the transitioning attribute when the target is already the current
	 * state, otherwise no transition fires and the attribute would stick.
	 * @private
	 */
	#animateTo(scale, translateX, translateY) {
		const _ = this;
		if (
			scale === _.#scale &&
			translateX === _.#translateX &&
			translateY === _.#translateY
		) {
			return;
		}
		_.setAttribute('transitioning', '');
		_.#scale = scale;
		_.#translateX = translateX;
		_.#translateY = translateY;
		_.#applyTransform();
	}

	/**
	 * Public-facing commit: fires zoomstart/zoomend around the transform.
	 * Used by reset, zoomTo, and double-tap.
	 * @private
	 */
	#commitZoom(scale, translateX, translateY, animate) {
		const _ = this;
		if (
			scale === _.#scale &&
			translateX === _.#translateX &&
			translateY === _.#translateY
		) {
			return;
		}
		_.dispatchEvent(
			new CustomEvent('image-zoom:zoomstart', {
				bubbles: true,
				detail: { scale: _.#scale },
			})
		);
		if (animate) {
			_.#animateTo(scale, translateX, translateY);
		} else {
			_.#scale = scale;
			_.#translateX = translateX;
			_.#translateY = translateY;
			_.#applyTransform();
		}
		_.dispatchEvent(
			new CustomEvent('image-zoom:zoomend', {
				bubbles: true,
				detail: { scale },
			})
		);
	}

	/**
	 * @param {MouseEvent} event
	 * @private
	 */
	#onDoubleClick(event) {
		const _ = this;
		if (!_.#isReady()) return;
		_.#containerRect = _.getBoundingClientRect();
		const local = _.#toLocal(event);
		_.#doubleTapAt(local.x, local.y);
	}

	/**
	 * Toggle zoom anchored at the given container-local point.
	 * Shared by desktop double-click and mobile double-tap.
	 * @private
	 */
	#doubleTapAt(localX, localY) {
		const _ = this;
		if (_.#scale > _.min + 0.001) {
			_.reset();
			return;
		}
		const target = _.max;
		const ratio = target / _.#scale;
		const rawX = localX - (localX - _.#translateX) * ratio;
		const rawY = localY - (localY - _.#translateY) * ratio;
		const constrained = _.#constrainTranslate(rawX, rawY, target);
		_.#commitZoom(target, constrained.translateX, constrained.translateY, true);
	}

	/**
	 * @param {TouchEvent} event
	 * @private
	 */
	#onTouchStart(event) {
		const _ = this;
		if (!_.#isReady()) return;
		_.#containerRect = _.getBoundingClientRect();
		_.removeAttribute('transitioning');
		_.#syncTouches(event.touches);

		if (_.#gesture.pointers.size >= 2) {
			if (event.cancelable) event.preventDefault();
			_.#beginPinch();
			return;
		}
		if (_.#gesture.pointers.size === 1) {
			const [pointer] = [..._.#gesture.pointers.values()];
			_.#tapStartX = pointer.x;
			_.#tapStartY = pointer.y;
			_.#tapMoved = false;
			// Only claim the single-finger gesture when already zoomed.
			// Otherwise let the browser handle vertical page scroll.
			if (_.#scale > _.min + 0.001) {
				if (event.cancelable) event.preventDefault();
				_.#beginPan();
			}
		}
	}

	/**
	 * @param {TouchEvent} event
	 * @private
	 */
	#onTouchMove(event) {
		const _ = this;
		if (_.#gesture.pointers.size === 0) return;
		_.#syncTouches(event.touches);

		if (_.#gesture.pointers.size === 1 && !_.#tapMoved) {
			const [pointer] = [..._.#gesture.pointers.values()];
			const deltaX = pointer.x - _.#tapStartX;
			const deltaY = pointer.y - _.#tapStartY;
			if (deltaX * deltaX + deltaY * deltaY > 100) _.#tapMoved = true;
		}

		if (_.#gesture.mode === 'pinch' && _.#gesture.pointers.size >= 2) {
			if (event.cancelable) event.preventDefault();
			_.#updatePinch();
		} else if (_.#gesture.mode === 'pan') {
			if (event.cancelable) event.preventDefault();
			_.#updatePan();
		}
	}

	/**
	 * @param {TouchEvent} event
	 * @private
	 */
	#onTouchEnd(event) {
		const _ = this;
		const cancelled = event.type === 'touchcancel';
		const previousSize = _.#gesture.pointers.size;
		_.#syncTouches(event.touches);

		if (_.#gesture.mode === 'pinch' && _.#gesture.pointers.size < 2) {
			_.#settle();
			if (!cancelled && _.#gesture.pointers.size === 1 && _.#scale > _.min + 0.001) {
				// Re-seed pan with the remaining finger as the new anchor.
				const [pointer] = [..._.#gesture.pointers.values()];
				_.#tapStartX = pointer.x;
				_.#tapStartY = pointer.y;
				_.#tapMoved = true;
				_.#beginPan();
			} else {
				_.#gesture.mode = 'idle';
				_.removeAttribute('gesturing');
			}
			return;
		}

		if (_.#gesture.pointers.size === 0) {
			if (_.#gesture.mode === 'pan' && _.#tapMoved) {
				_.#settle();
			} else if (!cancelled && previousSize === 1 && !_.#tapMoved) {
				_.#handleTap();
			}
			_.#gesture.mode = 'idle';
			_.removeAttribute('gesturing');
		}
	}

	/**
	 * Detect a tap vs. a double-tap using time and spatial proximity to the
	 * previous tap, then dispatch a double-tap zoom when both match.
	 * @private
	 */
	#handleTap() {
		const _ = this;
		const now = performance.now();
		const deltaX = _.#tapStartX - _.#lastTapX;
		const deltaY = _.#tapStartY - _.#lastTapY;
		const withinTime = now - _.#lastTapTime < 300;
		const withinSpace = deltaX * deltaX + deltaY * deltaY < 400;
		if (withinTime && withinSpace) {
			_.#doubleTapAt(_.#tapStartX, _.#tapStartY);
			_.#lastTapTime = 0;
			return;
		}
		_.#lastTapTime = now;
		_.#lastTapX = _.#tapStartX;
		_.#lastTapY = _.#tapStartY;
	}

	/**
	 * @private
	 */
	#onResize() {
		const _ = this;
		if (!_.#img) return;
		if (_.#resizeFrame) return;
		_.#resizeFrame = requestAnimationFrame(() => {
			_.#resizeFrame = 0;
			// First-time init: element was hidden (zero rect) at connect and
			// has just become visible. Run full fit instead of reclamping.
			if (!_.#isReady()) {
				if (_.#img.complete && _.#img.naturalWidth) _.#initialiseFit();
				return;
			}
			if (!_.#recomputeBaseScale()) return;
			// Preserve the user's current scale; just reclamp translate to the new rect.
			const constrained = _.#constrainTranslate(_.#translateX, _.#translateY, _.#scale);
			_.#translateX = constrained.translateX;
			_.#translateY = constrained.translateY;
			_.#applyTransform();
		});
	}
}

/**
 * @file Main entry point for image-zoom web component
 * @author Cory Schulz
 * @version 0.1.0
 */


// define custom elements if not already defined
if (!customElements.get('image-zoom')) {
	customElements.define('image-zoom', ImageZoom);
}

export { ImageZoom };
