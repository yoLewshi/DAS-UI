const API_URL = `${import.meta.env.VITE_DJANGO_SERVER}/api`;

const getAPI = function(url, callback) {

    const token = getCookie("DRF_Token");

    if(!token) {
        console.error(`Not authenticated to make call: ${url}`);
        return Promise.resolve();
    }

    return fetch(`${API_URL}${url}`, {headers: {"Authorization": `Token ${getCookie("DRF_Token")}`}}).then(parseResponse).then(callback).catch(handleErrors);
}

const postAPI = function(url, data, callback) {
    const headers = {
        "Content-Type": "application/json",
    }

    const cookieValue = getCookie("DRF_Token");
    if(cookieValue) {
        headers["Authorization"] = `Token ${cookieValue}`;
    }

    return fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: headers,
        mode: "cors",
        body: JSON.stringify(data)
    }).then(parseResponse).then(callback).catch(handleErrors);
}

const postForm = function(url, formData, callback) {
    return fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${getCookie("DRF_Token")}`,
        },
        mode: "cors",
        body: formData
    }).then(parseResponse).then(callback).catch(handleErrors);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function storeCookie(name, value) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + 365);
    const yearLoggedIn = dateObj.toUTCString();

    document.cookie = `${name}=${value}; expires=${yearLoggedIn}; path=/;`;
}

function deleteCookie(name) {
   document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function hasAuth() {
    return getCookie("DRF_Token") != null;
}

function clearAuth() {
    deleteCookie("DRF_Token");
}

const parseResponse = function(response) {
    if(!response.ok){
        console.log(response)
    }

    return response.json().then((parsed) => {
        if(parsed?.token) {
            storeCookie("DRF_Token", parsed.token);
        }

        parsed.APIMeta = {status: response.status}
        return parsed;
    });
}

const handleErrors = function(error) {
    console.error(error);
}

export {
    getAPI,
    postAPI,
    postForm,
    hasAuth,
    clearAuth
}