/**
 * @file Main entry point for image-zoom web component
 * @author Cory Schulz
 * @version 0.1.0
 */

// import styles
import './image-zoom.css';

// import components
import { ImageZoom } from './components/image-zoom.js';

// export components for external use
export { ImageZoom };

// define custom elements if not already defined
if (typeof customElements !== 'undefined' && !customElements.get('image-zoom')) {
	customElements.define('image-zoom', ImageZoom);
}
