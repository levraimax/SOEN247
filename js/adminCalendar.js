const dayStrings = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthStrings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const calendar = document.querySelector('.calendar');
const tab = calendar.querySelector('.tab');

let days = [];
let timeSlots = [];
const today = new Date();
let month = today.getMonth();
let year = today.getFullYear();
let day = today.getDate();
let date = `${day}/${month + 1}/${year}`;

// For drag selection
let isSelecting = false;
let selectedSlots = [];

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
    if (days.length == 0) {
        createDays();
    } else {
        document.querySelectorAll(".day.hidden").forEach(day => day.classList.remove("hidden"));
    }
    document.querySelector(".tab span").textContent = `${monthStrings[month]} ${year}`;
    let last = lastDay(year, month);
    days.forEach((day, index) => {
        if (index + 1 > last) day.classList.add("hidden");
    });
}

function createTimeSlots() {
    if (timeSlots.length == 0) {
        // Create time slots from 8:00 to 22:00 in 20-minute intervals
        for (let hour = 8; hour <= 22; hour++) {   
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const endHour = hour + 1;
            const endTimeString = `${endHour.toString().padStart(2, '0')}:00`;
            
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('time-slot');
            slotDiv.textContent = `${timeString} - ${endTimeString}`;
            slotDiv.dataset.time = timeString;
            slotDiv.dataset.endTime = endTimeString;
            
            calendar.appendChild(slotDiv);
            timeSlots.push(slotDiv);
            }
        }
    }


function displayTimeSlots() {
    if (timeSlots.length == 0) {
        createTimeSlots();
    } else {
        timeSlots.forEach(slot => slot.classList.remove("hidden"));
    }
    
    selectedSlots = [];
    timeSlots.forEach(slot => slot.classList.remove('selected'));
    
    document.getElementById("backButton").classList.remove("hidden");
    
    let confirmBtn = document.getElementById("confirmBooking");
    if (!confirmBtn) {
        confirmBtn = document.createElement('button');
        confirmBtn.id = "confirmBooking";
        confirmBtn.textContent = "Create Booking Slot";
        confirmBtn.classList.add("hidden");
        document.querySelector(".tab").appendChild(confirmBtn);
        
        confirmBtn.addEventListener('click', createBooking);
    }
}

function createBooking() {
    if (selectedSlots.length === 0) {
        alert("Please select at least one time slot");
        return;
    }
    
    const sortedSlots = selectedSlots.sort((a, b) => {
        const timeA = a.dataset.time;
        const timeB = b.dataset.time;
        return timeA.localeCompare(timeB);
    });
    
    const startTime = sortedSlots[0].dataset.time;
    const endTime = sortedSlots[sortedSlots.length - 1].dataset.endTime;
    
    const resourceInput = prompt("Ressource to create this booking: ")

    // if(!resourceInput || !resourceIOnput.trim()){
    //     alert("Booking slots not filled: no resource selected.")
    //     return;
    // }

    const bookingInfo = {
        date: date,
        startTime: startTime,
        endTime: endTime,
        slots: selectedSlots.length,
        resource: resourceInput.trim()
    };
    
    alert(`Booking created:\nDate: ${date}\nTime: ${startTime} - ${endTime}\nDuration: ${selectedSlots.length * 20} minutes\nResource: ${resourceInput.trim()}`);

    selectedSlots = [];
    timeSlots.forEach(slot => slot.classList.remove('selected'));
    document.getElementById("confirmBooking").classList.add("hidden");
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
    let dateObj = new Date(year, month, 1);
    let weekDay = dateObj.getDay();
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

function toggleDayBook(event) {
    if (event.target.classList.contains("day")) {
        day = event.target.day;
        date = `${day}/${month + 1}/${year}`;
        document.querySelectorAll(".tab button").forEach(button => button.classList.add("hidden"));
        days.forEach(day => day.classList.add("hidden"));
        document.querySelector(".tab span").textContent = event.target.textContent;
        displayTimeSlots();
        
    } else if (event.target.id == "backButton") {
        document.querySelectorAll(".tab button").forEach(button => button.classList.remove("hidden"));
        document.getElementById("backButton").classList.add("hidden");
        timeSlots.forEach(slot => slot.classList.add("hidden"));
        const confirmBtn = document.getElementById("confirmBooking");
        if (confirmBtn) confirmBtn.classList.add("hidden");
        displayDays();
    }
}

calendar.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('time-slot')) {
        isSelecting = true;
        toggleSlotSelection(e.target);
        e.preventDefault(); 
    }
});

calendar.addEventListener('mouseover', (e) => {
    if (isSelecting && e.target.classList.contains('time-slot')) {
        toggleSlotSelection(e.target);
    }
});

document.addEventListener('mouseup', () => {
    isSelecting = false;
});

function toggleSlotSelection(slot) {
    const index = selectedSlots.indexOf(slot);
    if (index > -1) {
        selectedSlots.splice(index, 1);
        slot.classList.remove('selected');
    } else {
        selectedSlots.push(slot);
        slot.classList.add('selected');
    }
    
    const confirmBtn = document.getElementById("confirmBooking");
    if (confirmBtn) {
        if (selectedSlots.length > 0) {
            confirmBtn.classList.remove("hidden");
        } else {
            confirmBtn.classList.add("hidden");
        }
    }
}