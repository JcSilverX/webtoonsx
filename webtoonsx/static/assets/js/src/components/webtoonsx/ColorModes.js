import elementFromHtml from '../utils/CreateElement.js';

const SELECTOR_DATA_TOGGLE = '[data-jsx-theme-value]';

(() => {
    'use strict'

    const getStoredTheme = () => localStorage.getItem('theme');
    const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();

        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark': 'light';
    };

    const setTheme = (theme) => {
        if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-jsx-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-jsx-theme', theme);
        }
    };

    setTheme(getPreferredTheme());

    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#theme');

        if (!themeSwitcher) { return; }

        const themeSwitcherText = document.querySelector('#theme-text');
        const activeThemeIcon = document.querySelector('.theme__icon--active use');
        const btnToActive = document.querySelector(`[data-jsx-theme-value="${theme}"]`);
        const activeBtn = btnToActive.querySelector('use').getAttribute('href');

        document.querySelectorAll('[data-jsx-theme-value]')
            .forEach((element) => {
                element.classList.remove('active');
                element.setAttribute('aria-pressed', 'false');
            });

        btnToActive.classList.add('active');
        btnToActive.setAttribute('aria-pressed', 'true');

        setCheckMarkIcon();

        activeThemeIcon.setAttribute('href', activeBtn);

        const className = activeThemeIcon.getAttribute('href').substring(1);
        const newEl = elementFromHtml(`<i class="bi bi-${className} fs-14"></i>`);

        if (activeThemeIcon.firstChild !== null) {
            activeThemeIcon.firstChild.remove();
        }

        activeThemeIcon.insertAdjacentElement('beforeend', newEl);

        const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.jsxThemeValue})`;
        themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);

        if (focus) {
            themeSwitcher.focus();
        }
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getStoredTheme());
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme());

        document.querySelectorAll(SELECTOR_DATA_TOGGLE)
            .forEach((selector) => {
                selector.addEventListener('click', (event) => {
                    const THIS = event.target.closest(SELECTOR_DATA_TOGGLE);
                    const theme = THIS.getAttribute('data-jsx-theme-value');

                    event.preventDefault();

                    setStoredTheme(theme);
                    setTheme(theme);
                    showActiveTheme(theme, true);

                });
            });
    });

    const setCheckMarkIcon = () => {
        document.querySelectorAll('[data-jsx-theme-value]').forEach((element) => {
            if (element.classList.contains('active')) {
                element.querySelector('[class*="bi-check"]').classList.remove('d-none');
            } else {
                element.querySelector('[class*="bi-check"]').classList.add('d-none');
            }
        });
    };

}) ();
