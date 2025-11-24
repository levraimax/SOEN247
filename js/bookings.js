let creation, resource, time, date, toModify, rResource, rDate, rTime;
//let loaded = false;
let resources, requests, availabilities, bookings;
function loadResources() {
    resources = GET_SYNC("http://localhost:3000/resources")
    for (let res of resources) {
        res.displayName = `${res.name} (${res.reference})`
    }
}

function loadAvailabilities() {
    availabilities = GET_SYNC("http://localhost:3000/availabilities")
}

function getAvailability(ref) {
    for (let av of availabilities) if (av.reference == ref) return av;
}

function getBookings() {
    bookings = GET_SYNC(`http:localhost:3000/booksData?user=${user_reference}`)
}

//function getResource(dp) {
//    return find(resources, (x) => { return x.reference == dp.resource })
//}

function loadData() {
    let data = USER_DATA(2);
    bookings = data.bookings;
    for (let book of bookings) {
        let resource = getResource(book.availability)
        book.displayName = `${resource.name} (${resource.reference})`
        book.pending = false;
    }

    requests = data.requests;

    for (let req of requests) {
        let resource = (req.availability != null) ? getResource(req.availability) : find(resources, (x) => x.reference == req.resource)
        req.displayName = `${resource.name} (${resource.reference})`
        req.pending = true;
    }
}


function load() {
    loadAvailabilities();
    loadResources();
    loadData()



    //loaded = true;
    listingsElem = document.querySelector(".listings");
    creation = document.querySelector(".creation");
    //user = localStorage.getItem("user");
    resource = document.querySelector("select[name='resource']");
    time = document.querySelector(".creation input[name='start']");
    date = document.querySelector(".creation input[name='end']");
    rResource = document.querySelector("select[name='requestResource']");
    rTime = document.querySelector("input[name='start']");
    rDate = document.querySelector("input[name='end']");

    //let resources = JSON.parse(localStorage.getItem("resources"));
    for (let res of resources) {
        rResource.appendChild(document.createElement("option")).textContent = res.displayName;
        resource.appendChild(document.createElement("option")).textContent = res.displayName;

        rResource.lastChild.data = res;
        resource.lastChild.data = res;

        rResource.value = "";
        resource.value = "";
    }
}


function displayBookings() {
    //if (!loaded) {
    //    loaded = true;
    //    listingsElem = document.querySelector(".listings");
    //    creation = document.querySelector(".creation");
    //    //user = localStorage.getItem("user");
    //    resource = document.querySelector("select[name='resource']");
    //    time = document.querySelector("input[name='time']");
    //    date = document.querySelector("input[name='date']");
    //    rResource = document.querySelector("select[name='requestResource']");
    //    rTime = document.querySelector("input[name='start']");
    //    rDate = document.querySelector("input[name='end']");

    //    //let resources = JSON.parse(localStorage.getItem("resources"));
    //    for (let res of resources) {
    //        rResource.appendChild(document.createElement("option")).textContent = res.name;
    //        resource.appendChild(document.createElement("option")).textContent = res.name;
    //    }
    //}

    listingsElem.textContent = "";
    //let data = JSON.parse(localStorage.getItem("serverData"));

    //for (let book of serverData[user]["bookings"]) {
    //    displayBooking(book);
    //}

    for (let book of bookings) displayBooking(book)

    //for (let pending of serverData[user]["pending"]) {
    //    displayPending(pending);
    //}

    for (let pending of requests) displayPending(pending)

}

function displayBooking(book) {
    //listings.textContent = "";
    listingsElem.appendChild(document.createElement("div")).classList.add("booking");
    let booking = listingsElem.lastChild;
    booking.data = book;
    //booking.appendChild(document.createElement("div")).textContent = book.resource;
    //booking.appendChild(document.createElement("div")).textContent = book.time;     // Start
    //booking.appendChild(document.createElement("div")).textContent = book.date;     // End

    booking.appendChild(document.createElement("div")).textContent = book.displayName;
    booking.appendChild(document.createElement("div")).textContent = formatDateFromServer(book.start);     // Start
    booking.appendChild(document.createElement("div")).textContent = formatDateFromServer(book.end);     // End
    booking.appendChild(document.createElement("button")).textContent = "Modify";
    let right = booking.appendChild(document.createElement("button"))
    right.textContent = "Cancel";
    right.classList.add("right");
}

