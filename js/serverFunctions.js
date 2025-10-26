let serverData = localStorage.getItem("serverData");
if (serverData == null) { serverData = { "bookings": [] }; } else {
    serverData = JSON.parse(serverData);
}

let user = localStorage.getItem("user");
if (user == null) {
    alert("You must login for proper functionality.");
    window.location.href = "../html/signup.html";
} else if (serverData[user] == null) {
    serverData[user] = { "bookings": [], "pending": [] };
}

let listings = localStorage.getItem("listings");
if (listings == null) {
    listings = [];
}
else {
    listings = JSON.parse(listings);
}

let availabilities = localStorage.getItem("availabilities");
if (availabilities == null) {
    availabilities = {};
}
else {
    availabilities = JSON.parse(availabilities);
}

let requests = localStorage.getItem("requests");
if (requests == null) {
    requests = [];
}
else {
    requests = JSON.parse(requests);
}

let history = localStorage.getItem("history");
if (history == null) {
    //history = { "admin": [], "user": { [user]: [] } };
    history = [];
}
else {
    history = JSON.parse(history);
}

let resources = localStorage.getItem("resources");
if (resources == null) {
    resources = [{ "id": "studyRoom", "name": "Study Room", "description": "A quiet room for studying, equipped with tables, chairs, whiteboards, and enough space for group projects. Ideal for focused work or team study sessions.", "location": "H building and LB building", "capacity": "5", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/studyRoom.jpg", "blocked": false }, { "id": "comLab", "name": "Computer Lab", "description": "Rooms with computer labs available by ENCS students", "location": "H building", "capacity": "20", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/computer%20lab.jpg", "blocked": false }, { "id": "lab", "name": "Laboratory", "description": "Laboratory equipped with chemicals and lab equipment available for PhYS and CHEM students", "location": "H building", "capacity": "10", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/lab.png", "blocked": false }, { "id": "gym", "name": "Gym", "description": "Le Gym available for students of Concordia", "location": "SGW building", "capacity": "40", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/gym.jpg", "blocked": false }, { "id": "pTrainer", "name": "Personal Trainer", "description": "Personal Trainers professionaly trained to help you reach your fitness goals", "location": "SGW building", "capacity": "1", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/pTrainer.png", "blocked": false }, { "id": "yoga", "name": "Yoga Classes", "description": "Yoga classes available to all Concordia students", "location": "SGW building", "capacity": "10", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/yoga.png", "blocked": false }]
}
else {
    resources = JSON.parse(resources);
}


function remove(arr, book) {
    let x = indexOfBook(arr, book);
    if (x != -1) arr.splice(x, 1);
}

function removeReq(arr, req) {
    let x = indexOfReq(arr, req);
    if (x != -1) arr.splice(x, 1);
}

function cancel(data) {
    remove(listings, data)
    remove(availabilities[data.date][data.time], data);
    save("listings");
    save("availabilities");
}

function indexOfBook(arr, book) {
    for (let b of arr) {
        if (b.resource === book.resource &&
            b.time === book.time &&
            b.date === book.date) {
            return arr.indexOf(b);
        }
    }
    return -1;
}

function indexOfReq(arr, req) {
    for (let r of arr) {
        if (r.user == req.user &&
            r.date == req.date &&
            r.time == req.time &&
            r.resource == req.resource)
            return arr.indexOf(r)
    }
    return -1;
}

function fileRequest(data) {
    let index = indexOfBook(listings, data);

    if (index != -1 && !listings[index].auth) {
        serverData[user]["bookings"].push(listings[index]);
        cancel(listings[index]);
        appendHistory(`${user} booked ${data.resource} at ${data.time} on ${data.date}`);

    } else {
        data["user"] = user;
        serverData[user]["pending"].push(data);

        requests.push(data)
        save("requests");
        appendHistory(`${user} requested ${data.resource} at ${data.time} on ${data.date}`);
        // Maybe add a pending booking?
    }
    save("serverData");

}

function appendHistory(text, admin = false, userOnly = null) {
    if (!userOnly) history.push({ "log": `(${(new Date()).toLocaleString()}) ${text}`, "admin": admin, "user": user })
    if (userOnly != null) history.push({ "log": `(${(new Date()).toLocaleString()}) ${text}`, "admin": false, "user": userOnly, userOnly: true })
    save("history");
}


function save(name) {
    switch (name) {
        case "serverData":
            localStorage.setItem("serverData", JSON.stringify(serverData));
            break;
        case "listings":
            localStorage.setItem("listings", JSON.stringify(listings));
            break;
        case "availabilities":
            localStorage.setItem("availabilities", JSON.stringify(availabilities));
            break;
        case "requests":
            localStorage.setItem("requests", JSON.stringify(requests));
            break;
        case "history":
            localStorage.setItem("history", JSON.stringify(history));
            break;
        case "resources":
            localStorage.setItem("resources", JSON.stringify(resources));
            break;
    }
}
