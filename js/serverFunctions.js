//let serverData = localStorage.getItem("serverData");
//if (serverData == null) { serverData = { "bookings": [] }; } else {
//    serverData = JSON.parse(serverData);
//}

let user = localStorage.getItem("user");
let user_reference = localStorage.getItem("reference");
//if (user == null) {
//    alert("You must login for proper functionality.");
//    window.location.href = "../html/signup.html";
//} else if (serverData[user] == null) {
//    serverData[user] = { "bookings": [], "pending": [] };
//}

//let listings = localStorage.getItem("listings");
//if (listings == null) {
//    listings = [];
//}
//else {
//    listings = JSON.parse(listings);
//}

//let availabilities = localStorage.getItem("availabilities");
//if (availabilities == null) {
//    availabilities = {};
//}
//else {
//    availabilities = JSON.parse(availabilities);
//}

//let requests = localStorage.getItem("requests");
//if (requests == null) {
//    requests = [];
//}
//else {
//    requests = JSON.parse(requests);
//}

//let history = localStorage.getItem("history");
//if (history == null) {
//    //history = { "admin": [], "user": { [user]: [] } };
//    history = [];
//}
//else {
//    history = JSON.parse(history);
//}

//let resources = localStorage.getItem("resources");
//if (resources == null) {
//    resources = [{ "id": "studyRoom", "name": "Study Room", "description": "A quiet room for studying, equipped with tables, chairs, whiteboards, and enough space for group projects. Ideal for focused work or team study sessions.", "location": "H building and LB building", "capacity": "5", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/studyRoom.jpg", "blocked": false }, { "id": "comLab", "name": "Computer Lab", "description": "Rooms with computer labs available by ENCS students", "location": "H building", "capacity": "20", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/computer%20lab.jpg", "blocked": false }, { "id": "lab", "name": "Laboratory", "description": "Laboratory equipped with chemicals and lab equipment available for PhYS and CHEM students", "location": "H building", "capacity": "10", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/lab.png", "blocked": false }, { "id": "gym", "name": "Gym", "description": "Le Gym available for students of Concordia", "location": "SGW building", "capacity": "40", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/gym.jpg", "blocked": false }, { "id": "pTrainer", "name": "Personal Trainer", "description": "Personal Trainers professionaly trained to help you reach your fitness goals", "location": "SGW building", "capacity": "1", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/pTrainer.png", "blocked": false }, { "id": "yoga", "name": "Yoga Classes", "description": "Yoga classes available to all Concordia students", "location": "SGW building", "capacity": "10", "img": "file:///C:/Users/levra/Files/Uni/Term%2011%20(2025F)/SOEN%20287/Project/img/yoga.png", "blocked": false }]
//}
//else {
//    resources = JSON.parse(resources);
//}

function sendQuery(form, url, callback) {
    const params = new URLSearchParams(new FormData(form))
    GET(url + "?" + params.toString(), callback)
    return false;
}


function GET(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = callback;
    xmlHttp.open("GET", url, true);
    xmlHttp.send();
}

function GET_SYNC(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send()

    if (xmlHttp.response) {
        return JSON.parse(xmlHttp.response);
    }
    return null;
}

function USER_DATA(user) {
    let bookings = GET_SYNC(`http://localhost:3000/booksData?user=${user}`);
    let requests = GET_SYNC(`http://localhost:3000/requestsData?user=${user}`)
    let availabilities = GET_SYNC("http://localhost:3000/availabilities")

    for (let book of bookings) {
        book.availability = find(availabilities, (x) => { return x.reference == book.availability });
    }

    for (let req of requests) {
        req.availability = find(availabilities, (x) => { return x.reference == req.availability });
    }

    return { "bookings": bookings, "requests": requests };
}

function find(arr, dele) {
    for (let x of arr) if (dele(x)) return x
}

function sendResource(form) {
    let fd = new FormData(form);
    fd.set("image", form.image.files[0]);

    return fetch("http://localhost:3000/createResource", {
        method: "POST",
        body: fd
    })
}


// String formatted time
function formatDateFromServer(date) {
    let d = new Date(date);
    return d.toLocaleString();
}

function formattedDate(date) {
    var d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}


function binToImageSrc(bin) {
    return "data:image/png;base64," + bin;
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

function fileRequest(data,callback=null) {
    let fd = new URLSearchParams(data);
    GET_SYNC("http://localhost:3000/request?"+fd.toString())
    //let index = indexOfBook(listings, data);
    if (callback) callback();
    //if (index != -1 && !listings[index].auth) {
    //    serverData[user]["bookings"].push(listings[index]);
    //    cancel(listings[index]);
    //    appendHistory(`${user} booked ${data.resource} at ${data.time} on ${data.date}`);

    //} else {
    //    data["user"] = user;
    //    serverData[user]["pending"].push(data);

    //    requests.push(data)
    //    save("requests");
    //    appendHistory(`${user} requested ${data.resource} at ${data.time} on ${data.date}`);
    //    // Maybe add a pending booking?
    //}
    //save("serverData");
}

function getResource(dp) {
    return find(resources, (x) => { return x.reference == dp.resource })
}

function updateRequest(data, callback = None) {
    let fd = new URLSearchParams(data);
    GET_SYNC("http://localhost:3000/updateRequest?" + fd.toString())
    if (callback) callback();
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

function hasRoom(availability) {
    return new Promise((resolve, reject)=>{
        const sql = `
            SELECT r.capacity, COUNT(b.reference) as booked_count
            FROM availabilities a
            JOIN resources r ON a.resource = r.reference
            LEFT JOIN bookings b ON a.reference = b.availability
            WHERE a.reference = ?
            GROUP BY a.reference
        `;
        database.query(sql, [availability], (err, result)=>{
            if(err){
                reject(err);
            }else if(result.length === 0){
                resolve(false);
            }else{
                resolve(result[0].booked_count < result[0].capacity);
            }
        });
    });
}

