
function login() {
    let form = document.querySelector("form");

    //let netname = form.netname.value;
    //let password = form.password.value;

    sendQuery(form, "http://localhost:3000/login", function () {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            let [valid, admin, user] = JSON.parse(this.response);
            if (valid) {
                localStorage.setItem("user", form.netname.value);
                localStorage.setItem("reference", user);
                if (admin) {
                    window.location.href = '../html/adminLoged_in.html'
                } else {
                    window.location.href = "../html/userLoged_in.html"
                }
            } else {
                alert("Incorrect user / password combination");
            }
        }
    })

    return false;

}