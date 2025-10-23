

function initReports() {
  // Example Sample booking data
  const bookings = [
    { resource: "Lab A", time: "10:00" },
    { resource: "Lab A", time: "11:00" },
    { resource: "Room 101", time: "14:00" },
    { resource: "Gym", time: "10:00" },
    { resource: "Lab A", time: "15:00" },
    { resource: "Lab A", time: "15:00" },
    { resource: "Lab A", time: "14:00" },
  ];

  
  const resourceCounts = {};
  const timeCounts = {};

  bookings.forEach(countBooking);

  //(because we arent able to .sort objects)
  function sortByCount(obj) {
    return Object.entries(obj).sort(compareCounts);
  }
  
  // function for sorting comparison 
  function compareCounts(entryA, entryB) {
    return entryB[1] - entryA[1];
  }

  
  function countBooking(b) {
    resourceCounts[b.resource] = (resourceCounts[b.resource] || 0) + 1;
    timeCounts[b.time] = (timeCounts[b.time] || 0) + 1;
  }

  
  // Display popular resources 
  const popularList = document.getElementById("popular-resources");
  sortByCount(resourceCounts).forEach(addResourceItem);

  // Display peak booking times 
  const timeList = document.getElementById("peak-times");
  sortByCount(timeCounts).forEach(addTimeItem);

  // function to create list item for a resource
  function addResourceItem([name, count]) {
    const li = document.createElement("li");
    li.textContent = `${name}: ${count} bookings`;
    popularList.appendChild(li);
  }

  // function to create list item for a time
  function addTimeItem([time, count]) {
    const li = document.createElement("li");
    li.textContent = `${time}: ${count} bookings`;
    timeList.appendChild(li);
  }
}


document.addEventListener("DOMContentLoaded", initReports);
