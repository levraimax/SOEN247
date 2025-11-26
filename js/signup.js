

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
    const roles = document.querySelector("input[type='radio']:checked");

    if (every(form, (entry) => { return entry.value != "" }) && passwords[0].value == passwords[1].value && roles != null) {
        sendQuery(e.target, "http://localhost:3000/signup", function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                localStorage.setItem("user", e.target.netname.value)
                if(roles.value == "admin") {
                    window.location.href = '../html/adminLoged_in.html';
                }
                else{
                    window.location.href = '../html/userLoged_in.html';
                }
                
            }
        })
    }
    return false;
}

function profileJSON() {
    const form = document.querySelectorAll("div input:not([type='button']):not([type='password'])");
    let res = {};
    form.forEach((entry) => {
        res[entry.name] = entry.value;
    });
    return JSON.stringify(res);
}


