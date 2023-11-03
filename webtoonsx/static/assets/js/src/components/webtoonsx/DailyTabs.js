import Carousel from '../Carousel.js';
import SelectorEngine from '../dom/SelectorEngine.js';

const SELECTOR_DAILY_TABS = '#daily-tabs';

const EVENT_DOMCONTENTLOADED = 'DOMContentLoaded';

export default class DailyTabs extends Carousel {
    constructor(element, config) {
        super(element, config);

        this.current_day = this.getCurrentDate.getDay();
    };

    // getters/setters
    get getCurrentDate() {
        return new Date();
    }

    get getCurrentDay() {
        return this.current_day;
    }

    // public methods

    // private methods

    // static methods

};

document.addEventListener(EVENT_DOMCONTENTLOADED, () => {
    const THIS = SelectorEngine.findOne(SELECTOR_DAILY_TABS);

    if (THIS === null) return;

    const dailyTabs = DailyTabs.getOrCreateInstance(THIS);
    const currentDay = dailyTabs.getCurrentDay;

    dailyTabs.to(currentDay);
    dailyTabs._maybeEnableCycle();
});
