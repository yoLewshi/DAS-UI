const API_URL = import.meta.env.VITE_DJANGO_SERVER_API;

const getAPI = function(url, callback) {
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
            "Authorization": getCookie("DRF_Token"),
        },
        credentials: "include",
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
    document.cookie = `${name}=${value}`;
}

const parseResponse = function(response) {
    return response.json().then((parsed) => {
        if(parsed?.token) {
            storeCookie("DRF_Token", parsed.token);
        }

        return parsed;
    });
}

const handleErrors = function(error) {
    console.error(error);
}

export {
    getAPI,
    postAPI,
    postForm
}