import BaseComponent from './BaseComponent.js';
import SelectorEngine from  './dom/SelectorEngine.js';
import enableDismissTrigger from './utils/EnableDismissTrigger.js';
import {
    isDisabled,
    reflow
} from './utils/Utils.js';

const NAME = 'toast';

const EVENT_CLICK = 'click';
const EVENT_MOUSEOVER = 'mouseover';
const EVENT_MOUSEOUT = 'mouseout';
const EVENT_FOCUSIN = 'focusin';
const EVENT_FOCUSOUT = 'focusout';
const EVENT_HIDE = 'hide';
const EVENT_SHOW = 'show';
const EVENT_SHOWN = 'shown';

const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';
const CLASS_NAME_SHOWING = 'showing';

const SELECTOR_DATA_TRIGGER = '[data-jsx-trigger="toast"]';

const Default = {
    animation: true,
    autohide: true,
    delay: 5000
};

const DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number',
};

export default class Toast extends BaseComponent {
    constructor(element, config) {
        super(element, config);

        this._timeout = null;
        this._hasMouseInteraction = false;
        this._hasKeyboardInteraction = false;

        this._setListeners();
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
    show() {
        this._clearTimeout();

        if (this._config.animation) {
            this._element.classList.add(CLASS_NAME_FADE);
        }

        const complete = () => {
            this._element.classList.remove(CLASS_NAME_SHOWING);
            this._maybeScheduleHide();
        };
        reflow(this._element);
        this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);

        this._queueCallback(complete, this._element, this._config.animation);
    }

    hide() {
        if (!this.isShown()) return;

        const complete = () => {
            this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
        };

        this._element.classList.add(CLASS_NAME_SHOWING);
        this._queueCallback(complete, this._element, this._config.animation);
    }

    dispose() {
        this._clearTimeout();

        if (this.isShown()) {
            this._element.classList.remove(CLASS_NAME_SHOW);
        }
        super.dispose();
    }

    isShown() {
        return this._element.classList.contains(CLASS_NAME_SHOW);
    }

    // private methods
    _maybeScheduleHide() {
        if (!this._config.autohide) return;

        if (this._hasMouseInteraction || this._hasKeyboardInteraction) return;

        this._timeout = setTimeout(() => {
            this.hide();
        }, this._config.delay);
    }

    _onInteraction(event, isInteracting) {
        switch (event.type) {
            case EVENT_MOUSEOVER:
            case EVENT_MOUSEOUT: {
                    this._hasMouseInteraction = isInteracting;
                    break;
                }

            case EVENT_FOCUSIN:
            case EVENT_FOCUSOUT: {
                    this._hasKeyboardInteraction = isInteracting;
                    break;
                }

            default: {
                break;
            }
        }

        if (isInteracting) {
            this._clearTimeout();
            return;
        }

        const nextElement = event.relatedTarget;
        if (this._element === nextElement || this._element.contains(nextElement)) return;

        this._maybeScheduleHide();
    }

    _setListeners() {
        this._element.addEventListener(EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
        this._element.addEventListener(EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
        this._element.addEventListener(EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
        this._element.addEventListener(EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
    }

    _clearTimeout() {
        clearTimeout(this._timeout);
        this._timeout = null;
    }

    // static methods

};

// trigger
SelectorEngine.find(SELECTOR_DATA_TRIGGER).forEach((selector) => {
    selector.addEventListener(EVENT_CLICK, (event) => {
        const THIS = event.target.closest(SELECTOR_DATA_TRIGGER);
        const target = SelectorEngine.getElementFromSelector(THIS);

        event.preventDefault();

        if (isDisabled(THIS)) return;

        const toastJsx = Toast.getOrCreateInstance(target);
        toastJsx.show();
    });
});

enableDismissTrigger(Toast);
