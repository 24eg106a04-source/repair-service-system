const API_BASE = '/api';

// Cache
let currentRepairs = [];
let currentTechnicians = [];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadDashboardStats();
    loadRepairs();
    loadTechnicians();

    setupEventListeners();
}

function setupEventListeners() {
    // Quick track navbar
    document.getElementById('btnQuickTrack').addEventListener('click', () => {
        const val = document.getElementById('quickTrackInput').value.trim();
        if (val) trackTicket(val);
    });
    document.getElementById('quickTrackInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = document.getElementById('quickTrackInput').value.trim();
            if (val) trackTicket(val);
        }
    });

    // Customer page track
    document.getElementById('btnTrack').addEventListener('click', () => {
        const val = document.getElementById('trackInput').value.trim();
        if (val) trackTicket(val);
    });

    // Refresh Admin
    document.getElementById('btnRefreshAdmin').addEventListener('click', () => {
        loadDashboardStats();
        loadRepairs();
        showToast('Data refreshed', 'info');
    });

    // Filters
    document.getElementById('filterStatus').addEventListener('change', () => {
        loadRepairs();
    });

    document.getElementById('adminSearchInput').addEventListener('input', (e) => {
        filterAdminTable(e.target.value.toLowerCase());
    });

    // Customer email filter
    document.getElementById('btnFilterCustEmail').addEventListener('click', () => {
        const email = document.getElementById('custEmailFilter').value.trim();
        loadCustomerRepairs(email);
    });

    // Submit new repair form
    document.getElementById('newRepairForm').addEventListener('submit', handleNewRepairSubmit);

    // Technician panel dropdown change
    document.getElementById('technicianSelect').addEventListener('change', (e) => {
        const techId = e.target.value;
        if (techId) {
            loadTechnicianJobs(techId);
        } else {
            document.getElementById('technicianJobsTableBody').innerHTML = `
                <tr><td colspan="7" class="text-center py-4 text-muted">Please select a technician above to view assigned jobs.</td></tr>
            `;
        }
    });

    // Assign Technician modal confirm
    document.getElementById('btnConfirmAssign').addEventListener('click', handleAssignConfirm);

    // Update Status modal confirm
    document.getElementById('btnConfirmStatusUpdate').addEventListener('click', handleStatusUpdateConfirm);

    // Register new technician form
    document.getElementById('newTechForm').addEventListener('submit', handleNewTechSubmit);
}

// -------------------------------------------------------------
// API CALLS & DATA LOADING
// -------------------------------------------------------------

async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();

        document.getElementById('statTotal').innerText = data.totalRequests;
        document.getElementById('statPending').innerText = data.pendingRequests;
        document.getElementById('statAssigned').innerText = data.assignedRequests;
        document.getElementById('statInProgress').innerText = data.inProgressRequests;
        document.getElementById('statCompleted').innerText = data.completedRequests;
        document.getElementById('statRevenue').innerText = `$${(data.totalRevenue || 0).toFixed(2)}`;
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}

async function loadRepairs() {
    const status = document.getElementById('filterStatus').value;
    let url = `${API_BASE}/repairs`;
    if (status) {
        url += `?status=${encodeURIComponent(status)}`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch repairs');
        currentRepairs = await res.json();
        renderAdminRepairs(currentRepairs);
    } catch (err) {
        console.error('Error fetching repairs:', err);
        document.getElementById('repairTableBody').innerHTML = `
            <tr><td colspan="8" class="text-center text-danger py-4">Error loading data. Make sure backend is running.</td></tr>
        `;
    }
}

async function loadTechnicians() {
    try {
        const res = await fetch(`${API_BASE}/technicians`);
        if (!res.ok) throw new Error('Failed to fetch technicians');
        currentTechnicians = await res.json();

        // Update Technician Select in Tech tab
        const techSelect = document.getElementById('technicianSelect');
        techSelect.innerHTML = '<option value="">-- Choose Technician --</option>';
        currentTechnicians.forEach(t => {
            techSelect.innerHTML += `<option value="${t.id}">${t.name} (${t.specialization}) - Jobs: ${t.activeJobsCount}</option>`;
        });

        // Update Modal Select
        const modalTechSelect = document.getElementById('modalTechSelect');
        modalTechSelect.innerHTML = '<option value="">-- Choose Certified Technician --</option>';
        currentTechnicians.forEach(t => {
            modalTechSelect.innerHTML += `<option value="${t.id}">${t.name} - ${t.specialization} (${t.activeJobsCount} active)</option>`;
        });

        // Render Technicians Grid
        renderTechniciansGrid(currentTechnicians);
    } catch (err) {
        console.error('Error fetching technicians:', err);
    }
}

