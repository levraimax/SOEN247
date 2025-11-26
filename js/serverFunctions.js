

let user = localStorage.getItem("user");
let user_reference = localStorage.getItem("reference");


function sendQuery(form, url, callback) {
    const params = new URLSearchParams(new FormData(form))
    GET(url + "?" + params.toString(), callback)
    return false;
}


function GET(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.withCredentials = true;
    xmlHttp.onreadystatechange = callback;
    xmlHttp.open("GET", url, true);
    xmlHttp.send();
}

function GET_SYNC(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.withCredentials = true;
    xmlHttp.open("GET", url, false);
    xmlHttp.send()

    // Only parse if status is 200 and response exists
    if (xmlHttp.status === 200 && xmlHttp.response) {
        try {
            return JSON.parse(xmlHttp.response);
        } catch (e) {
            console.error('GET_SYNC: Failed to parse JSON from ' + url, e);
            return null;
        }
    } else if (xmlHttp.status !== 200) {
        console.warn('GET_SYNC: HTTP ' + xmlHttp.status + ' from ' + url + ': ' + xmlHttp.response);
        return null;
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
        body: fd,
        credentials: "include"  // Include authentication cookie
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


}


function save(name) {
    alert("LOCAL STORAGE SAVING IS OBSOLETE")
    console.log("LOCAL STORAGE SAVING IS OBSOLETE")
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

