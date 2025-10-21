let listings;
let resource;
let time;
let date;
let auth;
let loaded = false;
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
    let authValue = auth == "on";

    let serverListings = JSON.parse(localStorage.getItem("listings"));
    let data = { "resource": resource.value, "time": time.value, "date": dateValue, auth: authValue };
    serverListings.push(data)
    localStorage.setItem("listings", JSON.stringify(serverListings));

    let availabilities = JSON.parse(localStorage.getItem("availabilities"));
    if (availabilities[dateValue] == undefined) availabilities[dateValue] = {};
    if (availabilities[dateValue][time.value] == undefined) availabilities[dateValue][time.value] = [];
    availabilities[dateValue][time.value].push(data);
    localStorage.setItem("availabilities", JSON.stringify(availabilities));

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

function buttonClick(button) {
    let data = button.closest(".booking").data;

    switch (button.textContent) {
        case "Modify":
            alert(button.textContent + ", " + data.resource + " " + data.time + " " + data.date);

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

            break;
    }
    displayBookings();
}