
import {
    isDisabled,
    isVisible,
    parseSelector
} from '../utils/Utils.js';

const getSelector = (element) => {
    let selector = element.getAttribute('data-jsx-target');

    if (!selector || selector === '#') {
        let hrefAttribute = element.getAttribute('href');

        if (!hrefAttribute || (!hrefAttribute.includes('#') && !hrefAttribute.startsWith('.'))) {
            return null;
        }

        if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
            hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
        }

        selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
    }

    return parseSelector(selector);
};

const SelectorEngine = {
    find(selector, element = document.documentElement) {
        return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },

    findOne(selector, element = document.documentElement) {
        return Element.prototype.querySelector.call(element, selector);
    },

    children(element, selector) {
        return [].concat(...element.children).filter(child => child.matches(selector));
    },

    parents(element, selector) {
        const parents = [];
        let ancestor = element.parentNode.closest(selector);

        while (ancestor) {
            parents.push(ancestor);
            ancestor = ancestor.parentNode.closest(selector);
        }

        return parents;
    },

    prev(element, selector) {
        let previous = element.previousElementSibling;

        while (previous) {
            if (previous.matches(selector)) {
                return [previous];
            }

            previous = previous.previousElementSibling;
        }

        return []
    },

    next(element, selector) {
        let next = element.nextElementSibling

        while (next) {
            if (next.matches(selector)) {
                return [next];
            }

            next = next.nextElementSibling;
        }

        return [];
    },

    focusableChildren(element) {
        const focusables = [
            'a',
            'button',
            'input',
            'textarea',
            'select',
            'details',
            '[tabindex]',
            '[contenteditable="true"]'
        ].map(selector => `${selector}:not([tabindex^="-"])`).join(',');

        return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    },

    getSelectorFromElement(element) {
        const selector = getSelector(element);

        if (selector) {
            return SelectorEngine.findOne(selector) ? selector : null;
        }

        return null
    },

    getElementFromSelector(element) {
        const selector = getSelector(element);

        return selector ? SelectorEngine.findOne(selector) : null;
    },

    getMultipleElementsFromSelector(element) {
        const selector = getSelector(element);

        return selector ? SelectorEngine.find(selector) : [];
    }
};

export default SelectorEngine;
