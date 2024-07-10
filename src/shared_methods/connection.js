const checkConnection = async () => {

    AbortSignal.timeout ??= function timeout(ms) {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), ms);
        return ctrl.signal;
    };

    return fetch("https://www.google.com", { signal: AbortSignal.timeout(2000), mode: "no-cors" }).then((r) => {
      return true;
    })
}

export {
    checkConnection
}