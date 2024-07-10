const getAPI = function(url, callback) {
     return fetch(url).then(parseResponse).then(callback).catch(handleErrors);
}

const postAPI = function(url, data, callback) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getDjangoCSRFCookie('csrftoken'),
             
        },
        mode: "same-origin",
        body: JSON.stringify(data)
    }).then(parseResponse).then(callback).catch(handleErrors);
}

const postForm = function(url, formData, callback) {
    return fetch(url, {
        method: "POST",
        headers: {
            "X-CSRFToken": getDjangoCSRFCookie("csrftoken"),
        },
        mode: "same-origin",
        body: formData
    }).then(parseResponse).then(callback).catch(handleErrors);
}

function getDjangoCSRFCookie(name) {
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

const parseResponse = function(response) {
    return response.json();
}

const handleErrors = function(error) {
    console.error(error);
}

export {
    getAPI,
    postAPI,
    postForm
}