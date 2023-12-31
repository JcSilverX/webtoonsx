import BaseComponent from './BaseComponent.js';
import SelectorEngine from './dom/SelectorEngine.js';
import Manipulator from './dom/Manipulator.js';
import Swipe from './utils/Swipe.js';

import {
    getNextActiveElement,
    isVisible,
    isRTL,
    reflow,
    triggerTransitionEnd
} from './utils/Utils.js';

const NAME = 'carousel';

const ARROW_LEFT_KEY = 'ArrowLeft';
const ARROW_RIGHT_KEY = 'ArrowRight';
const TOUCHEVENT_COMPAT_WAIT = 500;

const EVENT_SLIDE = 'slide';
const EVENT_SLID = 'slid';
const EVENT_KEYDOWN = 'keydown';
const EVENT_MOUSEENTER = 'mouseenter';
const EVENT_MOUSELEAVE = 'mouseleave';
const EVENT_DRAG_START = 'dragstart';
const EVENT_LOAD = 'load';
const EVENT_CLICK = 'click';

const ORDER_NEXT = 'next';
const ORDER_PREV = 'prev';
const DIRECTION_LEFT = 'left';
const DIRECTION_RIGHT = 'right';

const CLASS_NAME_CAROUSEL = 'carousel';
const CLASS_NAME_ACTIVE = 'active';
const CLASS_NAME_SLIDE = 'slide';
const CLASS_NAME_END = 'carousel__item--end';
const CLASS_NAME_START = 'carousel__item--start';
const CLASS_NAME_NEXT = 'carousel__item--next';
const CLASS_NAME_PREV = 'carousel__item--prev';

const SELECTOR_ACTIVE = '.active';
const SELECTOR_ITEM = '.carousel__item';
const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
const SELECTOR_ITEM_IMG = '.carousel__item img';
const SELECTOR_INDICATORS = '.carousel__indicators, .carousel__tabs';
const SELECTOR_DATA_SLIDE = '[data-jsx-slide], [data-jsx-slide-to]';
const SELECTOR_DATA_RIDE = '[data-jsx-ride="carousel"]';

const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY]: DIRECTION_LEFT,
};

const Default = {
    interval: 5000,
    keyboard: true,
    pause: 'hover',
    ride: false,
    touch: true,
    wrap: true,
};

const DefaultType = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    pause: '(string|boolean)',
    ride: '(boolean|string)',
    touch: 'boolean',
    wrap: 'boolean'
};

export default class Carousel extends BaseComponent {
    constructor(element, config) {
        super(element, config);

        this._interval = null;
        this._activeElement = null;
        this._isSliding = false;
        this.touchTimeout = null;
        this._swipeHelper = null;

        this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
        this._addEventListeners();

        if (this._config.ride === CLASS_NAME_CAROUSEL) {
            this.cycle();
        }
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
    next() {
        this._slide(ORDER_NEXT);
    }

    nextWhenVisible() {
        if (!document.hidden && isVisible(this._element)) {
            this.next();
        }
    }

    prev() {
        this._slide(ORDER_PREV);
    }

    pause() {
        if (!this._isSliding) {
            triggerTransitionEnd(this._element);
        }

        this._clearInterval();
    }

    cycle() {
        this._clearInterval();
        this._updateInterval();

        this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }

    to(index) {
        const items = this._getItems();

        if (index > items.length - 1 || index < 0) return;

        if (this._isSliding) {
            this._element.addEventListener(EVENT_SLID, () => this.to(index));
            return;
        }

        const activeIndex = this._getItemIndex(this._getActive());
        if (activeIndex === index) return;

        const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
        this._slide(order, items[index]);
    }

    dispose() {
        if (this._swipeHelper) {
            this._swipeHelper.dispose();
        }

        super.dispose();
    }

    // private methods
    _maybeEnableCycle() {
        if (!this._config.ride) return;

        if (this._isSliding) {
            this._element.addEventListener(EVENT_SLID, () => this.cycle());
            return;
        }

        this.cycle();
    }

    _configAfterMerge(config) {
        config.defaultInterval = config.interval;
        return config;
    }

    _addEventListeners() {
        if (this._config.keyboard) {
            this._element.addEventListener(EVENT_KEYDOWN, (event) => this._keydown(event));
        }

        if (this._config.pause === 'hover') {
            this._element.addEventListener(EVENT_MOUSEENTER, () => this.pause());
            this._element.addEventListener(EVENT_MOUSELEAVE, () => this._maybeEnableCycle());
        }

        if (this._config.touch && Swipe.isSupported()) {
            this._addTouchEventListeners();
        }
    }

    _addTouchEventListeners() {
        for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
            img.addEventListener(EVENT_DRAG_START, (event) => event.preventDefault());
        }

        const endCallBack = () => {
            if (this._config.pause !== 'hover') return;

            this.pause();
            if (this.touchTimeout) {
                clearTimeout(this.touchTimeout);
            }

            this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
        };

        const swipeConfig = {
            leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
            rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
            endCallback: endCallBack
        };

        this._swipeHelper = new Swipe(this._element, swipeConfig);
    }

