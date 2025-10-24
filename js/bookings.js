let user, listings, creation, resource, time, date, toModify, rResource, rDate, rTime;
let loaded = false;
function displayBookings() {
    if (!loaded) {
        loaded = true;
        listings = document.querySelector(".listings");
        creation = document.querySelector(".creation");
        user = localStorage.getItem("user");
        resource = document.querySelector("input[name='resource']");
        time = document.querySelector("input[name='time']");
        date = document.querySelector("input[name='date']");
        rResource = document.querySelector("input[name='requestResource']");
        rTime = document.querySelector("input[name='requestTime']");
        rDate = document.querySelector("input[name='requestDate']");
    }

    listings.textContent = "";
    let data = JSON.parse(localStorage.getItem("serverData"));

    for (let book of data[user]["bookings"]) {
        displayBooking(book);
    }

    for (let pending of data[user]["pending"]) {
        displayPending(pending);
    }

}

function displayBooking(book) {
    //listings.textContent = "";
    listings.appendChild(document.createElement("div")).classList.add("booking");
    let booking = listings.lastChild;
    booking.data = book;
    booking.appendChild(document.createElement("div")).textContent = book.resource;
    booking.appendChild(document.createElement("div")).textContent = book.time;
    booking.appendChild(document.createElement("div")).textContent = book.date;
    booking.appendChild(document.createElement("button")).textContent = "Modify";
    let right = booking.appendChild(document.createElement("button"))
    right.textContent = "Cancel";
    right.classList.add("right");
}

function displayPending(pending) {
    listings.appendChild(document.createElement("div")).classList.add("booking");
    let booking = listings.lastChild;
    booking.classList.add("pending");
    booking.data = pending;
    booking.appendChild(document.createElement("div")).textContent = pending.resource;
    booking.appendChild(document.createElement("div")).textContent = pending.time;
    booking.appendChild(document.createElement("div")).textContent = pending.date;
    booking.appendChild(document.createElement("div")).textContent = "Approval pending";
    booking.appendChild(document.createElement("button")).textContent = "Modify";
    let right = booking.appendChild(document.createElement("button"))
    right.textContent = "Cancel";
    right.classList.add("right");
}


function indexOfBook(arr, book) {
    for (let i in arr) {
        let b = arr[i];
        if (b.resource === book.resource &&
            b.time === book.time &&
            b.date === book.date) {
            return arr.indexOf(b);
        }
    }
    return -1;
}

function remove(arr, target) {
    let x = indexOfBook(arr, target);
    if (x != -1) arr.splice(x, 1);
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
            let res = { "user": user, "resource": rResource.value, "time": rTime.value, "date": rDate.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1") }

            // Check if it is in listings (and not auth)

            // Add it to the requests
            //let serverRequests = JSON.parse(localStorage.getItem("requests"));
            //serverRequests.push(res)
            //localStorage.setItem("requests", JSON.stringify(serverRequests));
            fileRequest(res);
            break;
    }
    clearRequests();
    displayBookings();
}

function fileRequest(data) {
    let listings = JSON.parse(localStorage.getItem("listings"));
    let index = indexOfBook(listings, data);
    let serverData = JSON.parse(localStorage.getItem("serverData"));

    if (index != -1 && !listings[index].auth) {
        serverData[user]["bookings"].push(listings.splice(index, 1)[0]);
        localStorage.setItem("listings", JSON.stringify(listings));
    } else {
        data["user"] = user;
        serverData[user]["pending"].push(data);

        let serverRequests = JSON.parse(localStorage.getItem("requests"));
        serverRequests.push(data)
        localStorage.setItem("requests", JSON.stringify(serverRequests));
        // Maybe add a pending booking?
    }
    localStorage.setItem("serverData", JSON.stringify(serverData));
}

function buttonModifyClick(button) {
    switch (button.textContent) {
        case "Save":
            // Change the listings and availabilities to reflect the data of this booking
            // Requires modifying the user's bookings too
            if (rResource.value == "" || rTime.value == "" || rDate.value == "") {
                alert("Please fill in all fields.");
                return;
            }
            let res = { "resource": resource.value, "time": time.value, "date": date.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1") }

            //let serverData = JSON.parse(localStorage.getItem("serverData"));
            //let index = indexOfBook(serverData[user]["bookings"], toModify.data);
            //console.log(index);
            //serverData[user]["bookings"][index] = res;
            //console.log(serverData);
            //localStorage.setItem("serverData", JSON.stringify(serverData));

            //toModify.data = res;
            fileRequest(res);



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
    let data = toModify.data;

    switch (button.textContent) {
        case "Modify":
            //alert(button.textContent + ", " + data.resource + " " + data.time + " " + data.date);
            showSidebar();
            resource.value = data.resource;
            time.value = data.time;
            date.value = data.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");


            //Modifying allows to modify the contents
            // -Resource
            // -Time
            // -Date
            //Validity is displayed to the user with color
            //When valid, the user can click the save button (new value of the Modify button), or
            //the Back button to discard changes (revert function of some sorts).

            break;
        case "Cancel":
            let serverData = JSON.parse(localStorage.getItem("serverData"));
            console.log(button.closest(".booking"))
            if (!button.closest(".booking").classList.contains("pending")) {
                remove(serverData[user]["bookings"], data);
            } else {
                remove(serverData[user]["pending"], data);

                let requests = JSON.parse(localStorage.getItem("requests"));
                remove(requests, data);
                localStorage.setItem("requests", JSON.stringify(requests));
            }
            localStorage.setItem("serverData", JSON.stringify(serverData));

            if (toModify != null) {
                clear();
                showSidebar(false);
            }

            break;
    }
    displayBookings();
}