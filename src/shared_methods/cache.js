function setValue(key, value) {
    const created = (new Date()).getTime();
    localStorage.setItem(key, JSON.stringify({created: created, value: value}));
}

function getValue(key) {
    return JSON.parse(localStorage.getItem(key));
}

function clearValue(key) {
    localStorage.remove(key);
}

export { setValue, getValue, clearValue }