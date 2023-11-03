import Config from './Config.js';
import elementFromHTML from './CreateElement.js';
import { execute, executeAfterTransition, getElement, reflow } from './Utils.js';

const NAME = 'backdrop';
const CLASS_NAME_FADE = 'fade';
const CLASS_NAME_SHOW = 'show';

const EVENT_MOUSEDOWN = 'mousedown';

const Default = {
    className: 'modal-backdrop',
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    rootElement: 'body',
};

const DefaultType = {
    className: 'string',
    clickCallback: '(function|null)',
    isAnimated: 'boolean',
    isVisible: 'boolean',
    rootElement: '(element|string)',
};

export default class Backdrop extends Config {
    constructor(config) {
        super();

        this._config = this._getConfig(config);
        this._isAppended = false;
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
    show(callback) {
        if (!this._config.isVisible) {
            execute(callback);
            return;
        }

        this._appendElement();

        const element = this._getElement();
        if (this._config.isAnimated) {
            reflow(element);
        }

        element.classList.add(CLASS_NAME_SHOW);

        this._emulateAnimation(() => {
            execute(callback);
        });
    }

    hide(callback) {
        if (!this._config.isVisible) {
            execute(callback);
            return;
        }

        this._getElement().classList.remove(CLASS_NAME_SHOW);

        this._emulateAnimation(() => {
            this.dispose();
            execute(callback);
        });
    }

    dispose() {
        if (!this._isAppended) return;

        this._element.remove();
        this._isAppended = false;
    }

    // private methods
    _getElement() {
        if (!this._element) {
            const backdrop = elementFromHTML(`<div class="${this._config.className}"></div>`);
            if (this._config.isAnimated) {
                backdrop.classList.add(CLASS_NAME_FADE);
            }
            this._element = backdrop;
        }
        return this._element;
    }

    _configAfterMerge(config) {
        config.rootElement = getElement(config.rootElement)
        return config
    }

    _appendElement() {
        if (this._isAppended) return;

        const element = this._getElement();
        this._config.rootElement.append(element);

        element.addEventListener(EVENT_MOUSEDOWN, () => {
            execute(this._config.clickCallback);
        });

        this._isAppended = true;
    }

    _emulateAnimation(callback) {
        executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }

    // static methods

};

