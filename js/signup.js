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
        //localStorage.setItem("user", profileJSON());  // Use a session cookie instead later
        addPrivateData();
        window.location.href = '../html/loged_in.html'
    }
}

function addPrivateData() {
    const form = document.querySelectorAll("div input:not([type='button']):not([name='confirm'])");
    let res = {};
    form.forEach((entry) => {
        res[entry.name] = entry.value;
    });
    let data = localStorage.getItem("serverData") || {};
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

document.addEventListener("DOMContentLoaded", function() {
  const signInButton = document.getElementById("signin");

  signInButton.addEventListener("click", function() {
    const selectedRole = document.querySelector('input[name="role"]:checked');

    if (!selectedRole) {
      alert("Please select a role before signing in!");
      return;
    }

    if (selectedRole.value === "admin") {
      window.location.href = "../html/adminLoged_in.html";
    } else if (selectedRole.value === "user") {
      window.location.href = "../html/userLoged_in.html";
    }
  });
});
