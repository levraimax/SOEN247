
function login() {
    let form = document.querySelector("form");

    //let netname = form.netname.value;
    //let password = form.password.value;

<<<<<<< HEAD
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
=======
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

        if (window.location.href.includes("aLogin.html")) {
            window.location.href ='../html/adminLoged_in.html'
        } else {
            window.location.href = '../html/userLoged_in.html';
>>>>>>> 2e03de82b6210308d2cea8d8665808d0085b1e01
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