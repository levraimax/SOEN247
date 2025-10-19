

function displayData() {
    let user = localStorage.getItem('user'); // Fetch from server
    let serverData = JSON.parse(localStorage.getItem("serverData"));
    let data = serverData[user];
   
    data = { "Given Name": data["lastName"], "Name": data["firstName"], "email": data["email"], "Phone Number": data["Phone Number"] || undefined, "Address": data["Address"] || undefined };

    let contents = document.querySelector(".contents");

    for (let field in data) {
        let sub = contents.appendChild(document.createElement("form"));
        sub.classList.add("sub");
        sub.onsubmit = saveData;
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

function saveData(event) {
    // Post to server instead
    if (event.target[0].valid == undefined || event.target[0].valid) {
        let user = localStorage.getItem('user');
        let serverData = JSON.parse(localStorage.getItem("serverData"));
        serverData[user][event.target[0].name] = event.target[0].value;
        localStorage.setItem('serverData', JSON.stringify(serverData));
    }
    return false;
}