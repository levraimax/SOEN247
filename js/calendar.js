const dayStrings = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthStrings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const calendar = document.querySelector('.calendar');
const tab = calendar.querySelector('.tab');

let days = [];
let bookings = [];
const today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let day = today.getDate();

//function calcMaxHeight() {
//    calendar.style.maxHeight = calendar.clientHeight+"px"
//}

function createDays() {
    if (days.length == 0) {
        let weekDay = new Date(year, month, 1).getDay();
        for (let i = 0; i < 31; i++) {
            calendar.appendChild(document.createElement('div')).classList.add('day')
            calendar.lastChild.textContent = `${dayStrings[(weekDay + i) % 7]} ${i + 1}`;
            calendar.lastChild.day = `${i + 1}`;
            days.push(calendar.lastChild);
        };
    }
}


function displayDays() {
    // Create 31 day elements
    if (days.length == 0) {
        createDays();
    } else {
        document.querySelectorAll(".day.hidden").forEach(day => day.classList.remove("hidden"));
    }
    //tab.textContent = monthStrings[month];
    document.querySelector(".tab span").textContent = `${monthStrings[month]} ${year}`;
    let last = lastDay(year, month);
    days.forEach((day, index) => {
        if (index + 1 > last) day.classList.add("hidden");
    });

}

function createBooks() {
    if (bookings.length == 0) {
        for (let i = 0; i <= 14; i++) {
            calendar.appendChild(document.createElement('div')).classList.add("booking");
            calendar.lastChild.textContent = `Booking ${i + 8}:00`;
            calendar.lastChild.time = `${i + 8}:00`;
            //displayRooms(calendar.lastChild);
            bookings.push(calendar.lastChild);
        }
    }
}

function displayBooks() {
    if (bookings.length == 0) {
        createBooks();
    } else {
        bookings.forEach(booking => booking.classList.remove("hidden"));
    }
    bookings.forEach(book => displayRooms(book));
    document.getElementById("backButton").classList.remove("hidden");
}

function navigateDate(direction) {
    month += direction;
    if (month > 11) year += 1;
    if (month < 0) {
        year -= 1;
        month += 12;
    }
    month = month % 12;

    document.querySelector(".tab span").textContent = `${monthStrings[month]} ${year}`;
    updateDates();
    displayDays();
}

function updateDates() {
    let date = new Date(year, month, 1);
    let weekDay = date.getDay();
    let last = lastDay(year, month);
    if (last == 28) {
        days.forEach(day => day.style.height = "calc(97%/4)");
    } else {
        days.forEach(day => day.style.height = "calc(97%/5)");
    }
    document.querySelectorAll(".day.hidden").forEach(day => day.classList.remove("hidden"));
    days.forEach((day, index) => {
        day.textContent = `${dayStrings[(weekDay + index) % 7]} ${index + 1}`;
        day.day = `${index + 1}`;
    });
}

function lastDay(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getRoomAvailability(time, date) {
    // Get the rooms based on the time and date
    //let availabilities = JSON.parse(localStorage.getItem("availabilities"));
    if (availabilities[date] == null || availabilities[date][time] == null) return [];
    return availabilities[date][time].map(entry => entry.resource);
}

function displayRooms(book) {
    //console.log(book.time,date)
    book.innerHTML = `Booking ${book.time}<br>`;
    getRoomAvailability(book.time, date).forEach(room => book.innerHTML += `<br><span>${room}</span>`);
}




function toggleDayBook(event) {
    if (event.target.classList.contains("day")) {
        //document.querySelectorAll(".day").forEach(day => day.classList.add("hidden"));
        day = event.target.day;
        date = `${day}/${month + 1}/${year}`;
        document.querySelectorAll(".tab button").forEach(button => button.classList.add("hidden"));
        days.forEach(day => day.classList.add("hidden"));
        document.querySelector(".tab span").textContent = event.target.textContent;
        displayBooks();
        


        //for (let i = 0; i < 14; i++) {
        //    let booking = document.createElement('div');
        //    booking.classList.add('booking');
        //    booking.textContent = `Booking ${i + 8}:00`;
        //    calendar.appendChild(booking);
        //}
    } else if (event.target.id == "backButton") {
        // Change to display rooms
        //displayRooms(event.target);

        document.querySelectorAll(".tab button").forEach(button => button.classList.remove("hidden"));
        document.getElementById("backButton").classList.add("hidden");
        document.querySelectorAll(".booking").forEach(booking => booking.classList.add("hidden"));
        displayDays();


    } else if (event.target.tagName == "SPAN" && event.target.parentElement.classList.contains("booking")) {
        let book = event.target.closest(".booking");
        alert(`${day}/${month}/${year}` + " " + book.time + " " + event.target.textContent);
        //alert(event.target.textContent);
        //addBooking(`${day}/${month + 1}/${year}`, book.time, event.target.textContent);
        fileRequest({ "resource": event.target.textContent, "time": book.time, "date": `${day}/${month + 1}/${year}` });
        displayBooks();
    }
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

//function fileRequest(data) {
//    let listings = JSON.parse(localStorage.getItem("listings"));
//    let index = indexOfBook(listings, data);
//    let serverData = JSON.parse(localStorage.getItem("serverData"));
//    let user = localStorage.getItem("user");

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
