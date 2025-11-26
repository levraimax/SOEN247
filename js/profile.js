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
    }
}

function send(event) {
    event.preventDefault()
    let field = event.target.querySelector("input[type='text']");
    if (fieldMap[field.name] != "phone" || field.value.length == 12)
        GET(`http://localhost:3000/submituserdata?field=${fieldMap[field.name]}&value=${field.value}&user=${user}`, null);
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
