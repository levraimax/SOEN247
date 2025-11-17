<<<<<<< HEAD
const fieldMap = { "Given Name": "last_name", "Name": "name", "Email": "email", "Phone Number": "phone", "Address": "address" };

function displayData() {
    let user = localStorage.getItem('user'); // Fetch from server
    GET(`http://localhost:3000/userdata?netname=${user}`, callback);
    function callback() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            let data = JSON.parse(this.response)[0];
            data = { "Given Name": data["last_name"], "Name": data["name"], "Email": data["email"], "Phone Number": data["phone"] || undefined, "Address": data["address"] || undefined };
            let contents = document.querySelector(".contents");

            for (let field in data) {
                let sub = contents.appendChild(document.createElement("form"));
                sub.classList.add("sub");
                //sub.onsubmit = saveData;
                //Add the p with field
                sub.appendChild(document.createElement("p")).textContent = capitalize(field);
                let input = sub.appendChild(document.createElement("input"));
                input.type = "text";
                input.name = field;
                if (field == "Phone Number") input.oninput = (event) => { input.valid = formatPhone(event.target) };
                if (field == "Email") input.oninput = (event) => { input.valid = validEmail(event.target) };
                let submit = sub.appendChild(document.createElement("input"));
                submit.classList.add("hidden");
                submit.type = "submit";
                if (data[field] != undefined) input.value = data[field];
            }
        }
=======

function displayData() {
    let user = localStorage.getItem('user'); // Fetch from server
    let serverData = JSON.parse(localStorage.getItem("serverData"));
    let data = serverData[user];

    data = {
        "Last Name": data["lastName"],
        "First Name": data["firstName"],
        "Email": data["email"],
        "Phone Number": data["Phone Number"] || undefined,
        "Address": data["Address"] || undefined
    };

    let contents = document.querySelector(".contents");

    let nameRow = null;

    for (let field in data) {
        let parent = contents;
        if (field === "Last Name") {
            nameRow = document.createElement("div");
            nameRow.classList.add("name-row");
            contents.appendChild(nameRow);
            parent = nameRow;
        } else if (field === "First Name" && nameRow) {
            parent = nameRow;
        }

        let sub = parent.appendChild(document.createElement("form"));
        sub.classList.add("sub");
        sub.onsubmit = saveData;

        sub.appendChild(document.createElement("p")).textContent = capitalize(field);

        let input = sub.appendChild(document.createElement("input"));
        input.type = "text";
        input.name = field;

        if (field == "Phone Number") input.oninput = (event) => { input.valid = formatPhone(event.target) };
        if (field == "Email") input.oninput = (event) => { input.valid = validEmail(event.target) };

        let submit = sub.appendChild(document.createElement("input"));
        submit.classList.add("hidden");
        submit.type = "submit";

        if (data[field] != undefined) input.value = data[field];
>>>>>>> 2e03de82b6210308d2cea8d8665808d0085b1e01
    }
}

<<<<<<< HEAD
function send(event) {
    event.preventDefault()
    let field = event.target.querySelector("input[type='text']");
    if (fieldMap[field.name] != "phone" || field.value.length == 13)
        GET(`http://localhost:3000/submituserdata?field=${fieldMap[field.name]}&value=${field.value}&user=${user}`, null);
=======
    let saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.classList.add("saveBtn");
    saveBtn.onclick = saveAll;
    contents.appendChild(saveBtn);
}


function saveAll() {
    let user = localStorage.getItem('user');
    let serverData = JSON.parse(localStorage.getItem("serverData"));
    let data = serverData[user];

    let forms = document.querySelectorAll(".sub");
    forms.forEach(form => {
        let input = form.querySelector("input");
        let fieldName = input.name;
        if (input.valid === undefined || input.valid) {
            data[fieldName] = input.value;
        }
    });

    localStorage.setItem("serverData", JSON.stringify(serverData));

>>>>>>> 2e03de82b6210308d2cea8d8665808d0085b1e01
}


function capitalize(word) {
    return word.replace(/(^|\s)\w/, letter => letter.toUpperCase());
}

function formatPhone(input) {
    let text = input.value.replace(/\D/g, "");
    text = text.substring(0, 10);
    if (text.length > 7) {
        text = text.replace(/(\d{3})(?=\d{2})/g, "$1-");
    } else {
        text = text.replace(/(\d{3})(?=\d{1})/g, "$1-");
    }

    input.value = text;

    return /\d{3}-\d{3}-\d{4}/.test(text);
}

function validEmail(input) {
    return /^[\w]+@([\w]{1,}\.)[\w]{1,}$/.test(input.value);
}

//function saveData(event) {
//    // Post to server instead
//    if (event.target[0].valid == undefined || event.target[0].valid) {
//        let user = localStorage.getItem('user');
//        let serverData = JSON.parse(localStorage.getItem("serverData"));
//        serverData[user][event.target[0].name] = event.target[0].value;
//        localStorage.setItem('serverData', JSON.stringify(serverData));
//    }
//    return false;
//}