const dayStrings = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthStrings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const calendar = document.querySelector('.calendar');
const tab = calendar.querySelector('.tab');

let dateStr;

let days = [];
let bookings = [];
const today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let day = today.getDate();
let availabilities;
let resources;

let availMap = {};
//function calcMaxHeight() {
//    calendar.style.maxHeight = calendar.clientHeight+"px"
//}

function loadCalendarData() {
    resources = GET_SYNC("http://localhost:3000/resources")
    availabilities = GET_SYNC("http://localhost:3000/availabilities")
    availabilities.forEach(av => {
        av.resource = getResource(av)
        av.start = new Date(formattedDate(av.start))
        av.end = new Date(formattedDate(av.end))
    })

    console.log(availabilities)
}


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
            const hour = String(i + 8).padStart(2, '0');
            calendar.lastChild.textContent = `Booking ${hour}:00`;
            calendar.lastChild.time = `${hour}:00`;
            calendar.lastChild.hour = i+8;
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

function getRoomAvailability(time) {
    // Get the rooms based on the time and date
    //let availabilities = JSON.parse(localStorage.getItem("availabilities"));
    //if (availabilities[date] == null || availabilities[date][time] == null) return [];
    //return availabilities[date][time].map(entry => entry.resource);
    //console.log(year,month,day,time)
    let dTime = new Date(year, month, day, time)
    let dNext = new Date(year, month, day, time + 1)
    //console.log(dTime)
    //console.log(dNext)

    let res = availabilities.filter(av => (av.start < dNext && av.start >= dTime) || (av.start <= dTime && av.end > dTime));
    res = res.map(av => {
        return { ...av, start: maxTime(dTime, av.start), end: minTime(dNext, av.end) }
    })

    //if (res) console.log(res);

    return res;
    // All availabilities starting at time < x+1 and >=x


}

function shortTime(date) {
    let res = date.toLocaleTimeString("en-GB", { hour12: false })
    return res.replace(/(:00\s)|(:00$)/,"")
}

function minTime(a, b) {
    //console.log("Min",a,b)
    let res=a;
    if (a > b) res= b;
    //console.log(res);
    return res;
}

function maxTime(a, b) {
    //console.log("Max",a,b)
    let res = a
    if (a < b) res =b;
    //console.log(res)
    return res;
}

function displayRooms(book) {
    //console.log(book.time,date);
    //book.innerHTML = `Booking ${book.time}<br>`;
    book.innerHTML = `Booking ${book.time}<br>`;
    const rooms = getRoomAvailability(book.hour);
    if (rooms.length === 0) {
        book.innerHTML += `<br><span style="color:gray">No slots</span>`;
    } else {
        rooms.forEach(room => {
            //book.innerHTML += `<br><span>${room.resource.name} (available)</span>`;
            //book.innerHTML += "<br/>";
            book.appendChild(document.createElement("br"))
            book.appendChild(document.createElement("span")).textContent = `${room.resource.name} (available)`
            book.lastChild.classList.add("tooltip")
            book.lastChild.data = room;
            //<span class="tooltip-box"></span>
            let box = book.lastChild.appendChild(document.createElement("span"))
            box.textContent = `${shortTime(room.start)} >>> ${shortTime(room.end) }`
            box.classList.add("tooltip-box")
        })
        //rooms.forEach(room => {
        //    if (room.booked) {
        //        book.innerHTML += `<br><span style="color:darkred">${room} (booked)</span>`;
        //    } else {
        //        book.innerHTML += `<br><span style="color:green">${room.resource.name} (available)</span>`;
        //    }
        //});
    }
}


//document.addEventListener("DOMContentLoaded", async () => {
//    await loadCalendarData();
//    displayDays();
//    calendar.addEventListener("click", toggleDayBook);
//});

function toggleDayBook(event) {
    if (event.target.classList.contains("day")) {
        //document.querySelectorAll(".day").forEach(day => day.classList.add("hidden"));
        day = event.target.day;
        dateStr = `${day}/${month + 1}/${year}`;
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
        console.log(event.target.data);
        alert(`${day}/${month}/${year}` + " " + book.time + " " + event.target.textContent);
        //alert(event.target.textContent);
        //addBooking(`${day}/${month + 1}/${year}`, book.time, event.target.textContent);

        let reqData = {...event.target.data,start:formattedDate(event.target.data.start),end:formattedDate(event.target.data.end),resource:event.target.data.resource.reference,user:user_reference}

        fileRequest(reqData);
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