async function loadCustomerRepairs(email) {
    if (!email) {
        renderCustomerRepairs(currentRepairs);
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/repairs/customer/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch customer repairs');
        const data = await res.json();
        renderCustomerRepairs(data);
    } catch (err) {
        console.error(err);
        showToast('Error loading customer history', 'danger');
    }
}

async function loadTechnicianJobs(technicianId) {
    try {
        const res = await fetch(`${API_BASE}/repairs/technician/${technicianId}`);
        if (!res.ok) throw new Error('Failed to load technician jobs');
        const jobs = await res.json();
        renderTechnicianJobs(jobs);
    } catch (err) {
        console.error(err);
        showToast('Failed to load technician jobs', 'danger');
    }
}

// -------------------------------------------------------------
// RENDER FUNCTIONS
// -------------------------------------------------------------

function renderAdminRepairs(repairs) {
    const tbody = document.getElementById('repairTableBody');
    if (!repairs || repairs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No repair requests found.</td></tr>`;
        return;
    }

    tbody.innerHTML = repairs.map(r => `
        <tr>
            <td>
                <span class="fw-bold text-primary font-monospace">${escapeHtml(r.trackingNumber)}</span>
                <div class="text-muted" style="font-size: 0.72rem;">${formatDate(r.createdAt)}</div>
            </td>
            <td>
                <div class="fw-semibold">${escapeHtml(r.customerName)}</div>
                <div class="small text-muted">${escapeHtml(r.customerEmail)}</div>
                <div class="small text-muted">${escapeHtml(r.customerPhone)}</div>
            </td>
            <td>
                <span class="badge bg-light text-dark border me-1">${escapeHtml(r.deviceType)}</span>
                <strong>${escapeHtml(r.deviceBrand)}</strong> ${escapeHtml(r.deviceModel)}
                <div class="text-muted small text-truncate" style="max-width: 200px;" title="${escapeHtml(r.issueDescription)}">
                    ${escapeHtml(r.issueDescription)}
                </div>
            </td>
            <td>
                <span class="badge priority-${r.priority}">${r.priority}</span>
            </td>
            <td>
                <span class="badge badge-status status-${r.status}">${r.status}</span>
            </td>
            <td>
                ${r.assignedTechnician ? `
                    <div class="fw-semibold text-dark"><i class="bi bi-person me-1"></i>${escapeHtml(r.assignedTechnician.name)}</div>
                    <div class="small text-muted">${escapeHtml(r.assignedTechnician.specialization)}</div>
                ` : `<span class="badge bg-secondary-subtle text-secondary">Unassigned</span>`}
            </td>
            <td>
                <div><span class="text-muted small">Est:</span> $${(r.estimatedCost || 0).toFixed(2)}</div>
                <div><span class="text-muted small">Final:</span> <strong class="text-success">$${(r.finalCost || 0).toFixed(2)}</strong></div>
            </td>
            <td class="text-end">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="openDetailsModal(${r.id})" title="View Details & Tracking">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="openAssignModal(${r.id}, '${r.trackingNumber}', ${r.assignedTechnician ? r.assignedTechnician.id : 'null'}, ${r.estimatedCost})" title="Assign Technician">
                        <i class="bi bi-person-plus"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="openStatusModal(${r.id}, '${r.trackingNumber}', '${r.status}', '${escapeQuotes(r.technicianNotes || '')}', ${r.estimatedCost}, ${r.finalCost})" title="Update Status">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteRequest(${r.id})" title="Delete Request">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderCustomerRepairs(repairs) {
    const tbody = document.getElementById('customerTableBody');
    if (!repairs || repairs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No requests found for this query.</td></tr>`;
        return;
    }

    tbody.innerHTML = repairs.map(r => `
        <tr>
            <td><strong class="text-primary font-monospace">${escapeHtml(r.trackingNumber)}</strong></td>
            <td>
                <strong>${escapeHtml(r.deviceBrand)}</strong> ${escapeHtml(r.deviceModel)}
                <div class="small text-muted">${escapeHtml(r.deviceType)}</div>
            </td>
            <td><span class="badge badge-status status-${r.status}">${r.status}</span></td>
            <td>${r.assignedTechnician ? escapeHtml(r.assignedTechnician.name) : '<em class="text-muted">Pending</em>'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="trackTicket('${r.trackingNumber}')">
                    <i class="bi bi-search me-1"></i> Track
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTechnicianJobs(jobs) {
    const tbody = document.getElementById('technicianJobsTableBody');
    if (!jobs || jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No repair requests assigned to this technician currently.</td></tr>`;
        return;
    }

    tbody.innerHTML = jobs.map(r => `
        <tr>
            <td><strong class="text-primary font-monospace">${escapeHtml(r.trackingNumber)}</strong></td>
            <td>
                <div class="fw-bold">${escapeHtml(r.customerName)} (${escapeHtml(r.customerPhone)})</div>
                <div>${escapeHtml(r.deviceBrand)} ${escapeHtml(r.deviceModel)} <span class="badge bg-light text-dark">${r.deviceType}</span></div>
            </td>
            <td style="max-width: 250px;">
                <div class="small text-muted">${escapeHtml(r.issueDescription)}</div>
                <span class="badge priority-${r.priority} mt-1">${r.priority}</span>
            </td>
            <td><span class="badge badge-status status-${r.status}">${r.status}</span></td>
            <td>
                <div class="small">Est: $${(r.estimatedCost || 0).toFixed(2)}</div>
                <div class="small fw-bold text-success">Final: $${(r.finalCost || 0).toFixed(2)}</div>
            </td>
            <td style="max-width: 200px;">
                <div class="small fst-italic text-secondary">${escapeHtml(r.technicianNotes || 'None yet')}</div>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-primary" onclick="openStatusModal(${r.id}, '${r.trackingNumber}', '${r.status}', '${escapeQuotes(r.technicianNotes || '')}', ${r.estimatedCost}, ${r.finalCost})">
                    <i class="bi bi-pencil-square me-1"></i> Update Progress
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTechniciansGrid(techs) {
    const grid = document.getElementById('techCardsGrid');
    if (!techs || techs.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No technicians found.</div>`;
        return;
    }

    grid.innerHTML = techs.map(t => `
        <div class="col-md-6 col-lg-3">
            <div class="card h-100 border p-3 shadow-sm rounded-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="rounded-circle bg-primary-subtle text-primary p-3 fs-4 d-flex align-items-center justify-content-center" style="width: 52px; height: 52px;">
                        <i class="bi bi-person-gear"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0">${escapeHtml(t.name)}</h6>
                        <span class="badge ${t.available ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}">
                            ${t.available ? 'Available' : 'Busy'}
                        </span>
                    </div>
                </div>
                <p class="small text-muted mb-2"><strong>Specialization:</strong><br>${escapeHtml(t.specialization)}</p>
                <p class="small text-muted mb-3">
                    <i class="bi bi-envelope me-1"></i> ${escapeHtml(t.email)}<br>
                    <i class="bi bi-telephone me-1"></i> ${escapeHtml(t.phone)}
                </p>
                <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                    <span class="small fw-semibold text-secondary">Active Jobs:</span>
                    <span class="badge bg-primary rounded-pill fs-6 px-3">${t.activeJobsCount}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// -------------------------------------------------------------
// USER ACTIONS & HANDLERS
// -------------------------------------------------------------

async function handleNewRepairSubmit(e) {
    e.preventDefault();

    const payload = {
        customerName: document.getElementById('custName').value.trim(),
        customerEmail: document.getElementById('custEmail').value.trim(),
        customerPhone: document.getElementById('custPhone').value.trim(),
        deviceType: document.getElementById('deviceType').value,
        deviceBrand: document.getElementById('deviceBrand').value.trim(),
        deviceModel: document.getElementById('deviceModel').value.trim(),
        serialNumber: document.getElementById('serialNumber').value.trim(),
        priority: document.getElementById('priority').value,
        issueDescription: document.getElementById('issueDescription').value.trim()
    };

    try {
        const res = await fetch(`${API_BASE}/repairs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to create repair request');
        const created = await res.json();

        showToast(`Request submitted! Tracking: ${created.trackingNumber}`, 'success');
        document.getElementById('newRepairForm').reset();

        // Refresh lists
        loadDashboardStats();
        loadRepairs();
        loadCustomerRepairs(payload.customerEmail);

        // Show details directly
        trackTicket(created.trackingNumber);
    } catch (err) {
        console.error(err);
        showToast('Error submitting request. Please try again.', 'danger');
    }
}

async function trackTicket(trackingNumber) {
    try {
        const res = await fetch(`${API_BASE}/repairs/track/${encodeURIComponent(trackingNumber)}`);
        if (!res.ok) {
            showToast('Ticket not found for tracking number: ' + trackingNumber, 'warning');
            return;
        }
        const data = await res.json();
        renderTicketDetailsModal(data);
    } catch (err) {
        console.error(err);
        showToast('Could not find tracking code ' + trackingNumber, 'danger');
    }
}

function openDetailsModal(id) {
    const item = currentRepairs.find(r => r.id === id);
    if (item) {
        renderTicketDetailsModal(item);
    }
}

function renderTicketDetailsModal(ticket) {
    const statuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIdx = statuses.indexOf(ticket.status);

    const stepBarHtml = `
        <div class="track-step-bar">
            <div class="track-step ${currentIdx >= 0 ? 'done' : ''} ${ticket.status === 'PENDING' ? 'active' : ''}">
                <div class="step-icon"><i class="bi bi-file-earmark-text"></i></div>
                <div class="small fw-bold">Submitted</div>
            </div>
            <div class="track-step ${currentIdx >= 1 ? 'done' : ''} ${ticket.status === 'ASSIGNED' ? 'active' : ''}">
                <div class="step-icon"><i class="bi bi-person-check"></i></div>
                <div class="small fw-bold">Assigned</div>
            </div>
            <div class="track-step ${currentIdx >= 2 ? 'done' : ''} ${ticket.status === 'IN_PROGRESS' ? 'active' : ''}">
                <div class="step-icon"><i class="bi bi-gear-wide"></i></div>
                <div class="small fw-bold">In Progress</div>
            </div>
            <div class="track-step ${ticket.status === 'COMPLETED' ? 'done active' : ''}">
                <div class="step-icon"><i class="bi bi-check-lg"></i></div>
                <div class="small fw-bold">Completed</div>
            </div>
        </div>
    `;

    const html = `
        ${stepBarHtml}

        <div class="row g-3 mt-2">
            <div class="col-md-6">
                <div class="card p-3 bg-light border-0">
                    <h6 class="fw-bold text-primary mb-2"><i class="bi bi-upc-scan me-2"></i>Service Information</h6>
                    <div class="mb-1"><strong>Tracking Number:</strong> <span class="font-monospace text-primary fw-bold">${ticket.trackingNumber}</span></div>
                    <div class="mb-1"><strong>Status:</strong> <span class="badge badge-status status-${ticket.status}">${ticket.status}</span></div>
                    <div class="mb-1"><strong>Priority:</strong> <span class="badge priority-${ticket.priority}">${ticket.priority}</span></div>
                    <div class="mb-1"><strong>Created Date:</strong> ${formatDate(ticket.createdAt)}</div>
                    <div><strong>Last Updated:</strong> ${formatDate(ticket.updatedAt || ticket.createdAt)}</div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card p-3 bg-light border-0">
                    <h6 class="fw-bold text-primary mb-2"><i class="bi bi-laptop me-2"></i>Device & Customer</h6>
                    <div class="mb-1"><strong>Device:</strong> ${ticket.deviceBrand} ${ticket.deviceModel} (${ticket.deviceType})</div>
                    <div class="mb-1"><strong>Serial No:</strong> ${ticket.serialNumber || 'N/A'}</div>
                    <div class="mb-1"><strong>Customer:</strong> ${ticket.customerName}</div>
                    <div class="mb-1"><strong>Email:</strong> ${ticket.customerEmail}</div>
                    <div><strong>Phone:</strong> ${ticket.customerPhone}</div>
                </div>
            </div>

            <div class="col-12">
                <div class="card p-3 border">
                    <h6 class="fw-bold mb-2"><i class="bi bi-exclamation-triangle text-warning me-2"></i>Customer Issue Description</h6>
                    <p class="mb-0 text-muted">${escapeHtml(ticket.issueDescription)}</p>
                </div>
            </div>

            <div class="col-12">
                <div class="card p-3 border">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="fw-bold mb-0"><i class="bi bi-wrench me-2 text-info"></i>Technician Diagnosis & Notes</h6>
                        <div>
                            ${ticket.assignedTechnician ? `<span class="badge bg-info-subtle text-info fw-semibold"><i class="bi bi-person me-1"></i>${ticket.assignedTechnician.name}</span>` : '<span class="badge bg-secondary">Unassigned</span>'}
                        </div>
                    </div>
                    <p class="mb-3 text-muted">${ticket.technicianNotes ? escapeHtml(ticket.technicianNotes) : '<em>No technician diagnosis notes recorded yet.</em>'}</p>
                    <div class="row g-2 border-top pt-2">
                        <div class="col-6"><strong>Estimated Cost:</strong> $${(ticket.estimatedCost || 0).toFixed(2)}</div>
                        <div class="col-6"><strong>Final Total Billed:</strong> <span class="text-success fw-bold fs-6">$${(ticket.finalCost || 0).toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('detailsModalContent').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

function openAssignModal(requestId, trackingCode, techId, estimatedCost) {
    document.getElementById('assignRequestId').value = requestId;
    document.getElementById('assignTicketCode').innerText = trackingCode;
    document.getElementById('modalTechSelect').value = techId || '';
    document.getElementById('modalEstimatedCost').value = estimatedCost || '';

    const modal = new bootstrap.Modal(document.getElementById('assignModal'));
    modal.show();
}

async function handleAssignConfirm() {
    const requestId = document.getElementById('assignRequestId').value;
    const technicianId = document.getElementById('modalTechSelect').value;
    const estimatedCost = parseFloat(document.getElementById('modalEstimatedCost').value) || 0;

    if (!technicianId) {
        showToast('Please select a technician', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/repairs/${requestId}/assign`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ technicianId, estimatedCost })
        });

        if (!res.ok) throw new Error('Failed to assign technician');
        bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
        showToast('Technician assigned successfully', 'success');

        loadDashboardStats();
        loadRepairs();
        loadTechnicians();
    } catch (err) {
        console.error(err);
        showToast('Error assigning technician', 'danger');
    }
}

function openStatusModal(requestId, trackingCode, status, notes, estCost, finalCost) {
    document.getElementById('statusRequestId').value = requestId;
    document.getElementById('statusTicketCode').innerText = trackingCode;
    document.getElementById('modalStatusSelect').value = status;
    document.getElementById('modalTechNotes').value = notes || '';
    document.getElementById('modalEstCost').value = estCost || '';
    document.getElementById('modalFinalCost').value = finalCost || '';

    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
}

async function handleStatusUpdateConfirm() {
    const requestId = document.getElementById('statusRequestId').value;
    const status = document.getElementById('modalStatusSelect').value;
    const technicianNotes = document.getElementById('modalTechNotes').value.trim();
    const estimatedCost = parseFloat(document.getElementById('modalEstCost').value) || 0;
    const finalCost = parseFloat(document.getElementById('modalFinalCost').value) || 0;

    try {
        const res = await fetch(`${API_BASE}/repairs/${requestId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, technicianNotes, estimatedCost, finalCost })
        });

        if (!res.ok) throw new Error('Failed to update status');
        bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
        showToast('Status updated successfully', 'success');

        loadDashboardStats();
        loadRepairs();
        loadTechnicians();

        // If a technician was selected on the workbench, refresh their list
        const currentTechId = document.getElementById('technicianSelect').value;
        if (currentTechId) {
            loadTechnicianJobs(currentTechId);
        }
    } catch (err) {
        console.error(err);
        showToast('Error updating status', 'danger');
    }
}

async function handleNewTechSubmit(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('techName').value.trim(),
        email: document.getElementById('techEmail').value.trim(),
        phone: document.getElementById('techPhone').value.trim(),
        specialization: document.getElementById('techSpecialization').value.trim(),
        available: true
    };

    try {
        const res = await fetch(`${API_BASE}/technicians`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to create technician');
        bootstrap.Modal.getInstance(document.getElementById('newTechModal')).hide();
        document.getElementById('newTechForm').reset();
        showToast('Technician added successfully', 'success');

        loadDashboardStats();
        loadTechnicians();
    } catch (err) {
        console.error(err);
        showToast('Error creating technician', 'danger');
    }
}

async function deleteRequest(id) {
    if (!confirm('Are you sure you want to delete this repair ticket?')) return;
    try {
        const res = await fetch(`${API_BASE}/repairs/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        showToast('Repair ticket deleted', 'info');
        loadDashboardStats();
        loadRepairs();
    } catch (err) {
        console.error(err);
        showToast('Error deleting repair ticket', 'danger');
    }
}

function filterAdminTable(query) {
    if (!query) {
        renderAdminRepairs(currentRepairs);
        return;
    }
    const filtered = currentRepairs.filter(r => 
        (r.trackingNumber && r.trackingNumber.toLowerCase().includes(query)) ||
        (r.customerName && r.customerName.toLowerCase().includes(query)) ||
        (r.customerEmail && r.customerEmail.toLowerCase().includes(query)) ||
        (r.deviceBrand && r.deviceBrand.toLowerCase().includes(query)) ||
        (r.deviceModel && r.deviceModel.toLowerCase().includes(query)) ||
        (r.deviceType && r.deviceType.toLowerCase().includes(query)) ||
        (r.issueDescription && r.issueDescription.toLowerCase().includes(query))
    );
    renderAdminRepairs(filtered);
}

// -------------------------------------------------------------
// UTILITIES
// -------------------------------------------------------------

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' :
                    type === 'danger' ? 'bg-danger text-white' :
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateStr;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
