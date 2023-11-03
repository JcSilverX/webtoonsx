import Manipulator from '../dom/Manipulator.js';
import { isElement, toType } from './Utils.js';

export default class Config {

    // getters/setters
    static get NAME() {
        throw new Error('you have to implement the static "NAME", for each component.');
    }

    static get Default() {
        return { };
    }

    static get DefaultType() {
        return {}
    }

    // public methods

    // private methods
    _getConfig(config) {
        config = this._mergeConfigObject(config);
        config = this._configAfterMerge(config);
        return config;
    }

    _configAfterMerge(config) {
        return config;
    }

    _mergeConfigObject(config, element) {
        const jsonCfg = isElement(element) ? Manipulator.getDataAttribute(element, 'config') : {};

        return {
            ...this.constructor.Default,
            ...(typeof jsonCfg === 'object' ? jsonCfg : {}),
            ...(isElement(element) ? Manipulator.getDataAttributes(element) : {}),
            ...(typeof config === 'object' ? config : {})
        };
    }

    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
        for (const [key, value] of Object.entries(configTypes)) {
            const val = config[key];
            const valType = isElement(val) ? 'element' : toType(val);

            if (!new RegExp(value).test(valType)) {
                throw new TypeError('Invalid config');
            }
        }
    }

    // static methods

};