function displayPending(pending) {
    listingsElem.appendChild(document.createElement("div")).classList.add("booking");
    let booking = listingsElem.lastChild;
    booking.classList.add("pending");
    //let temp = pending

    //if (pending.availability != null) {
    //    temp = pending.availability;
    //}
    booking.reference = pending.reference
    //booking.data = temp;
    booking.data = pending;
    //booking.appendChild(document.createElement("div")).textContent = temp.resource;
    //booking.appendChild(document.createElement("div")).textContent = temp.time;
    //booking.appendChild(document.createElement("div")).textContent = temp.date;
    //booking.appendChild(document.createElement("div")).textContent = getResource(temp).displayName;
    booking.appendChild(document.createElement("div")).textContent = pending.displayName;
    booking.appendChild(document.createElement("div")).textContent = formatDateFromServer(pending.start);
    booking.appendChild(document.createElement("div")).textContent = formatDateFromServer(pending.end);
    booking.appendChild(document.createElement("div")).textContent = "Approval pending";
    booking.appendChild(document.createElement("button")).textContent = "Modify";
    let right = booking.appendChild(document.createElement("button"))
    right.textContent = "Cancel";
    right.classList.add("right");
}


//function indexOfBook(arr, book) {
//    for (let i in arr) {
//        let b = arr[i];
//        if (b.resource === book.resource &&
//            b.time === book.time &&
//            b.date === book.date) {
//            return arr.indexOf(b);
//        }
//    }
//    return -1;
//}

//function indexOfReq(arr,req) {
//    for (let r of arr) {
//        if (r.user==req.user && r.date==req.date && r.time==req.time && r.resource==req.resource) return arr.indexOf(r)
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

function showSidebar(visibility = true) {
    if (visibility) {
        //listings.style.width = "calc(70%*2/3)";
        creation.classList.remove("hidden");
    } else {
        //listings.style.width = "70%";
        creation.classList.add("hidden");
    }
}

function requestClick(button) {
    switch (button.textContent) {
        case "Submit":
            if (rResource.value == "" || rTime.value == "" || rDate.value == "") {
                alert("Please fill in all fields.");
                return;
            }
            //let res = { "user": user, "resource": rResource.value, "time": rTime.value, "date": rDate.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1") }
            let selected = rResource.selectedOptions[0]
            let res = { "user": user_reference, "resource": selected.data.reference, "start": rTime.value, "end": rDate.value }

            let existing = find(availabilities, (av) => {
                return av.resource == res.resource && new Date(av.start) <= new Date(res.start) && new Date(res.end) <= new Date(av.end); 
            })

            if (existing) res.reference = existing.reference

            //console.log(res)
            // Check if it is in listings (and not auth)

            // Add it to the requests
            //let serverRequests = JSON.parse(localStorage.getItem("requests"));
            //serverRequests.push(res) 
            //localStorage.setItem("requests", JSON.stringify(serverRequests));
            fileRequest(res, loadData);
            break;
    }
    clearRequests();
    displayBookings();
}

//function fileRequest(data) {
//    let listings = JSON.parse(localStorage.getItem("listings"));
//    let index = indexOfBook(listings, data);
//    let serverData = JSON.parse(localStorage.getItem("serverData"));

//    if (index != -1 && !listings[index].auth) {
//        serverData[user]["bookings"].push(listings.splice(index, 1)[0]);
//        localStorage.setItem("listings", JSON.stringify(listings));
//    } else {
//        data["user"] = user;
//        serverData[user]["pending"].push(data);

//        let serverRequests = JSON.parse(localStorage.getItem("requests"));
//        serverRequests.push(data)
//        localStorage.setItem("requests", JSON.stringify(serverRequests));
//        // Maybe add a pending booking?
//    }
//    localStorage.setItem("serverData", JSON.stringify(serverData));
//}

