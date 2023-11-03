import BaseComponent from './BaseComponent.js';
import SelectorEngine from './dom/SelectorEngine.js';

const NAME = 'FormValidator';

const EVENT_SUBMIT = 'submit';

const Default = {
    pass: true,
    grecaptcha: false
};

const DefaultType = {
    pass: 'boolean',
    grecaptcha: '(string|boolean)'
};

export default class FormValidator extends BaseComponent {
    constructor(element, config) {
        super(element, config);

        this.inputsWithErrors = new Set();
        this._submitButton = SelectorEngine.findOne('[type="submit"]', this._element);

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

    get hasErrors() {
         return this.inputsWithErrors.size > 0;
    }

    // public methods
    formValidator(selector, callback, ...args) {
        const [ typeEvent, errorEl ] = args;

        const inputField = SelectorEngine.findOne(selector, this._element);
        const errorElement = SelectorEngine.findOne(errorEl) || [];

        const execute = async (hideErrors) => {
            const { pass, error } = await callback(inputField.value.trim(), inputField);

            if (!hideErrors) {
                errorElement.textContent = error || '';
            }

            this._config.pass = pass;

            if (!this._config.pass) {
                this.inputsWithErrors.add(inputField);
                this._submitButton.disabled = true;
            } else {
                this.inputsWithErrors.delete(inputField);
                this._submitButton.disabled = false;
            }
        };

        inputField.addEventListener(typeEvent, () => execute());
        execute(true);
    }

    // private
    _addEventListeners() {
        this._element.addEventListener(EVENT_SUBMIT, (event) => {
            event.preventDefault();

            if (!this.hasErrors) {
                if (!this._config.grecaptcha) {
                    this._element.submit();
                    return;
                }

                this._grecaptcha();
            }
        });
    }

    // private methods
    _grecaptcha() {

    }

    // static methods

};
