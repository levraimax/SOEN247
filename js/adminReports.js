

async function initReports() {
  // used this data when server down, will remove later
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

  function sortByCount(obj) {
    return Object.entries(obj).sort(compareCounts);
  }

  function compareCounts(entryA, entryB) {
    return entryB[1] - entryA[1];
  }

  function countBooking(b) {
    resourceCounts[b.resource] = (resourceCounts[b.resource] || 0) + 1;
    timeCounts[b.time] = (timeCounts[b.time] || 0) + 1;
  }

  try {
    const resp = await fetch('http://localhost:3000/reports/resourceCounts');
    if (resp.ok) {
      const rows = await resp.json();
      for (let k in resourceCounts) delete resourceCounts[k];
      rows.forEach(r => {
        resourceCounts[r.name] = Number(r.bookings) || 0;
      });
    }
  } catch (e) {
    console.warn('Failed to fetch resource counts from server, using sample data', e);
  }

  try {
    const tr = await fetch('http://localhost:3000/reports/timeCounts');
    if (tr.ok) {
      const trows = await tr.json();
      for (let k in timeCounts) delete timeCounts[k];
      trows.forEach(t => {
        timeCounts[t.hour_label] = Number(t.bookings) || 0;
      });
    }
  } catch (e) {
    console.warn('Failed to fetch time counts from server, using sample times', e);
  }


  const resourcesSorted = sortByCount(resourceCounts);
  resourcesSorted.forEach(addResourceItem);

  const topEl = document.getElementById('top-resource-name');
  const bottomEl = document.getElementById('bottom-resource-name');
  if (resourcesSorted.length > 0) {
    const [topName, topCount] = resourcesSorted[0];
    const [bottomName, bottomCount] = resourcesSorted[resourcesSorted.length - 1];
    if (topEl) topEl.textContent = `${topName} (${topCount} bookings)`;
    if (bottomEl) bottomEl.textContent = `${bottomName} (${bottomCount} bookings)`;
  } else {
    if (topEl) topEl.textContent = '(no data)';
    if (bottomEl) bottomEl.textContent = '(no data)';
  }

  // Create a pie chart for resource usage if Chart.js is available
  try {
    const chartCanvas = document.getElementById('resourcePieChart');
    if (chartCanvas && typeof Chart !== 'undefined') {
      const labels = resourcesSorted.map(e => e[0]);
      const data = resourcesSorted.map(e => e[1]);

      const backgroundColors = [
        '#4dc9f6','#f67019','#f53794','#537bc4','#acc236','#166a8f','#00a950','#58595b','#8549ba'
      ];

      if (chartCanvas._chartInstance) chartCanvas._chartInstance.destroy();
      chartCanvas._chartInstance = new Chart(chartCanvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            hoverOffset: 6
          }]
        },
        options: {
          plugins: {
            legend: {
              position: 'right'
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  } catch (e) {
    console.warn('Chart creation failed', e);
  }

  // Create a pie chart for booking times (if Chart.js is available)
  try {
    const timeCanvas = document.getElementById('timePieChart');
    if (timeCanvas && typeof Chart !== 'undefined') {
      const timesSorted = Object.entries(timeCounts).sort((a,b) => b[1]-a[1]);
      const labelsT = timesSorted.map(e => e[0]);
      const dataT = timesSorted.map(e => e[1]);

      const bg = [
        '#fde23e','#f16e23','#f5428d','#4dc9f6','#7bd148','#a8b3ac','#c9c9c9','#ff8c00','#8e44ad'
      ];

      if (timeCanvas._chartInstance) timeCanvas._chartInstance.destroy();
      timeCanvas._chartInstance = new Chart(timeCanvas, {
        type: 'pie',
        data: {
          labels: labelsT,
          datasets: [{ data: dataT, backgroundColor: bg, hoverOffset: 6 }]
        },
        options: {
          plugins: { legend: { position: 'right' } },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  } catch (e) {
    console.warn('Time chart creation failed', e);
  }

  // Display peak booking times 
  const timeList = document.getElementById("peak-times");
  timeList.innerHTML = '';
  sortByCount(timeCounts).forEach(addTimeItem);

  // function to create list item for a resource
  function addResourceItem([name, count]) {
    const li = document.createElement("li");
    li.textContent = `${name}: ${count} bookings`;
  }

  // function to create list item for a time
  function addTimeItem([time, count]) {
    const li = document.createElement("li");
    li.textContent = `${time}: ${count} bookings`;
    timeList.appendChild(li);
  }
}


document.addEventListener("DOMContentLoaded", initReports);
