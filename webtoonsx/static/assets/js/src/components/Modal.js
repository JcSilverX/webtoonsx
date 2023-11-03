import BaseComponent from './BaseComponent.js';
import SelectorEngine from './dom/SelectorEngine.js';
import Backdrop from './utils/Backdrop.js';
import { isDisabled, isVisible, execute, reflow } from './utils/Utils.js';
import enableDismissTrigger from './utils/EnableDismissTrigger.js';

const NAME = 'modal';

const ESCAPE_KEY = 'Escape';

const EVENT_MOUSEDOWN = 'mousedown';
const EVENT_KEYDOWN = 'keydown';
const EVENT_CLICK = 'click';

const CLASS_NAME_OPEN = 'modal-open';
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';
const CLASS_NAME_STATIC = 'modal-static';

const OPEN_SELECTOR = '.modal.show';
const SELECTOR_DIALOG = '.modal__dialog';
const SELECTOR_DATA_TOGGLE = '[data-jsx-toggle="modal"]';

const Default = {
    backdrop: true,
    focus: true,
    keyboard: true,
    isTransitioning: true,
};

const DefaultType = {
    backdrop: '(boolean|string)',
    focus: 'boolean',
    keyboard: 'boolean',
    isTransitioning: 'boolean',
};

export default class Modal extends BaseComponent {
    constructor(element, config) {
        super(element, config);

        this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
        this._backdrop = this._initBackdrop();
        this._isShown = false;
        this._transitionState = !this._config.isTransitioning;

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
        if (this._isShown || this._transitionState) return;

        this._isShown = true;
        this._transitionState = this._config.isTransitioning;

        document.body.classList.add(CLASS_NAME_OPEN);

        this._backdrop.show(() => this._showElement(relatedTarget));
    }

    hide() {
        if (!this._isShown || this._transitionState) return;

        this._isShown = false;
        this._transitionState = this._config.isTransitioning;

        this._element.classList.remove(CLASS_NAME_SHOW);

        this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }

    dispose() {
        this._backdrop.dispose();

        super.dispose();
    }

    // private methods
    _initBackdrop() {
        return new Backdrop({
            isVisible: true,
            isAnimated: true,
        });
    }

    _showElement(relatedTarget) {
        this._element.style.display = 'block';
        this._element.removeAttribute('aria-hidden');

        reflow(this._element);

        this._element.classList.add(CLASS_NAME_SHOW);

        const transitionComplete = () => {
            if (this._config.focus) this._element.focus();

            this._transitionState = !this._config.isTransitioning;
        };

        this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }

    _addEventListeners() {
        this._element.addEventListener(EVENT_KEYDOWN, (event) => {
            if (event.key !== ESCAPE_KEY) return;

            if (this._config.keyboard) {
                this.hide();
                return;
            }
            this._triggerBackdropTransition();
        });

        this._element.addEventListener(EVENT_MOUSEDOWN, (event) => {
            this._element.addEventListener(EVENT_CLICK, (event2) => {
                if (this._element !== event.target || this._element !== event2.target) return;

                if (this._config.backdrop === 'static') {
                    this._triggerBackdropTransition();
                    return;
                }

                if (this._config.backdrop) {
                    this.hide();
                }
            });
        });
    }

    _hideModal() {
        this._element.style.display = 'none';
        this._element.setAttribute('aria-hidden', true);
        this._transitionState = !this._config.isTransitioning;

        this._backdrop.hide(() => {
            document.body.classList.remove(CLASS_NAME_OPEN);
        });
    }

    _isAnimated() {
        return this._element.classList.contains(CLASS_NAME_FADE);
    }

    _triggerBackdropTransition() {
        this._element.classList.add(CLASS_NAME_STATIC);
        this._queueCallback(() => {
            this._element.classList.remove(CLASS_NAME_STATIC);
        }, this._dialog);
    }

    // static methods

};

// event handler
SelectorEngine.find(SELECTOR_DATA_TOGGLE)
    .forEach((selector) => {
        selector.addEventListener(EVENT_CLICK, (event) => {
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

            const instance = Modal.getOrCreateInstance(target);
            instance.toggle(target);
        });
    });

enableDismissTrigger(Modal);
