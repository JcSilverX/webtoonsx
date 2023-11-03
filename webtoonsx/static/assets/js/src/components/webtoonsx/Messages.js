import Toast from '../Toast.js';
import SelectorEngine from '../dom/SelectorEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    const messages = SelectorEngine.findOne('#messages');
    if (!messages) return;

    Toast.getOrCreateInstance(messages).show();
});
