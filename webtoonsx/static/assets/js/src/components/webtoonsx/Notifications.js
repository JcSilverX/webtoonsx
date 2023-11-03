import Toast from '../Toast.js';
import SelectorEngine from '../dom/SelectorEngine.js';

const SELECTOR_DATA_NOTIFY = '[data-jsx-notify="jsxToast"]'

document.addEventListener('DOMContentLoaded', () => {
    const target = SelectorEngine.findOne(SELECTOR_DATA_NOTIFY);

    if (!target) return;

    Toast.getOrCreateInstance(target).show();
});
