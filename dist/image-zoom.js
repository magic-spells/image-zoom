(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ImageZoom = {}));
})(this, (function (exports) { 'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ":root {\n\t--image-zoom-bg: #000;\n\t--image-zoom-radius: 0;\n\t--image-zoom-aspect: 4 / 3;\n\t--image-zoom-cursor: grab;\n\t--image-zoom-cursor-active: grabbing;\n\t--image-zoom-transition-duration: 300ms;\n\t--image-zoom-transition-easing: cubic-bezier(0.22, 1, 0.36, 1);\n}\n\nimage-zoom {\n\tdisplay: block;\n\tposition: relative;\n\toverflow: hidden;\n\twidth: 100%;\n\taspect-ratio: var(--image-zoom-aspect);\n\tbackground: var(--image-zoom-bg);\n\tborder-radius: var(--image-zoom-radius);\n\ttouch-action: none;\n\t-webkit-user-select: none;\n\tuser-select: none;\n\tcursor: var(--image-zoom-cursor);\n\tbox-sizing: border-box;\n}\n\nimage-zoom * {\n\tbox-sizing: border-box;\n}\n\nimage-zoom img {\n\tdisplay: block;\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\twidth: auto;\n\theight: auto;\n\tmax-width: none;\n\tmax-height: none;\n\ttransform-origin: 0 0;\n\twill-change: transform;\n\t-webkit-user-drag: none;\n\tuser-select: none;\n\tpointer-events: none;\n}\n\nimage-zoom[transitioning] img {\n\ttransition:\n\t\ttransform var(--image-zoom-transition-duration)\n\t\tvar(--image-zoom-transition-easing);\n}\n\nimage-zoom[gesturing],\nimage-zoom[zoomed] {\n\tcursor: var(--image-zoom-cursor-active);\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImltYWdlLXpvb20uY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0NBQ0MscUJBQXFCO0NBQ3JCLHNCQUFzQjtDQUN0QiwwQkFBMEI7Q0FDMUIseUJBQXlCO0NBQ3pCLG9DQUFvQztDQUNwQyx1Q0FBdUM7Q0FDdkMsOERBQThEO0FBQy9EOztBQUVBO0NBQ0MsY0FBYztDQUNkLGtCQUFrQjtDQUNsQixnQkFBZ0I7Q0FDaEIsV0FBVztDQUNYLHNDQUFzQztDQUN0QyxnQ0FBZ0M7Q0FDaEMsdUNBQXVDO0NBQ3ZDLGtCQUFrQjtDQUNsQix5QkFBeUI7Q0FDekIsaUJBQWlCO0NBQ2pCLGdDQUFnQztDQUNoQyxzQkFBc0I7QUFDdkI7O0FBRUE7Q0FDQyxzQkFBc0I7QUFDdkI7O0FBRUE7Q0FDQyxjQUFjO0NBQ2Qsa0JBQWtCO0NBQ2xCLE1BQU07Q0FDTixPQUFPO0NBQ1AsV0FBVztDQUNYLFlBQVk7Q0FDWixlQUFlO0NBQ2YsZ0JBQWdCO0NBQ2hCLHFCQUFxQjtDQUNyQixzQkFBc0I7Q0FDdEIsdUJBQXVCO0NBQ3ZCLGlCQUFpQjtDQUNqQixvQkFBb0I7QUFDckI7O0FBRUE7Q0FDQzs7cUNBRW9DO0FBQ3JDOztBQUVBOztDQUVDLHVDQUF1QztBQUN4QyIsImZpbGUiOiJpbWFnZS16b29tLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIjpyb290IHtcblx0LS1pbWFnZS16b29tLWJnOiAjMDAwO1xuXHQtLWltYWdlLXpvb20tcmFkaXVzOiAwO1xuXHQtLWltYWdlLXpvb20tYXNwZWN0OiA0IC8gMztcblx0LS1pbWFnZS16b29tLWN1cnNvcjogZ3JhYjtcblx0LS1pbWFnZS16b29tLWN1cnNvci1hY3RpdmU6IGdyYWJiaW5nO1xuXHQtLWltYWdlLXpvb20tdHJhbnNpdGlvbi1kdXJhdGlvbjogMzAwbXM7XG5cdC0taW1hZ2Utem9vbS10cmFuc2l0aW9uLWVhc2luZzogY3ViaWMtYmV6aWVyKDAuMjIsIDEsIDAuMzYsIDEpO1xufVxuXG5pbWFnZS16b29tIHtcblx0ZGlzcGxheTogYmxvY2s7XG5cdHBvc2l0aW9uOiByZWxhdGl2ZTtcblx0b3ZlcmZsb3c6IGhpZGRlbjtcblx0d2lkdGg6IDEwMCU7XG5cdGFzcGVjdC1yYXRpbzogdmFyKC0taW1hZ2Utem9vbS1hc3BlY3QpO1xuXHRiYWNrZ3JvdW5kOiB2YXIoLS1pbWFnZS16b29tLWJnKTtcblx0Ym9yZGVyLXJhZGl1czogdmFyKC0taW1hZ2Utem9vbS1yYWRpdXMpO1xuXHR0b3VjaC1hY3Rpb246IG5vbmU7XG5cdC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG5cdHVzZXItc2VsZWN0OiBub25lO1xuXHRjdXJzb3I6IHZhcigtLWltYWdlLXpvb20tY3Vyc29yKTtcblx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcbn1cblxuaW1hZ2Utem9vbSAqIHtcblx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcbn1cblxuaW1hZ2Utem9vbSBpbWcge1xuXHRkaXNwbGF5OiBibG9jaztcblx0cG9zaXRpb246IGFic29sdXRlO1xuXHR0b3A6IDA7XG5cdGxlZnQ6IDA7XG5cdHdpZHRoOiBhdXRvO1xuXHRoZWlnaHQ6IGF1dG87XG5cdG1heC13aWR0aDogbm9uZTtcblx0bWF4LWhlaWdodDogbm9uZTtcblx0dHJhbnNmb3JtLW9yaWdpbjogMCAwO1xuXHR3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xuXHQtd2Via2l0LXVzZXItZHJhZzogbm9uZTtcblx0dXNlci1zZWxlY3Q6IG5vbmU7XG5cdHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuXG5pbWFnZS16b29tW3RyYW5zaXRpb25pbmddIGltZyB7XG5cdHRyYW5zaXRpb246XG5cdFx0dHJhbnNmb3JtIHZhcigtLWltYWdlLXpvb20tdHJhbnNpdGlvbi1kdXJhdGlvbilcblx0XHR2YXIoLS1pbWFnZS16b29tLXRyYW5zaXRpb24tZWFzaW5nKTtcbn1cblxuaW1hZ2Utem9vbVtnZXN0dXJpbmddLFxuaW1hZ2Utem9vbVt6b29tZWRdIHtcblx0Y3Vyc29yOiB2YXIoLS1pbWFnZS16b29tLWN1cnNvci1hY3RpdmUpO1xufVxuIl19 */";
  styleInject(css_248z);

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
  		this.detachListeners();
  	}

  	/**
  	 * Lifecycle — observed attribute changed.
  	 * @param {string} name
  	 */
  	attributeChangedCallback(name) {
  		if (!this.#img || !this.#imgNaturalWidth) return;
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
  		_.handlers.resize = _.#onResize.bind(_);
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
  		window.addEventListener('resize', _.handlers.resize);
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
  		window.removeEventListener('resize', _.handlers.resize);
  	}

  	/**
  	 * Reset scale and position back to min.
  	 * @param {{ animate?: boolean }} [options]
  	 */
  	reset({ animate = true } = {}) {
  		const _ = this;
  		if (!_.#img || !_.#imgNaturalWidth) return;
  		const rect = _.getBoundingClientRect();
  		_.#containerRect = rect;
  		const target = _.min;
  		const width = _.#imgNaturalWidth * _.#baseScale * target;
  		const height = _.#imgNaturalHeight * _.#baseScale * target;
  		const tx = (rect.width - width) / 2;
  		const ty = (rect.height - height) / 2;
  		if (animate) _.#animateTo(target, tx, ty);
  		else {
  			_.#scale = target;
  			_.#translateX = tx;
  			_.#translateY = ty;
  			_.#applyTransform();
  		}
  	}

  	/**
  	 * Zoom to a specific scale, centered on the container.
  	 * @param {number} nextScale
  	 * @param {{ animate?: boolean }} [options]
  	 */
  	zoomTo(nextScale, { animate = true } = {}) {
  		const _ = this;
  		if (!_.#img || !_.#imgNaturalWidth) return;
  		const rect = _.getBoundingClientRect();
  		_.#containerRect = rect;
  		const target = Math.max(_.min, Math.min(_.max, nextScale));
  		const cx = rect.width / 2;
  		const cy = rect.height / 2;
  		let tx = cx - (cx - _.#translateX) * (target / _.#scale);
  		let ty = cy - (cy - _.#translateY) * (target / _.#scale);
  		({ tx, ty } = _.#constrainTranslate(tx, ty, target));
  		if (animate) _.#animateTo(target, tx, ty);
  		else {
  			_.#scale = target;
  			_.#translateX = tx;
  			_.#translateY = ty;
  			_.#applyTransform();
  		}
  	}

  	/**
  	 * Compute the contain-fit base scale and center the image.
  	 * @private
  	 */
  	#initialiseFit() {
  		const _ = this;
  		_.#imgNaturalWidth = _.#img.naturalWidth;
  		_.#imgNaturalHeight = _.#img.naturalHeight;
  		if (!_.#imgNaturalWidth || !_.#imgNaturalHeight) return;
  		const rect = _.getBoundingClientRect();
  		_.#baseScale = Math.min(
  			rect.width / _.#imgNaturalWidth,
  			rect.height / _.#imgNaturalHeight
  		);
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
  	#constrainTranslate(tx, ty, scale) {
  		const _ = this;
  		const rect = _.#containerRect || _.getBoundingClientRect();
  		const width = _.#imgNaturalWidth * _.#baseScale * scale;
  		const height = _.#imgNaturalHeight * _.#baseScale * scale;
  		if (width <= rect.width) {
  			tx = (rect.width - width) / 2;
  		} else {
  			const minTx = rect.width - width;
  			tx = Math.min(0, Math.max(minTx, tx));
  		}
  		if (height <= rect.height) {
  			ty = (rect.height - height) / 2;
  		} else {
  			const minTy = rect.height - height;
  			ty = Math.min(0, Math.max(minTy, ty));
  		}
  		return { tx, ty };
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
  		if (!_.#img || !_.#imgNaturalWidth) return;
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
  		const [p1, p2] = [..._.#gesture.pointers.values()];
  		const mx = (p1.x + p2.x) / 2;
  		const my = (p1.y + p2.y) / 2;
  		_.#gesture.mode = 'pinch';
  		_.#gesture.startScale = _.#scale;
  		_.#gesture.startTranslateX = _.#translateX;
  		_.#gesture.startTranslateY = _.#translateY;
  		_.#gesture.startDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  		_.#gesture.startMidpointX = mx;
  		_.#gesture.startMidpointY = my;
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
  		const [p1, p2] = [..._.#gesture.pointers.values()];
  		const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  		const midpointX = (p1.x + p2.x) / 2;
  		const midpointY = (p1.y + p2.y) / 2;
  		const g = _.#gesture;

  		const rawScale = g.startScale * (distance / g.startDistance);
  		const nextScale = _.#rubberBandScale(rawScale);
  		const ratio = nextScale / g.startScale;

  		let tx = midpointX - (g.startMidpointX - g.startTranslateX) * ratio;
  		let ty = midpointY - (g.startMidpointY - g.startTranslateY) * ratio;

  		_.#scale = nextScale;
  		if (nextScale >= _.min && nextScale <= _.max) {
  			({ tx, ty } = _.#constrainTranslate(tx, ty, nextScale));
  		}
  		_.#translateX = tx;
  		_.#translateY = ty;
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
  		const [p] = [..._.#gesture.pointers.values()];
  		_.#gesture.mode = 'pan';
  		_.#gesture.startScale = _.#scale;
  		_.#gesture.startTranslateX = _.#translateX;
  		_.#gesture.startTranslateY = _.#translateY;
  		_.#gesture.startMidpointX = p.x;
  		_.#gesture.startMidpointY = p.y;
  		_.setAttribute('gesturing', '');
  	}

  	/**
  	 * @private
  	 */
  	#updatePan() {
  		const _ = this;
  		const [p] = [..._.#gesture.pointers.values()];
  		const g = _.#gesture;
  		let tx = g.startTranslateX + (p.x - g.startMidpointX);
  		let ty = g.startTranslateY + (p.y - g.startMidpointY);
  		({ tx, ty } = _.#constrainTranslate(tx, ty, _.#scale));
  		_.#translateX = tx;
  		_.#translateY = ty;
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

  		let tx = _.#translateX;
  		let ty = _.#translateY;
  		if (target !== _.#scale) {
  			const mx = _.#gesture.startMidpointX || (_.#containerRect.width / 2);
  			const my = _.#gesture.startMidpointY || (_.#containerRect.height / 2);
  			const ratio = target / _.#scale;
  			tx = mx - (mx - _.#translateX) * ratio;
  			ty = my - (my - _.#translateY) * ratio;
  		}
  		({ tx, ty } = _.#constrainTranslate(tx, ty, target));
  		_.#animateTo(target, tx, ty);
  		_.dispatchEvent(
  			new CustomEvent('image-zoom:zoomend', {
  				bubbles: true,
  				detail: { scale: target },
  			})
  		);
  	}

  	/**
  	 * Animate to a target transform via a CSS transition.
  	 * @private
  	 */
  	#animateTo(scale, tx, ty) {
  		const _ = this;
  		_.setAttribute('transitioning', '');
  		_.#scale = scale;
  		_.#translateX = tx;
  		_.#translateY = ty;
  		_.#applyTransform();
  	}

  	/**
  	 * @param {MouseEvent} event
  	 * @private
  	 */
  	#onDoubleClick(event) {
  		const _ = this;
  		if (!_.#img || !_.#imgNaturalWidth) return;
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
  		let tx = localX - (localX - _.#translateX) * ratio;
  		let ty = localY - (localY - _.#translateY) * ratio;
  		({ tx, ty } = _.#constrainTranslate(tx, ty, target));
  		_.#animateTo(target, tx, ty);
  	}

  	/**
  	 * @param {TouchEvent} event
  	 * @private
  	 */
  	#onTouchStart(event) {
  		const _ = this;
  		if (!_.#img || !_.#imgNaturalWidth) return;
  		event.preventDefault();
  		_.#containerRect = _.getBoundingClientRect();
  		_.removeAttribute('transitioning');
  		_.#syncTouches(event.touches);

  		if (_.#gesture.pointers.size >= 2) {
  			_.#beginPinch();
  			return;
  		}
  		if (_.#gesture.pointers.size === 1) {
  			const [p] = [..._.#gesture.pointers.values()];
  			_.#tapStartX = p.x;
  			_.#tapStartY = p.y;
  			_.#tapMoved = false;
  			_.#beginPan();
  		}
  	}

  	/**
  	 * @param {TouchEvent} event
  	 * @private
  	 */
  	#onTouchMove(event) {
  		const _ = this;
  		if (_.#gesture.pointers.size === 0) return;
  		if (event.cancelable) event.preventDefault();
  		_.#syncTouches(event.touches);

  		if (_.#gesture.pointers.size === 1 && !_.#tapMoved) {
  			const [p] = [..._.#gesture.pointers.values()];
  			const dx = p.x - _.#tapStartX;
  			const dy = p.y - _.#tapStartY;
  			if (dx * dx + dy * dy > 100) _.#tapMoved = true;
  		}

  		if (_.#gesture.mode === 'pinch' && _.#gesture.pointers.size >= 2) {
  			_.#updatePinch();
  		} else if (_.#gesture.mode === 'pan') {
  			_.#updatePan();
  		}
  	}

  	/**
  	 * @param {TouchEvent} event
  	 * @private
  	 */
  	#onTouchEnd(event) {
  		const _ = this;
  		const previousSize = _.#gesture.pointers.size;
  		_.#syncTouches(event.touches);

  		if (_.#gesture.mode === 'pinch' && _.#gesture.pointers.size < 2) {
  			_.#settle();
  			if (_.#gesture.pointers.size === 1 && _.#scale > _.min + 0.001) {
  				// Re-seed pan with the remaining finger as the new anchor.
  				const [p] = [..._.#gesture.pointers.values()];
  				_.#tapStartX = p.x;
  				_.#tapStartY = p.y;
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
  			} else if (previousSize === 1 && !_.#tapMoved) {
  				// Treat as a tap — check for double-tap.
  				const now = performance.now();
  				if (now - _.#lastTapTime < 300) {
  					_.#doubleTapAt(_.#tapStartX, _.#tapStartY);
  					_.#lastTapTime = 0;
  				} else {
  					_.#lastTapTime = now;
  				}
  			}
  			_.#gesture.mode = 'idle';
  			_.removeAttribute('gesturing');
  		}
  	}

  	/**
  	 * @private
  	 */
  	#onResize() {
  		if (this.#img && this.#imgNaturalWidth) this.#initialiseFit();
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

  exports.ImageZoom = ImageZoom;

}));
//# sourceMappingURL=image-zoom.js.map
