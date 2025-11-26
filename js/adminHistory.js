document.addEventListener('DOMContentLoaded', function() {
    displayHistory();
});

function displayHistory() {
    let contents = document.querySelector(".contents");
    
    // Add safety check
    if (!contents) {
        console.error("Error: .contents element not found");
        return;
    }
    
    contents.innerHTML = ""; // Clear existing content
    
    // Add title
    let title = document.createElement("h2");
    title.textContent = "System Activity History";
    contents.appendChild(title);
    
    // Add filter options
    let filterDiv = document.createElement("div");
    filterDiv.className = "filter-section";
    filterDiv.innerHTML = `
        <label>Filter by action: 
            <select id="actionFilter">
                <option value="">All Actions</option>
                <option value="BOOKING">Bookings</option>
                <option value="AVAILABILITY">Availabilities</option>
            </select>
        </label>
        <label>Filter by resource: 
            <select id="resourceFilter">
                <option value="">All Resources</option>
            </select>
        </label>
    `;//<option value="REQUEST">Pending Requests</option>
    contents.appendChild(filterDiv);
    
    // Create table
    let table = document.createElement("table");
    table.className = "history-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Resource</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody id="historyTableBody">
            <tr><td colspan="6">Loading...</td></tr>
        </tbody>
    `;
    contents.appendChild(table);
    
    // Fetch and display history
    loadHistory();
    
    // Add event listeners for filters
    document.getElementById("actionFilter").addEventListener("change", loadHistory);
    document.getElementById("resourceFilter").addEventListener("change", loadHistory);
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