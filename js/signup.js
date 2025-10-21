function every(arr, func) {
    for (let i in arr) {
        if (!func(arr[i])) return false;
    }
    return true;
}

function signup() {
    const form = document.querySelectorAll("div input[type='text']");
    const passwords = document.querySelectorAll("div input[type='password']");
    const roles = document.querySelectorAll("div input[type='radio']:checked");

    let availabilities = localStorage.getItem("availabilities");
    if (availabilities == null) localStorage.setItem("availabilities", "{}");


    if (every(form, (entry) => { return entry.value != "" }) && passwords[0].value == passwords[1].value && roles.length != 0) {
        //localStorage.setItem("user", profileJSON());  // Use a session cookie instead later
        addPrivateData();
        window.location.href = '../html/home.html'
    }

    return false;
}

function addPrivateData() {
    const form = document.querySelectorAll("div input:not([type='button']):not([name='confirm'])");
    let res = { "bookings": [] };
    form.forEach((entry) => {
        res[entry.name] = entry.value;
    });
    let data = localStorage.getItem("serverData") || {};
    if (data["bookings"] == undefined) data["bookings"] = {};
    data[res["netname"]] = res;
    localStorage.setItem("serverData", JSON.stringify(data));
    localStorage.setItem("user", res["netname"]);
}

function profileJSON() {
    const form = document.querySelectorAll("div input:not([type='button']):not([type='password'])");
    let res = {};
    form.forEach((entry) => {
        res[entry.name] = entry.value;
    });
    return JSON.stringify(res);
}


