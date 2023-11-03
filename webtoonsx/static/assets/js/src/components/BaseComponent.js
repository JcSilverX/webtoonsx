import Data from './dom/Data.js';
import Config from './utils/Config.js';
import { executeAfterTransition, getElement } from './utils/Utils.js';

const VERSION = '1.0.0';

export default class BaseComponent extends Config {
    constructor(element, config) {
        super();

        if (!element) return;

        this._element = element;
        this._config = this._getConfig(config);

        Data.set(this._element, this.constructor.DATA_KEY, this);
    };

    // getters/setters
    static get VERSION() {
        return VERSION;
    }

    static get DATA_KEY() {
        return `jsx.${this.NAME}`;
    }

    static get EVENT_KEY() {
        return `.${this.EVENT_KEY}`;
    }

    // public methods

    // private methods
    _getConfig(config) {
        config = this._mergeConfigObject(config, this._element);
        config = this._configAfterMerge(config);
        this._typeCheckConfig(config);
        return config;
    }

    _queueCallback(callback, element, isAnimation = true) {
        executeAfterTransition(callback, element, isAnimation);
    }

    // static methods
    static getInstance(element) {
        return Data.get(getElement(element), this.DATA_KEY);
    }

    static getOrCreateInstance(element, config = {}) {
        return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }

};