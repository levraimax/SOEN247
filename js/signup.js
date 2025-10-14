function every(arr, func) {
    for (let i in arr) {
        if (!func(arr[i])) return false;
    }
    return true;
}

function signup() {
    const form = document.querySelectorAll("div input:not([type='submit'])");
    const passwords = document.querySelectorAll("div input[type='password']");
    if (every(form, (entry) => { return entry.value != "" }) && passwords[0].value == passwords[1].value) {
        window.location.href = '../html/loged_in.html'
    }
}