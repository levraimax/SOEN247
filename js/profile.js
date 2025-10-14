

function displayData() {
    //let data = JSON.parse(localStorage.getItem('user')); // Fetch from server
    let data = { "Given Name": "Charest", "Name": undefined, "Email": undefined, "Phone Number": undefined, "Address": undefined };

    let contents = document.querySelector(".contents");

    for (let field in data) {
        let sub = contents.appendChild(document.createElement("div"));
        sub.classList.add("sub");
        //Add the p with field
        sub.appendChild(document.createElement("p")).textContent = field;
        let input = sub.appendChild(document.createElement("input"));
        input.type = "text";
        if (data[field] != undefined) input.value = data[field];
    }
}