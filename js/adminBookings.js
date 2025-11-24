let listingsElem, resource, start, end, auth, loaded = false, requestsElem, toModify, approval, requestTarget;
let listings;
let resources;

function loadData() {
    loadListings();
    loadResources();
    loadRequests();

    listingsElem = document.querySelector(".listings");
    resource = document.querySelector("select[name='resource']");
    start = document.querySelector("input[name='start']");
    end = document.querySelector("input[name='end']");
    auth = document.querySelector("input[name='auth']");
    requestsElem = document.querySelector(".requests");
    approval = document.querySelector(".requestApproval");
}


function loadListings() {
    listings = GET_SYNC("http://localhost:3000/availabilities")
}

function loadResources() {
    resources = GET_SYNC("http://localhost:3000/resources")
}

function loadRequests() {
    requests = GET_SYNC("http://localhost:3000/requests")

}

function accessData(list, ref) {
    for (data of list) {
        if (data["reference"] == ref) return data;
    }
    return null;
}

function displayBookings() {
    if (!loaded) {
        loaded = true;
        for (let res of resources) {
            resource.appendChild(document.createElement("option")).textContent = res.name + ` (${res.reference})`;
            resource.lastChild.reference = res.reference;
        }
        resource.value = "";
    }

    listingsElem.textContent = "";

    for (let book of listings) {
        displayBooking(book);
    }
}

function displayRequests() {
    requestsElem.innerHTML = "<p>Approval Pending</p>"

    for (let req of requests) {
        displayRequest(req);
    }
}

function displayRequest(req) {
    let div = requestsElem.appendChild(document.createElement("div"));
    div.classList.add("request");
    div.data = req;
    div.appendChild(document.createElement("span")).textContent = `${req.name} (${req.resource})`;
    div.appendChild(document.createElement("span")).textContent = formatDateFromServer(req.start);
    div.appendChild(document.createElement("span")).textContent = formatDateFromServer(req.end);
    div.appendChild(document.createElement("span")).textContent = req.netname;
    //requests.appendChild(document.createElement("button")).textContent = "\u2713";
    //requests.appendChild(document.createElement("button")).textContent = "\u0078";
}

function displayApproval(target, visibility = true) {
    if (!approval.classList.contains("hidden") || target == requestsElem) {
        approval.classList.add("hidden");
        return;
    }

    requestTarget = target.closest(".request");

    if (visibility) {
        approval.style.top = target.getBoundingClientRect().bottom + "px";
        approval.style.left = requestsElem.getBoundingClientRect().right + "px";
        approval.style.transform = "translate(-100%)"
        approval.classList.remove("hidden");
    } else {
        approval.classList.add("hidden");
    }
}

function requestDecision(decision) {
    console.log(requestTarget.data)

    if (!decision) {
        // Declined
        let fd = new URLSearchParams(requestTarget.data);
        GET_SYNC("http://localhost:3000/deleteRequest?" + fd.toString())
        
    } else {
        //Approved
        GET_SYNC(`http://localhost:3000/approveRequest?request=${requestTarget.data.reference}`);
        loadListings();
    }

    loadRequests();
    displayRequests();
    ////let reqData = JSON.parse(localStorage.getItem("requests"));
    //remove(requests, requestTarget.data);

    ////let serverData = JSON.parse(localStorage.getItem("serverData"));
    //remove(serverData[requestTarget.data.user]["pending"], requestTarget.data);
    //let temp = requestTarget.data.user;

    //if (decision) {
    //    //let serverData = JSON.parse(localStorage.getItem("serverData"));
    //    // Remove the user from the req.data
    //    cancel(requestTarget.data);

    //    delete requestTarget.data["user"];
    //    serverData[temp]["bookings"].push(requestTarget.data);
    //}

    //appendHistory(`${user} ${decision ? "approved" : "denied"} booking request: ${requestTarget.data.resource} at ${requestTarget.data.time} on ${requestTarget.data.date} from ${temp}`, true);
    //appendHistory(`Booking request for ${requestTarget.data.resource} at ${requestTarget.data.time} on ${requestTarget.data.date} was ${decision ? "approved" : "denied"}.`, false, temp)
    ////appendHistory()

    //requestTarget = null;
    ////localStorage.setItem("serverData", JSON.stringify(serverData));
    ////localStorage.setItem("requests", JSON.stringify(reqData));
    //save("serverData")
    //save("requests")

    //displayRequests();
    displayApproval(null, false);
}

