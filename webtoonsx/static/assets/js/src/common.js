import getCookie from './components/utils/GetCookie.js';

export const BASE_API_URL = '/';

// get data
export const getData = async (completeURL, obj) => {
    const response = await fetch(completeURL, {
            body: JSON.stringify( obj ),
            method: 'POST',
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        });

    const data = await response.json();

    if (!response.ok) { // 4xx, 5xx status code
        throw new Error(data.description);
    }
    return data;
};