    _keydown(event) {
        if (/input|textarea/i.test(event.target.tagName)) return;

        const direction = KEY_TO_DIRECTION[event.key];
        if (direction) {
            event.preventDefault();
            this._slide(this._directionToOrder(direction));
        }
    }

    _getItemIndex(element) {
        return this._getItems().indexOf(element);
    }

    _setActiveIndicatorElement(index) {
        if (!this._indicatorsElement) return;

        const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);

        activeIndicator.classList.remove(CLASS_NAME_ACTIVE);
        activeIndicator.removeAttribute('aria-current');

        const newActiveIndicator = SelectorEngine.findOne(`[data-jsx-slide-to="${index}"]`, this._indicatorsElement);

        if (newActiveIndicator) {
            newActiveIndicator.classList.add(CLASS_NAME_ACTIVE);
            newActiveIndicator.setAttribute('aria-current', 'true');
        }
    }

    _updateInterval() {
        const element = this._activeElement || this._getActive();
        if (!element) return;

        const elementInterval = Number.parseInt(element.getAttribute('data-jsx-interval'), 10);
        this._config.interval = elementInterval || this._config.defaultInterval;
    }

    _slide(order, element = null) {
        if (this._isSliding) return;

        const activeElement = this._getActive();
        const isNext = order === ORDER_NEXT;
        const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);

        if (nextElement === activeElement) return;

        const nextElementIndex = this._getItemIndex(nextElement);

        const triggerEvent = (eventName) => {
            return this._element.addEventListener(eventName, {
                relatedTarget: nextElement,
                direction: this._orderToDirection(order),
                from: this._getItemIndex(activeElement),
                to: nextElementIndex
            });
        };

        const slideEvent = triggerEvent(EVENT_SLIDE);

        if (!activeElement || !nextElement) return;

        const isCycling = Boolean(this._interval);
        this.pause();

        this._isSliding = true;

        this._setActiveIndicatorElement(nextElementIndex);
        this._activeElement = nextElement;

        const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
        const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;

        nextElement.classList.add(orderClassName);
        reflow(nextElement);

        activeElement.classList.add(directionalClassName);
        nextElement.classList.add(directionalClassName);

        const completeCallBack = () => {
            nextElement.classList.remove(directionalClassName, orderClassName);
            nextElement.classList.add(CLASS_NAME_ACTIVE);

            activeElement.classList.remove(CLASS_NAME_ACTIVE, orderClassName, directionalClassName);

            this._isSliding = false;

            triggerEvent(EVENT_SLID);
        };

        this._queueCallback(completeCallBack, activeElement, this._isAnimated());

        if (isCycling) {
            this.cycle();
        }
    }

    _isAnimated() {
        return this._element.classList.contains(CLASS_NAME_SLIDE);
    }

    _getActive() {
        return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }

    _getItems() {
        return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }

    _clearInterval() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }

    _directionToOrder(direction) {
        if (isRTL()) {
            return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
        }

        return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }

    _orderToDirection(order) {
        if (isRTL()) {
            return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }

        return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }

    // static methods

};

SelectorEngine.find(SELECTOR_DATA_SLIDE)
    .forEach((selector) => {
        selector.addEventListener(EVENT_CLICK, (event) => {
            const THIS = event.target.closest(SELECTOR_DATA_SLIDE);
            const target = SelectorEngine.getElementFromSelector(selector);

            if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) return;

            event.preventDefault();

            const carousel = Carousel.getOrCreateInstance(target);
            const slideIndex = THIS.getAttribute('data-jsx-slide-to');

            if (slideIndex) {
                carousel.to(slideIndex);
                carousel._maybeEnableCycle();
                return;
            }

            if (Manipulator.getDataAttribute(THIS, 'slide') === 'next') {
                carousel.next();
                carousel._maybeEnableCycle();
                return;
            }

            carousel.prev();
            carousel._maybeEnableCycle();
        });
    });

window.addEventListener(EVENT_LOAD, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);

    for (const carousel of carousels) {
        Carousel.getOrCreateInstance(carousel);
    }
});
