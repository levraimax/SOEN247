
function login() {
    let form = document.querySelector("form");

    //let netname = form.netname.value;
    //let password = form.password.value;

    sendQuery(form, "http://localhost:3000/login", function () {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            let [valid, admin] = JSON.parse(this.response);
            if (valid) {
                localStorage.setItem("user", form.netname.value);
                if (admin) {
                    window.location.href = '../html/adminLoged_in.html'
                } else {
                    window.location.href ="../html/userLoged_in.html"
                }
            } else {
                alert("Incorrect user / password combination");
            }
        }
    })

    return false;
    //let serverData = localStorage.getItem("serverData");
    //if (serverData == undefined) {
    //    return false;
    //} else {
    //    serverData = JSON.parse(serverData);
    //    if (serverData[netname] == undefined) return false;
    //}

    //if (serverData[netname]["password"] == password) {
    //    localStorage.setItem("user", netname);
    //    //window.location.href = '../html/userLoged_in.html';

    //    alert("User admin not implemented yet for testing convenience");
    //    if (window.location.href.includes("aLogin.html")) {
    //        window.location.href ='../html/adminLoged_in.html'
    //    } else {
    //        window.location.href = '../html/userLoged_in.html';
    //    }
    //}

}