//let availabilities = localStorage.getItem("availabilities");
//if (availabilities == null) localStorage.setItem("availabilities", "{}");
//let requests = localStorage.getItem("requests");
//if (requests == null) localStorage.setItem("requests", "[]");
//let history = localStorage.getItem("history");
//if (history == null) localStorage.setItem("history", "[]");

function every(arr, func) {
    for (let i in arr) {
        if (!func(arr[i])) return false;
    }
    return true;
}

function signup(e) {
    e.preventDefault();
    const form = document.querySelectorAll("div input[type='text']");
    const passwords = document.querySelectorAll("div input[type='password']");
    const roles = document.querySelectorAll("div input[type='radio']:checked");

    if (every(form, (entry) => { return entry.value != "" }) && passwords[0].value == passwords[1].value && roles.length != 0) {
        sendQuery(e.target, "http://localhost:3000/signup", function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                localStorage.setItem("user", e.target.netname.value)
                window.location.href = '../html/profile.html';
            }
        })
    }
    return false;
}

//function signup() {
//    const form = document.querySelectorAll("div input[type='text']");
//    const passwords = document.querySelectorAll("div input[type='password']");
//    const roles = document.querySelectorAll("div input[type='radio']:checked");



//    if (every(form, (entry) => { return entry.value != "" }) && passwords[0].value == passwords[1].value && roles.length != 0) {
//        //localStorage.setItem("user", profileJSON());  // Use a session cookie instead later
//        addPrivateData();
//        window.location.href = '../html/profile.html'
//    }

//    return false;
//}

//function addPrivateData() {
//    //const form = document.querySelectorAll("div input:not([type='button']):not([name='confirm'])");
//    //let res = { "bookings": [], "pending": [] };
//    //form.forEach((entry) => {
//    //    res[entry.name] = entry.value;
//    //});
//    //let data = localStorage.getItem("serverData") || {};
//    //if (data["bookings"] == undefined) data["bookings"] = {};
//    //data[res["netname"]] = res;
//    //localStorage.setItem("serverData", JSON.stringify(data));
//    //localStorage.setItem("user", res["netname"]);
//}

function profileJSON() {
    const form = document.querySelectorAll("div input:not([type='button']):not([type='password'])");
    let res = {};
    form.forEach((entry) => {
        res[entry.name] = entry.value;
    });
    return JSON.stringify(res);
}


