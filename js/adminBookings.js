let listings;
let resource;
let time;
let date;
let auth;
let loaded = false;
let toModify;
function displayBookings() {
    if (!loaded) {
        loaded = true;
        listings = document.querySelector(".listings");
        resource = document.querySelector("input[name='resource']");
        time = document.querySelector("input[name='time']");
        date = document.querySelector("input[name='date']");
        auth = document.querySelector("input[name='auth']");
    }

    listings.textContent = "";
    let data = localStorage.getItem("listings");
    if (data != null) {
        data = JSON.parse(data);
    } else {
        localStorage.setItem("listings", "[]");
    }

    for (let book of data) {
        displayBooking(book);
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


function createBooking() {
    let dateValue = date.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1");
    let authValue = auth.checked;

    let serverListings = JSON.parse(localStorage.getItem("listings"));
    let data = { "resource": resource.value, "time": time.value, "date": dateValue, auth: authValue };
    serverListings.push(data)
    localStorage.setItem("listings", JSON.stringify(serverListings));

    let availabilities = JSON.parse(localStorage.getItem("availabilities"));
    if (availabilities[dateValue] == undefined) availabilities[dateValue] = {};
    if (availabilities[dateValue][time.value] == undefined) availabilities[dateValue][time.value] = [];
    availabilities[dateValue][time.value].push(data);
    localStorage.setItem("availabilities", JSON.stringify(availabilities));

    clear();
    displayBookings();
    return false;
}

function indexOfBook(arr, book) {
    for (let i in arr) {
        let b = arr[i];
        if (b.resource === book.resource &&
            b.time === book.time &&
            b.date === book.date &&
            b.auth == book.auth) {
            return arr.indexOf(b);
        }
    }
    return -1;
}

function remove(arr, target) {
    let x = indexOfBook(arr, target);
    if (x != -1) arr.splice(x, 1);
}

function buttonModifyClick(button) {
    switch (button.textContent) {
        case "Save":
            // Change the listings and availabilities to reflect the data of this booking
            // Requires modifying the user's bookings too

            let res = { "resource": resource.value, "time": time.value, "date": date.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1"), "auth": auth.checked }

            // Listing
            let listings = JSON.parse(localStorage.getItem("listings"));
            listings[indexOfBook(listings, toModify.data)] = res;
            // Availabilities
            let availabilities = JSON.parse(localStorage.getItem("availabilities"));

            if (toModify.data.date == res.date && toModify.data.time == res.time) {
                availabilities[res.date][res.time][indexOfBook(availabilities[res.date][res.time], toModify.data)] = res;
            } else {
                remove(availabilities[toModify.data.date][toModify.data.time], toModify.data);
                if (availabilities[res.date] == undefined) availabilities[res.date] = {};
                if (availabilities[res.date][res.time] == undefined) availabilities[res.date][res.time] = [];
                availabilities[res.date][res.time].push(res);
            }

            toModify.data = res;

            localStorage.setItem("listings", JSON.stringify(listings));
            localStorage.setItem("availabilities", JSON.stringify(availabilities));

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
    time.value = "";
    date.value = "";
    auth.checked = false;
}

function buttonClick(button) {
    toModify = button.closest(".booking");
    let data = toModify.data;

    switch (button.textContent) {
        case "Modify":
            //alert(button.textContent + ", " + data.resource + " " + data.time + " " + data.date);
            resource.value = data.resource;
            time.value = data.time;
            date.value = data.date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
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
            let serverListings = JSON.parse(localStorage.getItem("listings"));
            remove(serverListings, data)
            localStorage.setItem("listings", JSON.stringify(serverListings));

            let availabilities = JSON.parse(localStorage.getItem("availabilities"));
            remove(availabilities[data.date][data.time], data);
            localStorage.setItem("availabilities", JSON.stringify(availabilities));

            if (toModify != null) {
                document.getElementById("submit").classList.remove("hidden");
                document.querySelectorAll(".creation button").forEach(btn => btn.classList.add("hidden"));
                clear();
            }

            break;
    }
    displayBookings();
}