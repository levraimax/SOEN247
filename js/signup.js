function every(arr, func) {
    for (let i in arr) {
        if (!func(arr[i])) return false;
    }
    return true;
}

function signup() {
    const form = document.querySelectorAll("div input:not([type='button'])");
    const passwords = document.querySelectorAll("div input[type='password']");


    if (every(form, (entry) => { return entry.value != "" }) && passwords[0].value == passwords[1].value) {
        sessionStorage.setItem("user", profileJSON());  // Use a session cookie instead later
        window.location.href = '../html/loged_in.html'
    }
}

function profileJSON() {
    const form = document.querySelectorAll("div input:not([type='button']):not([type='password'])");
    let res = {};
    form.forEach((entry) => {
        res[entry.name] = entry.value;
    });
    return JSON.stringify(res);
}