
function login() {
    let form = document.querySelector("form");

    let netname = form.netname.value;
    let password = form.password.value;

    let serverData = localStorage.getItem("serverData");
    if (serverData == undefined) {
        return false;
    } else {
        serverData = JSON.parse(serverData);
        if (serverData[netname] == undefined) return false;
    }

    if (serverData[netname]["password"] == password) {
        localStorage.setItem("user", netname);
        window.location.href = '../html/loged_in.html';
    }

    return false;
}