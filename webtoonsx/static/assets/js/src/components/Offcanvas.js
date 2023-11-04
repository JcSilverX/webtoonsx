import BaseComponent from './BaseComponent.js';
import SelectorEngine from './dom/SelectorEngine.js';

import {
    isDisabled,
    isVisible,
    reflow,
} from './utils/Utils.js';

import enableDismissTrigger from './utils/EnableDismissTrigger.js';
import Backdrop from './utils/Backdrop.js';

const NAME = 'offcanvas';

const ESCAPE_KEY = 'Escape';

const CLASS_NAME_SHOW = 'show';
const CLASS_NAME_SHOWING = 'showing';
const CLASS_NAME_HIDING = 'hiding';
const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
const OPEN_SELECTOR = '.offcanvas.show';

const EVENT_LOAD = 'load';
const EVENT_RESIZE = 'resize';
const EVENT_CLICK = 'click';
const EVENT_KEYDOWN = 'keydown';

const SELECTOR_DATA_TOGGLE = '[data-jsx-toggle="offcanvas"]';

const Default = {
    backdrop: true,
    keyboard: true,
    scroll: false
};

const DefaultType = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    scroll: 'boolean'
};


export default class Offcanvas extends BaseComponent {
    constructor(element, config) {
        super(element, config)

        this._isShown = false;
        this._backdrop = this._initBackdrop();

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
    toggle(relatedTarget) {
        return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
        if (this._isShown) return;

        this._isShown = true;
        this._backdrop.show();

        if (!this._config.scroll) {
            document.body.style.overflowY = 'hidden';
        }

        this._element.setAttribute('aria-modal', true);
        this._element.setAttribute('role', 'dialog');
        this._element.classList.add(CLASS_NAME_SHOWING);

        const completeCallBack = () => {
            if (!this._config.scroll || this._config.backdrop) this._element.focus();

            this._element.classList.add(CLASS_NAME_SHOW);
            this._element.classList.remove(CLASS_NAME_SHOWING);
        }

        this._queueCallback(completeCallBack, this._element, true);
    }

    hide() {
        if (!this._isShown) return;

        this._element.blur();
        this._isShown = false;
        this._element.classList.add(CLASS_NAME_HIDING);
        this._backdrop.hide();

        const completeCallback = () => {
            this._element.classList.remove(CLASS_NAME_SHOW, CLASS_NAME_HIDING);
            this._element.removeAttribute('aria-modal');
            this._element.removeAttribute('role');

            if (!this._config.scroll) {
                document.body.style.overflowY = 'initial';
            }
        };

        this._queueCallback(completeCallback, this._element, true);
    }

    dispose() {
        this._backdrop.dispose();

        super.dispose();
    }

    // private methods
    _initBackdrop() {
        const clickCallback = () => {
            if (this._config.backdrop === 'static') {
                return;
            }

            this.hide();
        }

        const isVisible = Boolean(this._config.backdrop);

        return new Backdrop({
            className: CLASS_NAME_BACKDROP,
                isVisible,
            isAnimated: true,
            rootElement: this._element.parentNode,
            clickCallback: isVisible ? clickCallback : null
        });
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

    // static methods
}

// event handler
SelectorEngine.find(SELECTOR_DATA_TOGGLE)
    .forEach((selector) => {
        selector.addEventListener(EVENT_CLICK, (event)  => {
            const THIS = event.target.closest(SELECTOR_DATA_TOGGLE);
            const target = SelectorEngine.getElementFromSelector(THIS);

                event.preventDefault();

                if (isDisabled(THIS)) return;

                if (isVisible(target)) {
                    target.focus();
                }

                const isAlreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
                if (isAlreadyOpen && isAlreadyOpen !== target) {
                    Offcanvas.getInstance(isAlreadyOpen).hide();
                }

                const instance = Offcanvas.getOrCreateInstance(target);
                instance.toggle(target);
        });
    });

window.addEventListener(EVENT_LOAD, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
        Offcanvas.getOrCreateInstance(selector).show();
    }
});

window.addEventListener(EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-')) {
        if (getComputedStyle(element).position !== 'fixed') {
            Offcanvas.getOrCreateInstance(element).hide();
        }
    }
});

enableDismissTrigger(Offcanvas);
