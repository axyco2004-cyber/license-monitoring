// License Monitoring System
let licenses = JSON.parse(localStorage.getItem('licenses')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    renderLicenses();
    updateStats();
    checkExpirationAlerts();
    setInterval(updateCurrentDate, 60000); // Update every minute
    
    // Set today's date as default for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assignment-date').value = today;
    
    // Form submissions
    document.getElementById('license-form').addEventListener('submit', handleAddLicense);
    document.getElementById('user-form').addEventListener('submit', handleAddUser);
    document.getElementById('assign-form').addEventListener('submit', handleAssignLicense);
});

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
}

// Show/Hide Modals
function showAddLicenseModal() {
    document.getElementById('add-license-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('add-license-modal').classList.add('hidden');
    document.getElementById('license-form').reset();
}

// Add User Modal
function showAddUserModal() {
    document.getElementById('add-user-modal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('add-user-modal').classList.add('hidden');
    document.getElementById('user-form').reset();
}

// Assign License Modal
function showAssignLicenseModal() {
    populateAssignDropdowns();
    document.getElementById('assign-license-modal').classList.remove('hidden');
}

function closeAssignModal() {
    document.getElementById('assign-license-modal').classList.add('hidden');
    document.getElementById('assign-form').reset();
}

// Free Licenses Modal
function showFreeLicensesModal() {
    renderFreeLicensesList();
    document.getElementById('free-licenses-modal').classList.remove('hidden');
}

function closeFreeLicensesModal() {
    document.getElementById('free-licenses-modal').classList.add('hidden');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const licenseModal = document.getElementById('add-license-modal');
    const userModal = document.getElementById('add-user-modal');
    const assignModal = document.getElementById('assign-license-modal');
    const freeModal = document.getElementById('free-licenses-modal');
    
    if (event.target === licenseModal) closeModal();
    if (event.target === userModal) closeUserModal();
    if (event.target === assignModal) closeAssignModal();
    if (event.target === freeModal) closeFreeLicensesModal();
}

// Handle Add License
function handleAddLicense(e) {
    e.preventDefault();
    
    const license = {
        id: generateId(),
        userName: document.getElementById('user-name').value,
        licenseKey: document.getElementById('license-key').value,
        assignmentDate: document.getElementById('assignment-date').value,
        expirationDate: document.getElementById('expiration-date').value,
        totalLicenses: parseInt(document.getElementById('total-licenses-input').value),
        usedLicenses: 1 // One license used by this user
    };
    
    licenses.push(license);
    saveLicenses();
    renderLicenses();
    updateStats();
    checkExpirationAlerts();
    closeModal();
}

// Handle Add User
function handleAddUser(e) {
    e.preventDefault();
    
    const user = {
        id: generateId(),
        name: document.getElementById('new-user-name').value,
        email: document.getElementById('user-email').value,
        department: document.getElementById('user-department').value || 'N/A'
    };
    
    users.push(user);
    saveUsers();
    closeUserModal();
    alert('User added successfully!');
}

// Handle Assign License
function handleAssignLicense(e) {
    e.preventDefault();
    
    const userId = document.getElementById('assign-user-select').value;
    const licenseId = document.getElementById('assign-license-select').value;
    
    const user = users.find(u => u.id === userId);
    const license = licenses.find(l => l.id === licenseId);
    
    if (license && license.usedLicenses < license.totalLicenses) {
        license.usedLicenses++;
        saveLicenses();
        renderLicenses();
        updateStats();
        closeAssignModal();
        alert(`License assigned to ${user.name} successfully!`);
    } else {
        alert('No free licenses available for this license type!');
    }
}
    renderLicenses();
    updateStats();
    checkExpirationAlerts();
    closeModal();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save to localStorage
function saveLicenses() {
    localStorage.setItem('licenses', JSON.stringify(licenses));
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Render licenses table
function renderLicenses() {
    const tbody = document.getElementById('licenses-tbody');
    
    if (licenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-12 text-center text-gray-400 text-lg">No licenses found. Click "Add License" to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = licenses.map(license => {
        const daysLeft = getDaysRemaining(license.expirationDate);
        const freeLicenses = license.totalLicenses - license.usedLicenses;
        const status = getStatus(daysLeft);
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-800 font-medium">${license.userName}</td>
                <td class="px-6 py-4"><code class="bg-gray-100 px-2 py-1 rounded text-sm text-indigo-600">${license.licenseKey}</code></td>
                <td class="px-6 py-4 text-gray-600">${formatDate(license.assignmentDate)}</td>
                <td class="px-6 py-4 text-gray-600">${formatDate(license.expirationDate)}</td>
                <td class="px-6 py-4 text-gray-800 font-semibold">${daysLeft >= 0 ? daysLeft + ' days' : 'Expired'}</td>
                <td class="px-6 py-4"><strong class="text-green-600">${freeLicenses}</strong> <span class="text-gray-400">of ${license.totalLicenses}</span></td>
                <td class="px-6 py-4"><span class="${status.class}">${status.text}</span></td>
                <td class="px-6 py-4">
                    <button onclick="deleteLicense('${license.id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Calculate days remaining
function getDaysRemaining(expirationDate) {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get status
function getStatus(daysLeft) {
    if (daysLeft < 0) {
        return { text: 'Expired', class: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800' };
    } else if (daysLeft <= 30) {
        return { text: 'Expiring Soon', class: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800' };
    } else {
        return { text: 'Active', class: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800' };
    }
}

// Update statistics
function updateStats() {
    const totalLicensesCount = licenses.reduce((sum, l) => sum + l.totalLicenses, 0);
    const usedLicensesCount = licenses.reduce((sum, l) => sum + l.usedLicenses, 0);
    const freeLicensesCount = totalLicensesCount - usedLicensesCount;
    const totalUsers = new Set(licenses.map(l => l.userName)).size;
    const expiringSoon = licenses.filter(l => {
        const days = getDaysRemaining(l.expirationDate);
        return days >= 0 && days <= 30;
    }).length;
    
    document.getElementById('total-licenses').textContent = totalLicensesCount;
    document.getElementById('free-licenses').textContent = freeLicensesCount;
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('expiring-soon').textContent = expiringSoon;
}

// Populate assign license dropdowns
function populateAssignDropdowns() {
    const userSelect = document.getElementById('assign-user-select');
    const licenseSelect = document.getElementById('assign-license-select');
    
    // Populate users
    userSelect.innerHTML = '<option value="">-- Select User --</option>' +
        users.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('');
    
    // Populate available licenses
    licenseSelect.innerHTML = '<option value="">-- Select License --</option>' +
        licenses.filter(l => l.usedLicenses < l.totalLicenses)
            .map(license => `<option value="${license.id}">${license.licenseKey} (${license.totalLicenses - license.usedLicenses} free)</option>`).join('');
}

// Render free licenses list
function renderFreeLicensesList() {
    const container = document.getElementById('free-licenses-list');
    
    if (licenses.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-8">No licenses available.</p>';
        return;
    }
    
    const licenseGroups = {};
    licenses.forEach(license => {
        const key = license.licenseKey;
        if (!licenseGroups[key]) {
            licenseGroups[key] = {
                key: key,
                total: 0,
                used: 0,
                free: 0,
                userName: license.userName,
                expirationDate: license.expirationDate
            };
        }
        licenseGroups[key].total += license.totalLicenses;
        licenseGroups[key].used += license.usedLicenses;
        licenseGroups[key].free = licenseGroups[key].total - licenseGroups[key].used;
    });
    
    container.innerHTML = Object.values(licenseGroups).map(group => `
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition-all">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${group.key}</h3>
                    <p class="text-sm text-gray-600">User: ${group.userName}</p>
                    <p class="text-sm text-gray-600">Expires: ${formatDate(group.expirationDate)}</p>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold text-green-600">${group.free}</div>
                    <div class="text-xs text-gray-500">of ${group.total} free</div>
                    <div class="text-xs text-gray-500">(${group.used} used)</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Check expiration alerts
function checkExpirationAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    const expiringLicenses = licenses.filter(l => {
        const days = getDaysRemaining(l.expirationDate);
        return days >= 0 && days <= 30;
    });
    
    const expiredLicenses = licenses.filter(l => getDaysRemaining(l.expirationDate) < 0);
    
    let alertsHTML = '';
    
    if (expiredLicenses.length > 0) {
        alertsHTML += '<h3 class="text-xl font-bold text-red-600 mb-4">⚠️ Expired Licenses</h3>';
        expiredLicenses.forEach(license => {
            alertsHTML += `
                <div class="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-lg mb-3 shadow-lg animate-pulse">
                    <strong class="font-semibold">${license.userName}</strong> - License ${license.licenseKey} has expired on ${formatDate(license.expirationDate)}
                </div>
            `;
        });
    }
    
    if (expiringLicenses.length > 0) {
        alertsHTML += '<h3 class="text-xl font-bold text-orange-600 mb-4 mt-6">⏰ Expiring Soon (Next 30 Days)</h3>';
        expiringLicenses.forEach(license => {
            const daysLeft = getDaysRemaining(license.expirationDate);
            alertsHTML += `
                <div class="bg-gradient-to-r from-orange-400 to-yellow-500 text-white p-4 rounded-lg mb-3 shadow-lg">
                    <strong class="font-semibold">${license.userName}</strong> - License ${license.licenseKey} expires in ${daysLeft} days (${formatDate(license.expirationDate)})
                </div>
            `;
        });
    }
    
    if (alertsHTML === '') {
        alertsHTML = '<p class="text-center text-gray-400 py-8 text-lg">✅ No expiration alerts. All licenses are in good standing!</p>';
    }
    
    alertsContainer.innerHTML = alertsHTML;
}

// Delete license
function deleteLicense(id) {
    if (confirm('Are you sure you want to delete this license?')) {
        licenses = licenses.filter(l => l.id !== id);
        saveLicenses();
        renderLicenses();
        updateStats();
        checkExpirationAlerts();
    }
}

// Export to Excel
function exportToExcel() {
    if (licenses.length === 0) {
        alert('No licenses to export!');
        return;
    }
    
    const exportData = licenses.map(license => ({
        'User Name': license.userName,
        'License Key': license.licenseKey,
        'Assignment Date': license.assignmentDate,
        'Expiration Date': license.expirationDate,
        'Days Remaining': getDaysRemaining(license.expirationDate),
        'Total Licenses': license.totalLicenses,
        'Used Licenses': license.usedLicenses,
        'Free Licenses': license.totalLicenses - license.usedLicenses,
        'Status': getStatus(getDaysRemaining(license.expirationDate)).text
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Licenses');
    
    const fileName = `License_Monitor_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

                expirationDate: '2026-03-15'
            }
        ];
        saveLicenses();
    }
    
    if (users.length === 0) {
        users = [
            {
                id: generateId(),
                name: 'John Smith',
                email: 'john.smith@company.com',
                department: 'Engineering'
            },
            {
                id: generateId(),
                name: 'Sarah Johnson',
                email: 'sarah.johnson@company.com',
                department: 'Design'
            },
            {
                id: generateId(),
                name: 'Michael Brown',
                email: 'michael.brown@company.com',
                department: 'Marketing'
            }
        ];
        saveUsers();
    }
    
    if (assignments.length === 0) {
        assignments = [
            {
                id: generateId(),
                userId: users[0].id,
                licenseId: licenses[0].id,
                accessDate: '2026-01-15'
            },
            {
                id: generateId(),
                userId: users[1].id,
                licenseId: licenses[1].id,
                accessDate: '2026-02-01'
            }
        ];
        saveAssignments();
    }
}

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Modal Functions
function showAddLicenseModal() {
    document.getElementById('license-modal').style.display = 'block';
    document.getElementById('license-form').reset();
}

function showAddUserModal() {
    document.getElementById('user-modal').style.display = 'block';
    document.getElementById('user-form').reset();
}

function showAssignLicenseModal() {
    populateAssignmentDropdowns();
    document.getElementById('assign-modal').style.display = 'block';
    document.getElementById('assign-form').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('access-date').value = today;
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// License Functions
function handleAddLicense(e) {
    e.preventDefault();
    
    const license = {
        id: generateId(),
        softwareName: document.getElementById('software-name').value,
        licenseKey: document.getElementById('license-key').value,
        totalSeats: parseInt(document.getElementById('total-seats').value),
        usedSeats: 0,
        expirationDate: document.getElementById('expiration-date').value
    };
    
    licenses.push(license);
    saveLicenses();
    renderLicenses();
    updateStats();
    closeModal('license-modal');
}

function deleteLicense(id) {
    if (confirm('Are you sure you want to delete this license?')) {
        // Remove assignments related to this license
        assignments = assignments.filter(a => a.licenseId !== id);
        saveAssignments();
        
        licenses = licenses.filter(l => l.id !== id);
        saveLicenses();
        renderLicenses();
        renderAssignments();
        updateStats();
    }
}

function renderLicenses() {
    const tbody = document.getElementById('licenses-tbody');
    
    if (licenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <div class="empty-state-text">No licenses found. Add your first license!</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = licenses.map(license => {
        const available = license.totalSeats - license.usedSeats;
        const status = getLicenseStatus(license.expirationDate);
        const statusClass = status === 'Active' ? 'status-active' : 
                           status === 'Expiring Soon' ? 'status-expiring' : 'status-expired';
        
        return `
            <tr>
                <td><strong>${license.softwareName}</strong></td>
                <td>${license.licenseKey}</td>
                <td>${license.totalSeats}</td>
                <td>${license.usedSeats}</td>
                <td><strong>${available}</strong></td>
                <td>${formatDate(license.expirationDate)}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn-sm btn-delete" onclick="deleteLicense('${license.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// User Functions
function handleAddUser(e) {
    e.preventDefault();
    
    const user = {
        id: generateId(),
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        department: document.getElementById('user-department').value
    };
    
    users.push(user);
    saveUsers();
    renderUsers();
    closeModal('user-modal');
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        // Remove assignments related to this user
        const userAssignments = assignments.filter(a => a.userId === id);
        userAssignments.forEach(assignment => {
            const license = licenses.find(l => l.id === assignment.licenseId);
            if (license) {
                license.usedSeats--;
            }
        });
        
        assignments = assignments.filter(a => a.userId !== id);
        saveAssignments();
        saveLicenses();
        
        users = users.filter(u => u.id !== id);
        saveUsers();
        renderUsers();
        renderLicenses();
        renderAssignments();
        updateStats();
    }
}

function renderUsers() {
    const tbody = document.getElementById('users-tbody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">No users found. Add your first user!</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const activeLicenses = assignments.filter(a => a.userId === user.id).length;
        
        return `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>${user.department || '-'}</td>
                <td>${activeLicenses}</td>
                <td>
                    <button class="btn-sm btn-delete" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Assignment Functions
function populateAssignmentDropdowns() {
    const userSelect = document.getElementById('assign-user');
    const softwareSelect = document.getElementById('assign-software');
    
    userSelect.innerHTML = '<option value="">-- Select User --</option>' +
        users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    
    // Only show licenses with available seats
    const availableLicenses = licenses.filter(l => l.usedSeats < l.totalSeats);
    softwareSelect.innerHTML = '<option value="">-- Select Software --</option>' +
        availableLicenses.map(l => 
            `<option value="${l.id}">${l.softwareName} (${l.totalSeats - l.usedSeats} available)</option>`
        ).join('');
}

function handleAssignLicense(e) {
    e.preventDefault();
    
    const userId = document.getElementById('assign-user').value;
    const licenseId = document.getElementById('assign-software').value;
    const accessDate = document.getElementById('access-date').value;
    
    // Check if user already has this license
    const existingAssignment = assignments.find(a => 
        a.userId === userId && a.licenseId === licenseId
    );
    
    if (existingAssignment) {
        alert('This user already has this license assigned!');
        return;
    }
    
    const license = licenses.find(l => l.id === licenseId);
    if (license && license.usedSeats < license.totalSeats) {
        license.usedSeats++;
        
        const assignment = {
            id: generateId(),
            userId: userId,
            licenseId: licenseId,
            accessDate: accessDate
        };
        
        assignments.push(assignment);
        saveAssignments();
        saveLicenses();
        renderLicenses();
        renderAssignments();
        renderDashboard();
        updateStats();
        closeModal('assign-modal');
    } else {
        alert('No available seats for this license!');
    }
}

function removeAssignment(id) {
    if (confirm('Are you sure you want to remove this assignment?')) {
        const assignment = assignments.find(a => a.id === id);
        if (assignment) {
            const license = licenses.find(l => l.id === assignment.licenseId);
            if (license) {
                license.usedSeats--;
                saveLicenses();
            }
        }
        
        assignments = assignments.filter(a => a.id !== id);
        saveAssignments();
        renderAssignments();
        renderLicenses();
        renderDashboard();
        updateStats();
    }
}

function renderAssignments() {
    const tbody = document.getElementById('assignments-tbody');
    
    if (assignments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-state-icon">🔑</div>
                    <div class="empty-state-text">No assignments found. Assign a license to a user!</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = assignments.map(assignment => {
        const user = users.find(u => u.id === assignment.userId);
        const license = licenses.find(l => l.id === assignment.licenseId);
        
        if (!user || !license) return '';
        
        const daysRemaining = getDaysRemaining(license.expirationDate);
        const status = getLicenseStatus(license.expirationDate);
        const statusClass = status === 'Active' ? 'status-active' : 
                           status === 'Expiring Soon' ? 'status-expiring' : 'status-expired';
        
        return `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${license.softwareName}</td>
                <td>${formatDate(assignment.accessDate)}</td>
                <td>${formatDate(license.expirationDate)}</td>
                <td>${daysRemaining >= 0 ? daysRemaining + ' days' : 'Expired'}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn-sm btn-delete" onclick="removeAssignment('${assignment.id}')">Remove</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Dashboard Functions
function renderDashboard() {
    const alertsContainer = document.getElementById('alerts-container');
    const alerts = [];
    
    // Check for expiring licenses
    licenses.forEach(license => {
        const daysRemaining = getDaysRemaining(license.expirationDate);
        const usersWithLicense = assignments.filter(a => a.licenseId === license.id)
            .map(a => users.find(u => u.id === a.userId))
            .filter(u => u);
        
        if (daysRemaining < 0) {
            alerts.push({
                type: 'danger',
                icon: '🚨',
                title: `${license.softwareName} - License Expired`,
                text: `This license expired ${Math.abs(daysRemaining)} days ago. ${usersWithLicense.length} users affected.`
            });
        } else if (daysRemaining <= 30) {
            alerts.push({
                type: 'warning',
                icon: '⚠️',
                title: `${license.softwareName} - Expiring Soon`,
                text: `This license will expire in ${daysRemaining} days (${formatDate(license.expirationDate)}). ${usersWithLicense.length} users affected.`
            });
        }
        
        // Check for low availability
        const available = license.totalSeats - license.usedSeats;
        if (available <= 2 && available > 0) {
            alerts.push({
                type: 'warning',
                icon: '📊',
                title: `${license.softwareName} - Low Availability`,
                text: `Only ${available} seat(s) remaining out of ${license.totalSeats}.`
            });
        }
    });
    
    if (alerts.length === 0) {
        alertsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-text">All licenses are in good standing!</div>
            </div>
        `;
        return;
    }
    
    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type}">
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-text">${alert.text}</div>
            </div>
        </div>
    `).join('');
}

// Statistics
function updateStats() {
    const totalLicenses = licenses.length;
    const availableSeats = licenses.reduce((sum, l) => sum + (l.totalSeats - l.usedSeats), 0);
    const expiringSoon = licenses.filter(l => {
        const days = getDaysRemaining(l.expirationDate);
        return days >= 0 && days <= 30;
    }).length;
    const expired = licenses.filter(l => getDaysRemaining(l.expirationDate) < 0).length;
    
    document.getElementById('total-licenses').textContent = totalLicenses;
    document.getElementById('available-licenses').textContent = availableSeats;
    document.getElementById('expiring-soon').textContent = expiringSoon;
    document.getElementById('expired-licenses').textContent = expired;
}

// Excel Export Function
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Licenses
    const licensesData = licenses.map(license => ({
        'Software Name': license.softwareName,
        'License Key': license.licenseKey,
        'Total Seats': license.totalSeats,
        'Used Seats': license.usedSeats,
        'Available Seats': license.totalSeats - license.usedSeats,
        'Expiration Date': formatDate(license.expirationDate),
        'Days Remaining': getDaysRemaining(license.expirationDate),
        'Status': getLicenseStatus(license.expirationDate)
    }));
    const ws1 = XLSX.utils.json_to_sheet(licensesData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Licenses');
    
    // Sheet 2: Users
    const usersData = users.map(user => ({
        'User Name': user.name,
        'Email': user.email,
        'Department': user.department || '-',
        'Active Licenses': assignments.filter(a => a.userId === user.id).length
    }));
    const ws2 = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Users');
    
    // Sheet 3: Assignments
    const assignmentsData = assignments.map(assignment => {
        const user = users.find(u => u.id === assignment.userId);
        const license = licenses.find(l => l.id === assignment.licenseId);
        
        return {
            'User Name': user ? user.name : 'Unknown',
            'User Email': user ? user.email : '-',
            'Software': license ? license.softwareName : 'Unknown',
            'Access Date': formatDate(assignment.accessDate),
            'Expiration Date': license ? formatDate(license.expirationDate) : '-',
            'Days Remaining': license ? getDaysRemaining(license.expirationDate) : '-',
            'Status': license ? getLicenseStatus(license.expirationDate) : '-'
        };
    });
    const ws3 = XLSX.utils.json_to_sheet(assignmentsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Assignments');
    
    // Sheet 4: Expiration Summary
    const expirationData = licenses.map(license => {
        const usersWithLicense = assignments.filter(a => a.licenseId === license.id)
            .map(a => users.find(u => u.id === a.userId))
            .filter(u => u)
            .map(u => u.name);
        
        return {
            'Software': license.softwareName,
            'Expiration Date': formatDate(license.expirationDate),
            'Days Until Expiration': getDaysRemaining(license.expirationDate),
            'Status': getLicenseStatus(license.expirationDate),
            'Users Affected': usersWithLicense.length,
            'User Names': usersWithLicense.join(', ') || 'None'
        };
    }).sort((a, b) => a['Days Until Expiration'] - b['Days Until Expiration']);
    const ws4 = XLSX.utils.json_to_sheet(expirationData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Expiration Report');
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `License_Monitor_Report_${date}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getDaysRemaining(expirationDate) {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getLicenseStatus(expirationDate) {
    const days = getDaysRemaining(expirationDate);
    if (days < 0) return 'Expired';
    if (days <= 30) return 'Expiring Soon';
    return 'Active';
}

function saveLicenses() {
    localStorage.setItem('licenses', JSON.stringify(licenses));
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveAssignments() {
    localStorage.setItem('assignments', JSON.stringify(assignments));
}
