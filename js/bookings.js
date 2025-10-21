let contents;
function displayBookings() {
    contents = document.querySelector(".contents");
    contents.textContent = "";
    const user = localStorage.getItem("user");
    const data = JSON.parse(localStorage.getItem("serverData"));

    for (let book of data[user]["bookings"]) {
        displayBooking(book);
    }
}

function displayBooking(book) {
    contents.appendChild(document.createElement("div")).classList.add("booking");
    let booking = contents.lastChild;
    booking.data = book;
    booking.appendChild(document.createElement("div")).textContent = book.resource;
    booking.appendChild(document.createElement("div")).textContent = book.time;
    booking.appendChild(document.createElement("div")).textContent = book.date;
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
            let user = localStorage.getItem('user');
            let serverData = JSON.parse(localStorage.getItem("serverData"));
            remove(serverData[user]["bookings"], data);
            localStorage.setItem("serverData", JSON.stringify(serverData));


            break;
    }
    displayBookings();
}