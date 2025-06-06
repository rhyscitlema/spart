/*!
 * Spart.js - SPA Art
 * A lightweight raw JavaScript library for building web user interfaces.
 *
 * (c) 2025 Rhyscitlema
 * Released under the MIT License
 */

/**
 * @typedef {Object} HTMLElementInfo
 * @property {HTMLElement} [element] - The alredy created element to be returned right away
 * @property {string} [svg] - An SVG string to create an SVG element - must contain the `xmlns` attribute
 * @property {string} [tag] - If not specified, it will be inferred from the parent element
 * @property {string} [text] - For the inner text of the element
 * @property {string} [html] - For the inner HTML of the element
 * @property {Record<string, string|number|boolean>} [props] - Properties to set on the element
 * @property {HTMLElementInfo[]} [content] - Inner content to append to the element
 * @property {Record<string, Function>} [events] - Event listeners to add to the element
 * @property {Function} [callback] - A callback function to execute after the element is created
 * @property {string} [id] - The id attribute to set on the element
 * @property {string} [class] - The class attribute to set on the element
 * @property {string} [style] - The style attribute to set on the element
 * @property {string} [title] - The title attribute to set on the element
 * @property {string} [OTHER] - Any other attribute to set on the element
 */

const excluded_keys = ['tag', 'text', 'html', 'props', 'content', 'events', 'callback'];

/**
 * A simple and efficient way to create HTML elements.
 * It can create elements with attributes, properties, inner content, and event listeners.
 *
 * @param {HTMLElementInfo} info
 * @param {HTMLElement} parent
 * @returns {HTMLElement|null}
 */
function createElement(info, parent) {
	if (!info) return null;
	if (info.element) return info.element;
	if (info.svg) return createSVGElement(info.svg);
	try {
		let tag = info.tag;
		if (!tag) {
			const p = parent.tagName;
			if (p == 'SELECT')
				tag = 'OPTION';
			else if (p == 'UL' || p == 'OL')
				tag = 'LI';
			else {
				console.warn('No element tag specified in:', info);
				tag = 'SPAN';
			}
		}
		const elem = document.createElement(tag);

		if (info.text) elem.innerText = info.text;
		if (info.html) elem.innerHTML = info.html;

		// set attributes
		Object.entries(info).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (!excluded_keys.includes(key)) {
					elem.setAttribute(key, value);
				}
			}
		});

		// set properties
		if (info.props) {
			Object.entries(info.props).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					elem[key] = value;
				}
			});
		}

		// add inner content
		if (info.content) {
			info.content.forEach(item => {
				const childElement = createElement(item, elem);
				if (childElement) elem.appendChild(childElement);
			});
		}

		// add event listeners
		if (info.events) {
			Object.entries(info.events).forEach(([name, handler]) => {
				elem.addEventListener(name, handler);
			});
		}

		if (info.callback) info.callback(elem, info, parent);

		return elem;
	}
	catch (error) {
		console.error(error);
		return null;
	}
}

/**
 * Converts an SVG string into an SVG element.
 * The SVG string must contain the `xmlns` attribute.
 * @param {string} svgString
 * @returns {HTMLElement|null}
 */
function createSVGElement(svgString) {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgString, "image/svg+xml");
		const svgElem = doc.documentElement;
		if (svgElem.nodeName === "parsererror")
			throw new Error("Error parsing SVG string");
		return svgElem;
	}
	catch (error) {
		console.error(error);
		return null;
	}
}

const toastItems = {};

/**
 * Clears a toast message by its ID obtained from toast().
 * @param {number} id
 */
function removeToast(id) {
	const item = toastItems[id];
	if (!item) return;
	item.style.opacity = '0';
	// allow time for fade-out animation
	setTimeout(() => item.remove(), 300);
	delete toastItems[id];
}

/**
 * Shows a toast message on the screen.
 * If `forLong` is true, the toast will stay longer.
 * @param {string} message
 * @param {boolean} [forLong]
 * @returns {number}
 */
function toast(message, forLong) {
	// Create toast container if it doesn't exist
	let toastContainer = document.getElementById('toast-container');
	if (!toastContainer) {
		toastContainer = document.createElement('div');
		toastContainer.id = 'toast-container';
		document.body.appendChild(toastContainer);
	}

	// Create toast element
	const item = createElement({
		tag: 'div', class: 'toast-message',
		content: [{ tag: 'span', text: message }],
	});

	// Add to container with animation
	toastContainer.appendChild(item);
	setTimeout(() => item.style.opacity = '1', 10);

	// Auto-dismiss after timeout
	const timeout = forLong ? 6000 : 3000;

	const id = setTimeout(() => removeToast(id), timeout);
	toastItems[id] = item;
	return id;
}