function displayBooking(book) {
    //listings.textContent = "";
    listingsElem.appendChild(document.createElement("div")).classList.add("booking");
    let booking = listingsElem.lastChild;
    let resource = accessData(resources, book.resource);
    book.resource_name = resource.name + ` (${resource.reference})`;
    booking.data = book;
    //booking.appendChild(document.createElement("div")).textContent = book.resource;

    booking.appendChild(document.createElement("div")).textContent = book.resource_name;
    //booking.appendChild(document.createElement("div")).textContent = book.time;
    booking.appendChild(document.createElement("div")).textContent = (new Date(book.start)).toLocaleString();
    //booking.appendChild(document.createElement("div")).textContent = book.date;
    booking.appendChild(document.createElement("div")).textContent = (new Date(book.end)).toLocaleString();
    booking.appendChild(document.createElement("button")).textContent = "Modify";
    let right = booking.appendChild(document.createElement("button"))
    right.textContent = "Cancel";
    right.classList.add("right");
}


function createBooking(event) {
    event.preventDefault();
    let form = document.getElementById("creationForm")
    let temp = { "resource": form.resource.selectedOptions[0].reference, "start": start.value, "end": end.value, "auth": (auth.checked) ? 1 : 0 };
    console.log(temp)
    let fd = new URLSearchParams(temp);
    console.log(fd.toString())
    //return;
    GET_SYNC("http://localhost:3000/createAvailability?" + fd.toString())
    loadListings();
    //return;
    //let dateValue = end.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1");
    //let authValue = auth.checked;

    ////let serverListings = JSON.parse(localStorage.getItem("listings"));
    //let data = { "resource": resource.value, "time": start.value, "date": dateValue, auth: authValue };
    //listings.push(data)
    ////localStorage.setItem("listings", JSON.stringify(serverListings));
    //save("listings");

    ////let availabilities = JSON.parse(localStorage.getItem("availabilities"));
    //if (availabilities[dateValue] == undefined) availabilities[dateValue] = {};
    //if (availabilities[dateValue][start.value] == undefined) availabilities[dateValue][start.value] = [];
    //availabilities[dateValue][start.value].push(data);
    ////localStorage.setItem("availabilities", JSON.stringify(availabilities));
    //save("availabilities");

    //appendHistory(`${user} made ${data.resource} available at ${data.time} on ${data.date}`, true);

    clear();
    displayBookings();
    return false;
}

//function indexOfReq(arr, req) {
//    for (let i in arr) {
//        let r = arr[i];
//        if (r.resource === req.resource &&
//            r.time === req.time &&
//            r.date === req.date &&
//            r.user == req.user) {
//            return arr.indexOf(r);
//        }
//    }
//    return -1;
//}

//function indexOfBook(arr, book) {
//    for (let i in arr) {
//        let b = arr[i];
//        if (b.resource === book.resource &&
//            b.time === book.time &&
//            b.date === book.date &&
//            b.auth == book.auth) {
//            return arr.indexOf(b);
//        }
//    }
//    return -1;
//}


//function removeReq(arr, req) {
//    let x = indexOfReq(arr, req);
//    if (x != -1) arr.splice(x, 1);
//}
//function remove(arr, target) {
//    let x = indexOfBook(arr, target);
//    if (x != -1) arr.splice(x, 1);
//}

