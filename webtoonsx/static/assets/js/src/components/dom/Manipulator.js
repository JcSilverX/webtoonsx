
const normalizeData = (value) => {
    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    if (value === Number(value).toString()) {
        return Number(value);
    }

    if (value === '' || value === 'null') {
        return null;
    }

    if (typeof value !== 'string') {
        return value;
    }

    try {
        return JSON.parse(decodeURIComponent(value));
    } catch {
        return value;
    }
};

const normalizeDataKey = (key) => {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
};

const Manipulator = {
    setDataAttribute(element, key, value) {
        element.setAttribute(`data-jsx-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
        element.removeAttribute(`data-jsx-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
        if (!element) {
            return {};
        }

        const attributes = {};
        const jsxKeys = Object.keys(element.dataset).filter(key => key.startsWith('jsx') && !key.startsWith('jsxConfig'));

        for (const key of jsxKeys) {
            let pureKey = key.replace(/^jsx/, '');
            pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
            attributes[pureKey] = normalizeData(element.dataset[key]);
        }
        return attributes;
    },
    getDataAttribute(element, key) {
        return normalizeData(element.getAttribute(`data-jsx-${normalizeDataKey(key)}`));
    }
}

export default Manipulator;