import Modal from '../Modal.js';
import SelectorEngine from '../dom/SelectorEngine.js';

const ESCAPE_KEY = 'Escape';
const K_KEY = 'k';

const EVENT_DOMCONTENTLOADED = 'DOMContentLoaded';
const EVENT_MOUSEDOWN = 'mousedown';
const EVENT_KEYDOWN = 'keydown';
const EVENT_CLICK = 'click';

const SEARCH_BTN_SELECTOR = '.search__btn';

export default class Search extends Modal {
    constructor(element, config) {
        super(element, config);
    };

    // setters/getters

    // public methods

    // private methods
    _addEventListeners() {
        this._element.addEventListener(EVENT_KEYDOWN, (event) => {
            if (event.key !== ESCAPE_KEY) return;

            if (this._config.keyboard) {
                this.hide();
                return;
            }
            this._triggerBackdropTransition();
        });

        document.addEventListener(EVENT_KEYDOWN, (event) => {
            event.stopImmediatePropagation();

            if (event.ctrlKey && event.key === K_KEY) {
                event.preventDefault();

                if (this._config.keyboard)  {
                    this.toggle(this._element);
                    return;
                }
            }
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

    // static methods

};

// event handler
document.addEventListener(EVENT_DOMCONTENTLOADED, (event) => {
    const selector = SelectorEngine.findOne(SEARCH_BTN_SELECTOR);
    if (selector === null) return;

    const target = SelectorEngine.getElementFromSelector(selector);

    const instance = Search.getOrCreateInstance(target);
});
