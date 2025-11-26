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



    listingsElem = document.querySelector(".listings");
    creation = document.querySelector(".creation");
    resource = document.querySelector("select[name='resource']");
    time = document.querySelector(".creation input[name='start']");
    date = document.querySelector(".creation input[name='end']");
    rResource = document.querySelector("select[name='requestResource']");
    rTime = document.querySelector("input[name='start']");
    rDate = document.querySelector("input[name='end']");

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

    listingsElem.textContent = "";


    for (let book of bookings) displayBooking(book)

    for (let pending of requests) displayPending(pending)

}

function displayBooking(book) {
    listingsElem.appendChild(document.createElement("div")).classList.add("booking");
    let booking = listingsElem.lastChild;
    booking.data = book;


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

    booking.reference = pending.reference
    booking.data = pending;

    booking.appendChild(document.createElement("div")).textContent = pending.displayName;
    booking.appendChild(document.createElement("div")).textContent = formatDateFromServer(pending.start);
    booking.appendChild(document.createElement("div")).textContent = formatDateFromServer(pending.end);
    booking.appendChild(document.createElement("div")).textContent = "Approval pending";
    booking.appendChild(document.createElement("button")).textContent = "Modify";
    let right = booking.appendChild(document.createElement("button"))
    right.textContent = "Cancel";
    right.classList.add("right");
}




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

            fileRequest(res, loadData);
            break;
    }
    clearRequests();
    displayBookings();
}


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



            displayBookings();




            break;
        case "Back":
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
            showSidebar();

            resource.value = data.displayName
            time.value = formattedDate(data.start)
            date.value = formattedDate(data.end);


            break;
        case "Cancel":

            if (!button.closest(".booking").classList.contains("pending")) {
                GET_SYNC(`http://localhost:3000/deleteBooking?reference=${toModify.data.reference}`)
                loadData();
            } else {
                GET_SYNC(`http://localhost:3000/deleteRequest?reference=${toModify.reference}`)
                loadData();
            }

            if (toModify != null) {
                clear();
                showSidebar(false);
            }

            break;
    }
    displayBookings();
}