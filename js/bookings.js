let contents;
function loaded() {
    contents = document.querySelector(".contents");
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

function buttonClick(button) {
    let data = button.closest(".booking").data;
    alert(button.textContent+", "+data.resource+" "+data.time+" "+data.date);
}