
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
        //window.location.href = '../html/userLoged_in.html';

        alert("User admin not implemented yet for testing convenience");
        if (window.location.href.includes("aLogin.html")) {
            window.location.href ='../html/adminLoged_in.html'
        } else {
            window.location.href = '../html/userLoged_in.html';
        }
    }

    return false;
}