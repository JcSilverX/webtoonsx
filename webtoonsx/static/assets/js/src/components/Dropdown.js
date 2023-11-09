import BaseComponent from './BaseComponent.js';
import SelectorEngine from './dom/SelectorEngine.js';

import { isDisabled, isVisible } from './utils/Utils.js';

const NAME = 'dropdown';

const ESCAPE_KEY = 'Escape';

const EVENT_CLICK = 'click';
const RIGHT_MOUSE_BUTTON = 2;
const EVENT_KEYDOWN = 'keydown';

const CLASS_NAME_SHOW = 'show';

const SELECTOR_DROPDOWN = '.dropdown';
const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
const SELECTOR_NAV = '.nav';
const SELECTOR_DATA_TOGGLE = '[data-jsx-toggle="dropdown"]';
const SELECTOR_DATA_TOGGLE_SHOW = `${SELECTOR_DATA_TOGGLE}.${CLASS_NAME_SHOW}`;

const Default = {
    autoClose: true,
    keyboard: true,
};

const DefaultType = {
    autoClose: '(boolean|string)',
    keyboard: 'boolean',
};

export default class Dropdown extends BaseComponent {
    constructor(element, config) {
        super(element, config);

        this._parent = this._element.closest(SELECTOR_DROPDOWN);
        this._menu = SelectorEngine.findOne(SELECTOR_DROPDOWN_MENU, this._parent);

        this._addEventListeners();
    };

    // getters/setters
    static get NAME() {
        return NAME;
    }

    static get Default() {
        return Default;
    }

    static get DefaultType() {
        return DefaultType;
    }

    // public methods
    toggle() {
        return this._isShown() ? this.hide() : this.show();
    }

    show() {
        if (this._isShown()) return;

        this._element.focus();
        this._element.setAttribute('aria-expanded', true);

        this._menu.classList.add(CLASS_NAME_SHOW);
        this._element.classList.add(CLASS_NAME_SHOW);
    }

    hide() {
        if (!this._isShown()) return;

        this._completeHide(this._element);
    }

    // private methods
    _isShown() {
        return this._menu.classList.contains(CLASS_NAME_SHOW);
    }

    _addEventListeners() {
        this._element.addEventListener(EVENT_KEYDOWN, (event) => {
            if (event.key !== ESCAPE_KEY) return;

            if (this._config.keyboard) {
                this.hide();
                return;
            }
        });
    }

    _completeHide(relatedTarget) {
        this._element.blur();
        this._element.setAttribute('aria-expanded', false);

        this._menu.classList.remove(CLASS_NAME_SHOW);
        this._element.classList.remove(CLASS_NAME_SHOW);
    }

    // static methods
    static clearMenus(event) {
        if (event.button === RIGHT_MOUSE_BUTTON || (event.type === 'keyup' && event.key !== 'Tab'))
            return;

        const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOW);

        for (const toggle of openToggles) {
            const context = Dropdown.getOrCreateInstance(toggle);
            if (!context || context._config.autoClose === false) continue;

            const composedPath = event.composedPath();
            const isMenuTarget = composedPath.includes(context._menu);

            if (
                composedPath.includes(context._element) ||
                (context._config.autoClose === 'inside' && !isMenuTarget) ||
                (context._config.autoClose === 'outside' && isMenuTarget))
            {
                continue;
            }

            if (context._menu.contains(event.target) && ((event.type === 'keyup' && event.key === TAB_KEY) ||
                /input|select|textarea|option|form/i.test(event.target.tagName))) {
                continue;
            }

            const relatedTarget = { relatedTarget: context._element };
            if (event.type === EVENT_CLICK) {
                relatedTarget.clickEvent = event;
            }

            context._completeHide(relatedTarget);
        }
    }

};

document.addEventListener(EVENT_CLICK, Dropdown.clearMenus);

SelectorEngine.find(SELECTOR_DATA_TOGGLE)
    .forEach((selector) => {
        selector.addEventListener(EVENT_CLICK, (event) => {
            const THIS = event.target.closest(SELECTOR_DATA_TOGGLE);

            event.preventDefault();

            if (isDisabled(THIS)) return;

            if (isVisible(THIS)) {
                THIS.focus();
            }

            const instance = Dropdown.getOrCreateInstance(THIS);
            instance.toggle();
        });
    });