function buttonModifyClick(button) {
    switch (button.textContent) {
        case "Save":
            // Change the listings and availabilities to reflect the data of this booking
            // Requires modifying the user's bookings too
            if (resource.value == "" || time.value == "" || date.value == "") {
                alert("Please fill in all fields.");
                return;
            }


            //let res = { "user": user, "resource": resource.value, "time": time.value, "date": date.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1") }
            let selected = resource.selectedOptions[0];
            let res = { "user": user_reference, "resource": selected.data.reference, "start": time.value, "end": date.value, "reference": toModify.data.reference }
            // The reference is a requests reference, not a booking reference?
            //console.log(res);
            //alert("DID NOT UPDATE BOOK/REQUEST (TESTING)")
            if (toModify.data.pending) {
                // Update req
                updateRequest(res,loadData)
            } else {
                // Booking
                // Delete booking
                let fd = new URLSearchParams(res);
                GET_SYNC("http://localhost:3000/deleteBooking?" + fd.toString());
                res.reference = toModify.data.availability.reference;
                fileRequest(res,loadData)
                // fileRequest
            }


            //updateRequest(res, loadData)


            //let serverData = JSON.parse(localStorage.getItem("serverData"));
            //let index = indexOfBook(serverData[user]["bookings"], toModify.data);
            //console.log(index);
            //serverData[user]["bookings"][index] = res;
            //console.log(serverData);
            //localStorage.setItem("serverData", JSON.stringify(serverData));



            //let serverData = JSON.parse(localStorage.getItem("serverData"));

            //if (toModify.classList.contains("pending")) {
            //    // If its pending: Remove it from requests and pending, file a request
            //    //let serverReq = JSON.parse(localStorage.getItem("requests"));
            //    //remove(serverReq, res)
            //    //removeReq(serverReq, toModify.data);
            //    removeReq(requests, toModify.data);
            //    remove(serverData[user]["pending"], toModify.data);
            //    //localStorage.setItem("requests", JSON.stringify(serverReq));
            //    save("requests")
            //} else {
            //    // If its approved: Remove it from bookings, file a request
            //    remove(serverData[user]["bookings"], toModify.data);
            //}



            //localStorage.setItem("serverData", JSON.stringify(serverData));
            //save("serverData");
            //fileRequest(res);



            displayBookings();




            break;
        case "Back":
            //clear();
            //showSidebar(false);
            break;
    }
    clear()
    showSidebar(false);
    toModify = null;
}

function clear() {
    resource.value = "";
    time.value = "";
    date.value = "";
}

function clearRequests() {
    rResource.value = "";
    rTime.value = "";
    rDate.value = "";
}

function buttonClick(button) {
    toModify = button.closest(".booking");
    if (toModify == null) return;
    let data = toModify.data;

    switch (button.textContent) {
        case "Modify":
            //alert(button.textContent + ", " + data.resource + " " + data.time + " " + data.date);
            showSidebar();
            //console.log(data);
            //resource.value = getResource(data).displayName;
            resource.value = data.displayName
            time.value = formattedDate(data.start)
            date.value = formattedDate(data.end);
            //date.value = data.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");


            //Modifying allows to modify the contents
            // -Resource
            // -Time
            // -Date
            //Validity is displayed to the user with color
            //When valid, the user can click the save button (new value of the Modify button), or
            //the Back button to discard changes (revert function of some sorts).

            break;
        case "Cancel":




            ////let serverData = JSON.parse(localStorage.getItem("serverData"));
            ////console.log(button.closest(".booking"))
            if (!button.closest(".booking").classList.contains("pending")) {
                //remove(serverData[user]["bookings"], data);
                GET_SYNC(`http://localhost:3000/deleteBooking?reference=${toModify.data.reference}`)
                loadData();
            } else {
                //remove(serverData[user]["pending"], data);
                GET_SYNC(`http://localhost:3000/deleteRequest?reference=${toModify.reference}`)
                loadData();
            }

            //    //let requests = JSON.parse(localStorage.getItem("requests"));
            //    remove(requests, data);
            //    //localStorage.setItem("requests", JSON.stringify(requests));
            //    save("requests")
            //}
            ////localStorage.setItem("serverData", JSON.stringify(serverData));
            //save("serverData");

            if (toModify != null) {
                clear();
                showSidebar(false);
            }

            break;
    }
    displayBookings();
}