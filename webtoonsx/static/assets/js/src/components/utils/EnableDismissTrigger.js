import SelectorEngine from '../dom/SelectorEngine.js';
import { isDisabled } from './Utils.js';

const enableDismissTrigger = (component, method = 'hide') => {
    const EVENT_CLICK = 'click';
    const name = component.NAME;

    const SELECTOR_DATA_DISMISS = `[data-jsx-dismiss="${name}"]`;

    SelectorEngine.find(SELECTOR_DATA_DISMISS)
        .forEach((selector) => {
            selector.addEventListener(EVENT_CLICK, (event) => {
                const THIS = event.target.closest(SELECTOR_DATA_DISMISS);

                event.preventDefault();

                if (isDisabled(THIS)) return;

                const target = SelectorEngine.getElementFromSelector(THIS) || THIS.closest(`.${name}`);
                const instance = component.getOrCreateInstance(target);

                instance[method]();
            });
        });
};

export default enableDismissTrigger;