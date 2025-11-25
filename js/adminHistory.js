document.addEventListener('DOMContentLoaded', function() {

function displayHistory() {
    let contents = document.querySelector(".contents");
    for (let log of history) {
        if (!log.userOnly) contents.appendChild(document.createElement("p")).textContent = log.log;
    }
}

function loadHistory() {
    let tbody = document.getElementById("historyTableBody");
    
    // Fetch all necessary data in parallel
    Promise.all([
        fetch("http://localhost:3000/bookings-history", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Bookings fetch failed: ${r.status}`);
            return r.json();
        }),
        fetch("http://localhost:3000/availabilities", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Availabilities fetch failed: ${r.status}`);
            return r.json();
        }),
        fetch("http://localhost:3000/requests", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Requests fetch failed: ${r.status}`);
            return r.json();
        }),
        fetch("http://localhost:3000/resources", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Resources fetch failed: ${r.status}`);
            return r.json();
        })
    ]).then(([bookings, availabilities, requests, resources]) => {
        let history = combineHistory(bookings, availabilities, requests, resources);
        displayHistoryTable(history);
        populateResourceFilter(history);
    }).catch(err => {
        console.error("Error loading history:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6">Error loading history: ${err.message}. Please ensure you are logged in as admin.</td></tr>`;
        }
    });
}

function combineHistory(bookings, availabilities, requests, resources) {
    let history = [];
    
    // Create resource lookup
    let resourceMap = {};
    resources.forEach(r => {
        resourceMap[r.reference] = r.name;
    });
    
    // Create availability lookup
    let availabilityMap = {};
    availabilities.forEach(a => {
        availabilityMap[a.reference] = a;
        // Add availabilities to history
        history.push({
            timestamp: a.start, // Use start time as creation time (approximation)
            type: 'AVAILABILITY',
            action: 'Availability Created',
            user: 'Admin',
            netname: 'admin',
            details: `${resourceMap[a.resource]} available from ${formatDateTime(a.start)} to ${formatDateTime(a.end)}`,
            resource_name: resourceMap[a.resource],
            resource_id: a.resource,
            status: 'Active',
            reference: a.reference
        });
    });
    
    // Add bookings to history
    bookings.forEach(b => {
        let availability = availabilityMap[b.availability];
        let now = new Date();
        let bookingEnd = new Date(b.end);
        
        history.push({
            timestamp: b.start, // Booking start time
            type: 'BOOKING',
            action: 'Booking Created',
            user: `${b.user_name || ''} ${b.last_name || ''}`.trim() || 'User',
            netname: b.netname || 'unknown',
            details: `Booked ${resourceMap[availability?.resource]} from ${formatDateTime(b.start)} to ${formatDateTime(b.end)}`,
            resource_name: resourceMap[availability?.resource],
            resource_id: availability?.resource,
            status: bookingEnd < now ? 'Completed' : 'Active',
            reference: b.reference
        });
    });
    
    // Add pending requests to history
    requests.forEach(r => {
        let resourceName = r.name || resourceMap[r.resource];
        history.push({
            timestamp: r.start, // Request start time
            type: 'REQUEST',
            action: 'Request Submitted',
            user: r.netname || 'User',
            netname: r.netname || 'unknown',
            details: `Requested ${resourceName} from ${formatDateTime(r.start)} to ${formatDateTime(r.end)}`,
            resource_name: resourceName,
            resource_id: r.resource,
            status: 'Pending',
            reference: r.reference
        });
    });
    
    // Sort by timestamp (most recent first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return history;
}

function displayHistoryTable(history) {
    let tbody = document.getElementById("historyTableBody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    let actionFilter = document.getElementById("actionFilter")?.value || "";
    let resourceFilter = document.getElementById("resourceFilter")?.value || "";
    
    // Filter history
    let filteredHistory = history.filter(item => {
        let matchesAction = !actionFilter || item.type === actionFilter;
        let matchesResource = !resourceFilter || item.resource_name === resourceFilter;
        return matchesAction && matchesResource;
    });
    
    if (filteredHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No history entries found</td></tr>';
        return;
    }
    
    filteredHistory.forEach(item => {
        let row = document.createElement("tr");
        
        // Format timestamp
        let formattedDate = formatDateTime(item.timestamp);
        
        // Format action type
        let actionClass = item.type.toLowerCase();
        
        // Status badge
        let statusClass = item.status.toLowerCase().replace(' ', '-');
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${item.user} (${item.netname})</td>
            <td><span class="action-badge ${actionClass}">${item.action}</span></td>
            <td>${item.details || 'N/A'}</td>
            <td>${item.resource_name || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${item.status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

function populateResourceFilter(history) {
    let resourceFilter = document.getElementById("resourceFilter");
    if (!resourceFilter) return;
    
    let currentValue = resourceFilter.value;
    
    // Get unique resources
    let resources = [...new Set(history.map(item => item.resource_name).filter(Boolean))];
    
    // Clear existing options except "All Resources"
    resourceFilter.innerHTML = '<option value="">All Resources</option>';
    
    // Add resource options
    resources.sort().forEach(resource => {
        let option = document.createElement("option");
        option.value = resource;
        option.textContent = resource;
        resourceFilter.appendChild(option);
    });
    
    // Restore previous selection
    resourceFilter.value = currentValue;
}

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    let date = new Date(dateTime);
    return date.toLocaleString();
}