function buttonModifyClick(button) {
    switch (button.textContent) {
        case "Save":
            // Change the listings and availabilities to reflect the data of this booking
            // Requires modifying the user's bookings too

            //let res = { "resource": resource.value, "time": time.value, "date": date.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1"), "auth": auth.checked }
            let res = { "reference": toModify.data.reference, "resource": toModify.data.resource, "start": start.value, "end": end.value, "auth": (auth.checked) ? 1 : 0 }
            let fd = new URLSearchParams(res);
            GET_SYNC("http://localhost:3000/updateAvailability?" + fd.toString())
            loadListings();
            //return;
            //// Listing
            ////let listings = JSON.parse(localStorage.getItem("listings"));
            //listings[indexOfBook(listings, toModify.data)] = res;
            //// Availabilities
            ////let availabilities = JSON.parse(localStorage.getItem("availabilities"));

            //if (toModify.data.date == res.date && toModify.data.time == res.time) {
            //    availabilities[res.date][res.time][indexOfBook(availabilities[res.date][res.time], toModify.data)] = res;
            //} else {
            //    remove(availabilities[toModify.data.date][toModify.data.time], toModify.data);
            //    if (availabilities[res.date] == undefined) availabilities[res.date] = {};
            //    if (availabilities[res.date][res.time] == undefined) availabilities[res.date][res.time] = [];
            //    availabilities[res.date][res.time].push(res);
            //}
            //appendHistory(`${user} modified booking: ${toModify.data.resource} at ${toModify.data.time} on ${toModify.data.date} to ${res.resource} at ${res.time} on ${res.date}`, true);
            toModify.data = res;

            //localStorage.setItem("listings", JSON.stringify(listings));
            //localStorage.setItem("availabilities", JSON.stringify(availabilities));
            //save("listings");
            //save("availabilities");

            document.getElementById("submit").classList.remove("hidden");
            document.querySelectorAll(".creation button").forEach(btn => btn.classList.add("hidden"));
            clear()
            displayBookings();

            // User
            alert("user modification not implemented, will require user reference when booking");


            break;
        case "Back":
            document.getElementById("submit").classList.remove("hidden");
            document.querySelectorAll(".creation button").forEach(btn => btn.classList.add("hidden"));
            clear();
            break;
    }
    toModify = null;
}

function clear() {
    resource.value = "";
    start.value = "";
    end.value = "";
    auth.checked = false;
}





function buttonClick(button) {
    toModify = button.closest(".booking");
    let data = toModify.data;

    switch (button.textContent) {
        case "Modify":
            //alert(button.textContent + ", " + data.resource + " " + data.time + " " + data.date);
            resource.value = data.resource_name;
            //time.value = data.time;


            start.value = formattedDate(data.start)
            end.value = formattedDate(data.end);
            //date.value = data.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
            auth.checked = data.auth;


            document.getElementById("submit").classList.add("hidden");
            document.querySelectorAll(".creation button").forEach(btn => btn.classList.remove("hidden"));
            //Modifying allows to modify the contents
            // -Resource
            // -Time
            // -Date
            //Validity is displayed to the user with color
            //When valid, the user can click the save button (new value of the Modify button), or
            //the Back button to discard changes (revert function of some sorts).

            break;
        case "Cancel":
            ////let serverListings = JSON.parse(localStorage.getItem("listings"));
            //appendHistory(`${user} removed listing: ${data.resource} at ${data.time} on ${data.date}`, true);
            //cancel(data);
            ////remove(listings, data)
            ////remove(availabilities[data.date][data.time], data);
            ////save("listings");
            ////save("availabilities");

            GET_SYNC(`http://localhost:3000/deleteAvailability?reference=${data.reference}`)
            loadListings();

            if (toModify != null) {
                document.getElementById("submit").classList.remove("hidden");
                document.querySelectorAll(".creation button").forEach(btn => btn.classList.add("hidden"));
                clear();
            }

            break;
    }
    displayBookings();
}