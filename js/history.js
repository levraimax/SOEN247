document.addEventListener('DOMContentLoaded', function() {
    displayUserHistory();
});

function displayUserHistory() {
    let contents = document.querySelector(".contents");
    
    // Add safety check
    if (!contents) {
        console.error("Error: .contents element not found");
        return;
    }
    
    contents.innerHTML = ""; // Clear existing content
    
    // Add title
    let title = document.createElement("h2");
    title.textContent = "My Booking History";
    contents.appendChild(title);
    
    // Add filter options
    let filterDiv = document.createElement("div");
    filterDiv.className = "filter-section";
    filterDiv.innerHTML = `
        <label>Filter by status: 
            <select id="statusFilter">
                <option value="">All</option>
                <option value="upcoming">Upcoming Bookings</option>
                <option value="past">Past Bookings</option>
                <option value="pending">Pending Requests</option>
            </select>
        </label>
        <label>Filter by resource: 
            <select id="resourceFilter">
                <option value="">All Resources</option>
            </select>
        </label>
    `;
    contents.appendChild(filterDiv);
    
    // Create table
    let table = document.createElement("table");
    table.className = "history-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Resource</th>
                <th>Start Date & Time</th>
                <th>End Date & Time</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody id="historyTableBody">
            <tr><td colspan="5">Loading...</td></tr>
        </tbody>
    `;
    contents.appendChild(table);
    
    // Fetch and display history
    loadUserHistory();
    
    // Add event listeners for filters
    document.getElementById("statusFilter").addEventListener("change", loadUserHistory);
    document.getElementById("resourceFilter").addEventListener("change", loadUserHistory);
}

function loadUserHistory() {
    let tbody = document.getElementById("historyTableBody");
    
    // Fetch user's bookings and requests
    Promise.all([
        fetch("http://localhost:3000/booksData", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Bookings fetch failed: ${r.status}`);
            return r.json();
        }),
        fetch("http://localhost:3000/requestsData", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Requests fetch failed: ${r.status}`);
            return r.json();
        }),
        fetch("http://localhost:3000/availabilities", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Availabilities fetch failed: ${r.status}`);
            return r.json();
        }),
        fetch("http://localhost:3000/resources", { 
            credentials: 'include',
            method: 'GET'
        }).then(r => {
            if (!r.ok) throw new Error(`Resources fetch failed: ${r.status}`);
            return r.json();
        })
    ]).then(([bookings, requests, availabilities, resources]) => {
        let history = combineUserHistory(bookings, requests, availabilities, resources);
        displayUserHistoryTable(history);
        populateResourceFilter(history);
    }).catch(err => {
        console.error("Error loading history:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5">Error loading history: ${err.message}. Please ensure you are logged in.</td></tr>`;
        }
    });
}

function combineUserHistory(bookings, requests, availabilities, resources) {
    let history = [];
    let now = new Date();
    
    // Create resource and availability lookup maps
    let resourceMap = {};
    resources.forEach(r => {
        resourceMap[r.reference] = r;
    });
    
    let availabilityMap = {};
    availabilities.forEach(a => {
        availabilityMap[a.reference] = a;
    });
    
    // Process bookings
    bookings.forEach(b => {
        let availability = availabilityMap[b.availability];
        let resource = resourceMap[availability?.resource];
        let bookingEnd = new Date(b.end);
        let bookingStart = new Date(b.start);
        
        let status = 'upcoming';
        if (bookingEnd < now) {
            status = 'past';
        } else if (bookingStart < now && bookingEnd > now) {
            status = 'active';
        }
        
        history.push({
            type: 'booking',
            reference: b.reference,
            resource_name: resource?.name || 'Unknown Resource',
            resource_id: resource?.reference,
            location: resource?.location || 'N/A',
            start: b.start,
            end: b.end,
            status: status,
            availability_ref: b.availability
        });
    });
    
    // Process requests (pending)
    requests.forEach(r => {
        let availability = availabilityMap[r.availability];
        let resource = null;
        
        if (availability) {
            resource = resourceMap[availability.resource];
        } else if (r.resource) {
            resource = resourceMap[r.resource];
        }
        
        history.push({
            type: 'request',
            reference: r.reference,
            resource_name: resource?.name || 'Unknown Resource',
            resource_id: resource?.reference,
            location: resource?.location || 'N/A',
            start: r.start,
            end: r.end,
            status: 'pending',
            availability_ref: r.availability
        });
    });
    
    // Sort by start date (most recent first)
    history.sort((a, b) => new Date(b.start) - new Date(a.start));
    
    return history;
}

function displayUserHistoryTable(history) {
    let tbody = document.getElementById("historyTableBody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    let statusFilter = document.getElementById("statusFilter")?.value || "";
    let resourceFilter = document.getElementById("resourceFilter")?.value || "";
    
    // Filter history
    let filteredHistory = history.filter(item => {
        let matchesStatus = !statusFilter || item.status === statusFilter;
        let matchesResource = !resourceFilter || item.resource_name === resourceFilter;
        return matchesStatus && matchesResource;
    });
    
    if (filteredHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No history entries found</td></tr>';
        return;
    }
    
    filteredHistory.forEach(item => {
        let row = document.createElement("tr");
        
        // Format timestamps
        let formattedStart = formatDateTime(item.start);
        let formattedEnd = formatDateTime(item.end);
        
        // Status badge
        let statusClass = item.status.toLowerCase().replace(' ', '-');
        let statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
        
        // Action buttons based on status
        let actionButtons = '';
        if (item.status === 'upcoming' || item.status === 'pending') {
            actionButtons = `
                <button class="btn-modify" data-ref="${item.reference}" data-type="${item.type}">Modify</button>
                <button class="btn-cancel" data-ref="${item.reference}" data-type="${item.type}">Cancel</button>
            `;
        } else if (item.status === 'active') {
            actionButtons = `
                <button class="btn-cancel" data-ref="${item.reference}" data-type="${item.type}">Cancel</button>
            `;
        } else {
            actionButtons = '<span style="color: #999;">Completed</span>';
        }
        
        row.innerHTML = `
            <td>
                <strong>${item.resource_name}</strong><br>
                <small style="color: #666;">${item.location}</small>
            </td>
            <td>${formattedStart}</td>
            <td>${formattedEnd}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="action-buttons">${actionButtons}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to buttons
    attachActionButtons();
}

function attachActionButtons() {
    // Modify buttons
    document.querySelectorAll('.btn-modify').forEach(btn => {
        btn.addEventListener('click', function() {
            let reference = this.getAttribute('data-ref');
            let type = this.getAttribute('data-type');
            handleModify(reference, type);
        });
    });
    
    // Cancel buttons
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            let reference = this.getAttribute('data-ref');
            let type = this.getAttribute('data-type');
            handleCancel(reference, type);
        });
    });
}

function handleModify(reference, type) {
    // Redirect to bookings page with modification mode
    // You can store this in sessionStorage and read it on the bookings page
    sessionStorage.setItem('modifyItem', JSON.stringify({ reference, type }));
    window.location.href = 'bookings.html';
}

function handleCancel(reference, type) {
    if (!confirm('Are you sure you want to cancel this booking/request?')) {
        return;
    }
    
    let endpoint = type === 'booking' ? 
        `http://localhost:3000/deleteBooking?reference=${reference}` :
        `http://localhost:3000/deleteRequest?reference=${reference}`;
    
    fetch(endpoint, { 
        credentials: 'include',
        method: 'GET'
    }).then(r => {
        if (r.ok) {
            alert('Successfully cancelled!');
            loadUserHistory(); // Reload the history
        } else {
            alert('Failed to cancel. Please try again.');
        }
    }).catch(err => {
        console.error('Error cancelling:', err);
        alert('An error occurred. Please try again.');
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