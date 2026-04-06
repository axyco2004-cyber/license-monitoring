// Show/Hide Add User Modal
function showAddUserModal() {
    closeDropdown();
    document.getElementById('add-user-modal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('add-user-modal').classList.add('hidden');
    document.getElementById('user-form').reset();
}

function handleAddUser(e) {
    e.preventDefault();
    
    const userName = document.getElementById('new-user-name').value;
    const userEmail = document.getElementById('user-email').value;
    const userDept = document.getElementById('user-department').value;
    
    if (!userName || !userEmail) {
        alert('Please fill in user name and email!');
        return;
    }
    
    const user = {
        id: generateId(),
        name: userName,
        email: userEmail,
        department: userDept || 'N/A'
    };
    
    users.push(user);
    saveUsers();
    closeUserModal();
    alert('User added successfully!');
}

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
    document.getElementById('assign-form').addEventListener('submit', handleAssignLicense);
    document.getElementById('user-form').addEventListener('submit', handleAddUser);
    document.getElementById('device-form').addEventListener('submit', handleAddDevice);
    
    // Dropdown click prevention
    const dropdownContent = document.getElementById('dropdown-content');
    if (dropdownContent) {
        dropdownContent.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    // ...existing code...
});

// Toggle Dropdown Menu
function toggleDropdown(event) {
    event.stopPropagation();
    document.getElementById('dropdown-content').classList.toggle('show');
}

// Only close dropdown if click is outside both button and menu
window.addEventListener('click', function(event) {
    const btn = document.getElementById('dropdown-btn');
    const menu = document.getElementById('dropdown-content');
    if (!btn.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.remove('show');
    }
});

function closeDropdown() {
    document.getElementById('dropdown-content').classList.remove('show');
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
}

// Show/Hide Modals
function showAddLicenseModal() {
    closeDropdown();
    document.getElementById('add-license-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('add-license-modal').classList.add('hidden');
    document.getElementById('license-form').reset();
}

// Assign License Modal
function showAssignLicenseModal() {
    closeDropdown();
    populateAssignDropdowns();
    document.getElementById('assign-license-modal').classList.remove('hidden');
}

function closeAssignModal() {
    document.getElementById('assign-license-modal').classList.add('hidden');
    document.getElementById('assign-form').reset();
}

// Menu Handlers with Excel Export
function handleAddLicenseWithExport() {
    showAddLicenseModal();
}

function handleAssignWithExport() {
    showAssignLicenseModal();
}

// Open Excel File
function openExcelFile() {
    closeDropdown();
    document.getElementById('excel-file-input').click();
}

// Import Excel File
function importExcelFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Read first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length === 0) {
                alert('The Excel file is empty!');
                return;
            }
            
            // Import licenses from Excel
            let importedCount = 0;
            jsonData.forEach(row => {
                // Check if row has required fields
                if (row['User Name'] && row['License Key'] && row['Expiration Date']) {
                    const license = {
                        id: generateId(),
                        userName: row['User Name'] || '',
                        licenseKey: row['License Key'] || '',
                        assignmentDate: row['Assignment Date'] || new Date().toISOString().split('T')[0],
                        expirationDate: row['Expiration Date'] || '',
                        totalLicenses: parseInt(row['Total Licenses']) || 1,
                        usedLicenses: parseInt(row['Used Licenses']) || 1
                    };
                    licenses.push(license);
                    importedCount++;
                }
            });
            
            if (importedCount > 0) {
                saveLicenses();
                renderLicenses();
                updateStats();
                checkExpirationAlerts();
                alert(`Successfully imported ${importedCount} license(s) from Excel file!`);
            } else {
                alert('No valid license data found in the Excel file. Please ensure columns include: User Name, License Key, Expiration Date');
            }
        } catch (error) {
            alert('Error reading Excel file: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(file);
    // Reset file input
    event.target.value = '';
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
    const assignModal = document.getElementById('assign-license-modal');
    const freeModal = document.getElementById('free-licenses-modal');
    
    if (event.target === licenseModal) closeModal();
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
    
    // Export the newly added license
    exportSingleLicense(license);
}

// Handle Assign License
function handleAssignLicense(e) {
    e.preventDefault();
    
    const userId = document.getElementById('assign-user-select').value;
    const licenseId = document.getElementById('assign-license-select').value;
    
    if (!userId || !licenseId) {
        alert('Please select both a user and a license!');
        return;
    }
    
    const user = users.find(u => u.id === userId);
    const license = licenses.find(l => l.id === licenseId);
    
    if (!user || !license) {
        alert('Invalid user or license selection!');
        return;
    }
    
    if (license.usedLicenses >= license.totalLicenses) {
        alert('No free licenses available for this license type!');
        return;
    }
    
    // Increment used licenses
    license.usedLicenses++;
    saveLicenses();
    renderLicenses();
    updateStats();
    closeAssignModal();
    alert(`License assigned to ${user.name} successfully!`);
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
                    <button onclick="editLicense('${license.id}')" class="text-green-600 hover:text-green-800 font-semibold mr-3">Edit</button>
                    <button onclick="deleteLicense('${license.id}')" class="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Edit license
function editLicense(id) {
    const license = licenses.find(l => l.id === id);
    if (!license) return;
    
    // Populate the edit modal with license data
    document.getElementById('edit-license-id').value = license.id;
    document.getElementById('edit-user-name').value = license.userName;
    document.getElementById('edit-license-key').value = license.licenseKey;
    document.getElementById('edit-assignment-date').value = license.assignmentDate;
    document.getElementById('edit-expiration-date').value = license.expirationDate;
    document.getElementById('edit-total-licenses').value = license.totalLicenses;
    document.getElementById('edit-used-licenses').value = license.usedLicenses;
    
    // Show edit modal
    document.getElementById('edit-license-modal').classList.remove('hidden');
}

// Save edited license
function saveEditedLicense(e) {
    e.preventDefault();
    
    const licenseId = document.getElementById('edit-license-id').value;
    const license = licenses.find(l => l.id === licenseId);
    
    if (!license) {
        alert('License not found!');
        return;
    }
    
    // Update license properties
    license.userName = document.getElementById('edit-user-name').value;
    license.licenseKey = document.getElementById('edit-license-key').value;
    license.assignmentDate = document.getElementById('edit-assignment-date').value;
    license.expirationDate = document.getElementById('edit-expiration-date').value;
    license.totalLicenses = parseInt(document.getElementById('edit-total-licenses').value);
    license.usedLicenses = parseInt(document.getElementById('edit-used-licenses').value);
    
    saveLicenses();
    renderLicenses();
    updateStats();
    checkExpirationAlerts();
    closeEditLicenseModal();
    alert('License updated successfully!');
}

// Close edit license modal
function closeEditLicenseModal() {
    document.getElementById('edit-license-modal').classList.add('hidden');
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

// Export All Licenses to Excel
function exportAllToExcel() {
    closeDropdown();
    
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
    XLSX.utils.book_append_sheet(wb, ws, 'All Licenses');
    
    const fileName = `All_Licenses_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Export Single Added License
function exportSingleLicense(license) {
    const exportData = [{
        'User Name': license.userName,
        'License Key': license.licenseKey,
        'Assignment Date': license.assignmentDate,
        'Expiration Date': license.expirationDate,
        'Days Remaining': getDaysRemaining(license.expirationDate),
        'Total Licenses': license.totalLicenses,
        'Used Licenses': license.usedLicenses,
        'Free Licenses': license.totalLicenses - license.usedLicenses,
        'Status': getStatus(getDaysRemaining(license.expirationDate)).text
    }];
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'New License');
    
    const fileName = `Added_License_${license.userName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Export Assignment Details
function exportAssignment(user, license) {
    const exportData = [{
        'Assigned To': user.name,
        'User Email': user.email || 'N/A',
        'Department': user.department || 'N/A',
        'License Holder': license.userName,
        'License Key': license.licenseKey,
        'Assignment Date': new Date().toISOString().split('T')[0],
        'Expiration Date': license.expirationDate,
        'Days Remaining': getDaysRemaining(license.expirationDate),
        'Total Licenses': license.totalLicenses,
        'Used After Assignment': license.usedLicenses,
        'Free Licenses': license.totalLicenses - license.usedLicenses,
        'Status': getStatus(getDaysRemaining(license.expirationDate)).text
    }];
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assignment');
    
    const fileName = `Assignment_${user.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
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

// Edit assignment
function editAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;
    
    // Populate the edit modal with assignment data
    document.getElementById('edit-assignment-id').value = assignment.id;
    document.getElementById('edit-assign-user').value = assignment.userId;
    document.getElementById('edit-assign-license').value = assignment.licenseId;
    document.getElementById('edit-access-date').value = assignment.accessDate;
    
    // Populate dropdowns
    populateEditAssignmentDropdowns();
    
    // Show edit modal
    document.getElementById('edit-assignment-modal').classList.remove('hidden');
}

// Populate user and license dropdowns in edit assignment form
function populateEditAssignmentDropdowns() {
    // Users dropdown
    const userSelect = document.getElementById('edit-assign-user');
    userSelect.innerHTML = '<option value="">-- Select User --</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        userSelect.appendChild(option);
    });
    
    // Licenses dropdown
    const licenseSelect = document.getElementById('edit-assign-license');
    licenseSelect.innerHTML = '<option value="">-- Select License --</option>';
    licenses.forEach(license => {
        const option = document.createElement('option');
        option.value = license.id;
        const available = license.totalSeats - license.usedSeats;
        option.textContent = `${license.softwareName || license.licenseKey} (${available} available)`;
        licenseSelect.appendChild(option);
    });
}

// Save edited assignment
function saveEditedAssignment(e) {
    e.preventDefault();
    
    const assignmentId = document.getElementById('edit-assignment-id').value;
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
        alert('Assignment not found!');
        return;
    }
    
    const newUserId = document.getElementById('edit-assign-user').value;
    const newLicenseId = document.getElementById('edit-assign-license').value;
    const newAccessDate = document.getElementById('edit-access-date').value;
    
    // Check if this creates a duplicate assignment
    const duplicate = assignments.find(a => 
        a.id !== assignmentId && 
        a.userId === newUserId && 
        a.licenseId === newLicenseId
    );
    
    if (duplicate) {
        alert('This user already has this license assigned!');
        return;
    }
    
    // Handle license seat changes if license changed
    if (assignment.licenseId !== newLicenseId) {
        // Free up seat from old license
        const oldLicense = licenses.find(l => l.id === assignment.licenseId);
        if (oldLicense) {
            oldLicense.usedSeats--;
        }
        
        // Take seat from new license
        const newLicense = licenses.find(l => l.id === newLicenseId);
        if (newLicense) {
            if (newLicense.usedSeats >= newLicense.totalSeats) {
                alert('No available seats for this license!');
                // Restore old license seat
                if (oldLicense) oldLicense.usedSeats++;
                return;
            }
            newLicense.usedSeats++;
        }
    }
    
    // Update assignment properties
    assignment.userId = newUserId;
    assignment.licenseId = newLicenseId;
    assignment.accessDate = newAccessDate;
    
    saveAssignments();
    saveLicenses();
    renderAssignments();
    renderLicenses();
    renderDashboard();
    updateStats();
    closeEditAssignmentModal();
    alert('Assignment updated successfully!');
}

// Close edit assignment modal
function closeEditAssignmentModal() {
    document.getElementById('edit-assignment-modal').classList.add('hidden');
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
                    <button class="text-green-600 hover:text-green-800 font-semibold mr-3" onclick="editAssignment('${assignment.id}')">Edit</button>
                    <button class="text-red-600 hover:text-red-800 font-semibold" onclick="removeAssignment('${assignment.id}')">Delete</button>
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

// ===== DEVICES TAB FUNCTIONALITY =====

// Device data storage
let devices = JSON.parse(localStorage.getItem('devices')) || [];
let scannerStream = null;

// Tab switching function
function switchTab(tabName) {
    // Hide all tab contents
    document.getElementById('licenses-content').classList.add('hidden');
    document.getElementById('devices-content').classList.add('hidden');
    document.getElementById('checkin-content').classList.add('hidden');
    document.getElementById('checkout-content').classList.add('hidden');
    
    // Remove active class from all tabs
    document.getElementById('licenses-tab').classList.remove('border-indigo-600', 'text-indigo-600');
    document.getElementById('licenses-tab').classList.add('border-transparent', 'text-gray-500');
    document.getElementById('devices-tab').classList.remove('border-indigo-600', 'text-indigo-600');
    document.getElementById('devices-tab').classList.add('border-transparent', 'text-gray-500');
    document.getElementById('checkin-tab').classList.remove('border-indigo-600', 'text-indigo-600');
    document.getElementById('checkin-tab').classList.add('border-transparent', 'text-gray-500');
    document.getElementById('checkout-tab').classList.remove('border-indigo-600', 'text-indigo-600');
    document.getElementById('checkout-tab').classList.add('border-transparent', 'text-gray-500');
    
    // Show selected tab and activate it
    if (tabName === 'licenses') {
        document.getElementById('licenses-content').classList.remove('hidden');
        document.getElementById('licenses-tab').classList.add('border-indigo-600', 'text-indigo-600');
        document.getElementById('licenses-tab').classList.remove('border-transparent', 'text-gray-500');
    } else if (tabName === 'devices') {
        document.getElementById('devices-content').classList.remove('hidden');
        document.getElementById('devices-tab').classList.add('border-indigo-600', 'text-indigo-600');
        document.getElementById('devices-tab').classList.remove('border-transparent', 'text-gray-500');
        renderDevices();
        updateDeviceStats();
    } else if (tabName === 'checkin') {
        document.getElementById('checkin-content').classList.remove('hidden');
        document.getElementById('checkin-tab').classList.add('border-indigo-600', 'text-indigo-600');
        document.getElementById('checkin-tab').classList.remove('border-transparent', 'text-gray-500');
        renderCheckIns();
    } else if (tabName === 'checkout') {
        document.getElementById('checkout-content').classList.remove('hidden');
        document.getElementById('checkout-tab').classList.add('border-indigo-600', 'text-indigo-600');
        document.getElementById('checkout-tab').classList.remove('border-transparent', 'text-gray-500');
    }
}

// Show/Hide Device Modal
function showAddDeviceModal() {
    populateDeviceUserDropdown();
    document.getElementById('add-device-modal').classList.remove('hidden');
}

function closeDeviceModal() {
    document.getElementById('add-device-modal').classList.add('hidden');
    document.getElementById('device-form').reset();
}

// Populate user dropdown in device form
function populateDeviceUserDropdown() {
    const select = document.getElementById('device-assigned-user');
    select.innerHTML = '<option value="">-- Not Assigned --</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        select.appendChild(option);
    });
}

// Handle Device Form Submission
function handleAddDevice(e) {
    e.preventDefault();
    
    const serialNumber = document.getElementById('device-serial').value;
    
    // Check if serial number already exists
    if (devices.some(d => d.serialNumber === serialNumber)) {
        alert('A device with this serial number already exists!');
        return;
    }
    
    const userId = document.getElementById('device-assigned-user').value;
    const user = userId ? users.find(u => u.id === userId) : null;
    
    const device = {
        id: generateId(),
        serialNumber: serialNumber,
        name: document.getElementById('device-name').value,
        type: document.getElementById('device-type').value,
        assignedTo: user ? user.name : 'Unassigned',
        assignedUserId: userId || null,
        registrationDate: new Date().toISOString().split('T')[0],
        status: document.getElementById('device-status').value,
        notes: document.getElementById('device-notes').value || ''
    };
    
    devices.push(device);
    saveDevices();
    renderDevices();
    updateDeviceStats();
    closeDeviceModal();
    alert('Device registered successfully!');
}

// Save devices to localStorage
function saveDevices() {
    localStorage.setItem('devices', JSON.stringify(devices));
}

// Render devices table
function renderDevices() {
    const tbody = document.getElementById('devices-tbody');
    
    if (devices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-gray-400 text-lg">No devices registered. Click "Register Device" to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = devices.map(device => {
        const statusColors = {
            'Active': 'bg-green-100 text-green-800',
            'Inactive': 'bg-red-100 text-red-800',
            'Maintenance': 'bg-yellow-100 text-yellow-800',
            'Retired': 'bg-gray-100 text-gray-800'
        };
        
        const statusClass = statusColors[device.status] || 'bg-gray-100 text-gray-800';
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4"><code class="bg-gray-100 px-2 py-1 rounded text-sm text-indigo-600">${device.serialNumber}</code></td>
                <td class="px-6 py-4 text-gray-800 font-medium">${device.name}</td>
                <td class="px-6 py-4 text-gray-600">${device.type}</td>
                <td class="px-6 py-4 text-gray-600">${device.assignedTo}</td>
                <td class="px-6 py-4 text-gray-600">${formatDate(device.registrationDate)}</td>
                <td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-sm font-semibold ${statusClass}">${device.status}</span></td>
                <td class="px-6 py-4">
                    <button onclick="editDevice('${device.id}')" class="text-green-600 hover:text-green-800 font-semibold mr-3">Edit</button>
                    <button onclick="viewDeviceDetails('${device.id}')" class="text-blue-600 hover:text-blue-800 font-semibold mr-3">View</button>
                    <button onclick="deleteDevice('${device.id}')" class="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update device statistics
function updateDeviceStats() {
    const total = devices.length;
    const active = devices.filter(d => d.status === 'Active').length;
    const inactive = devices.filter(d => d.status !== 'Active').length;
    
    document.getElementById('total-devices').textContent = total;
    document.getElementById('active-devices').textContent = active;
    document.getElementById('inactive-devices').textContent = inactive;
}

// View device details
function viewDeviceDetails(id) {
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    let details = `
📱 Device Details:
━━━━━━━━━━━━━━━━━━━━━
Serial Number: ${device.serialNumber}
Device Name: ${device.name}
Type: ${device.type}
Assigned To: ${device.assignedTo}
Registration Date: ${formatDate(device.registrationDate)}
Status: ${device.status}
${device.notes ? 'Notes: ' + device.notes : ''}
    `;
    
    alert(details);
}

// Edit device
function editDevice(id) {
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    // Populate the edit modal with device data
    document.getElementById('edit-device-id').value = device.id;
    document.getElementById('edit-device-serial').value = device.serialNumber;
    document.getElementById('edit-device-name').value = device.name;
    document.getElementById('edit-device-type').value = device.type;
    document.getElementById('edit-device-status').value = device.status;
    document.getElementById('edit-device-notes').value = device.notes || '';
    
    // Populate user dropdown
    populateEditDeviceUserDropdown();
    document.getElementById('edit-device-assigned-user').value = device.assignedUserId || '';
    
    // Show edit modal
    document.getElementById('edit-device-modal').classList.remove('hidden');
}

// Populate user dropdown in edit device form
function populateEditDeviceUserDropdown() {
    const select = document.getElementById('edit-device-assigned-user');
    select.innerHTML = '<option value="">-- Not Assigned --</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        select.appendChild(option);
    });
}

// Save edited device
function saveEditedDevice(e) {
    e.preventDefault();
    
    const deviceId = document.getElementById('edit-device-id').value;
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
        alert('Device not found!');
        return;
    }
    
    const userId = document.getElementById('edit-device-assigned-user').value;
    const user = userId ? users.find(u => u.id === userId) : null;
    
    // Update device properties
    device.serialNumber = document.getElementById('edit-device-serial').value;
    device.name = document.getElementById('edit-device-name').value;
    device.type = document.getElementById('edit-device-type').value;
    device.assignedTo = user ? user.name : 'Unassigned';
    device.assignedUserId = userId || null;
    device.status = document.getElementById('edit-device-status').value;
    device.notes = document.getElementById('edit-device-notes').value || '';
    
    saveDevices();
    renderDevices();
    updateDeviceStats();
    closeEditDeviceModal();
    alert('Device updated successfully!');
}

// Close edit device modal
function closeEditDeviceModal() {
    document.getElementById('edit-device-modal').classList.add('hidden');
}

// Delete device
function deleteDevice(id) {
    if (confirm('Are you sure you want to delete this device?')) {
        devices = devices.filter(d => d.id !== id);
        saveDevices();
        renderDevices();
        updateDeviceStats();
        alert('Device deleted successfully!');
    }
}

// ===== BARCODE/QR CODE SCANNER FUNCTIONALITY =====

function scanSerialNumber() {
    // Show scanner modal
    document.getElementById('scanner-modal').classList.remove('hidden');
    startScanner();
}

function closeScannerModal() {
    stopScanner();
    document.getElementById('scanner-modal').classList.add('hidden');
}

function startScanner() {
    const video = document.getElementById('scanner-video');
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment' // Use back camera on mobile
        } 
    })
    .then(stream => {
        scannerStream = stream;
        video.srcObject = stream;
        video.play();
        
        // Start detecting codes (simple implementation - for production use a library like QuaggaJS or ZXing)
        setTimeout(() => {
            detectCode();
        }, 1000);
    })
    .catch(err => {
        console.error('Camera access error:', err);
        alert('Could not access camera. Please enter the serial number manually or check camera permissions.');
        closeScannerModal();
    });
}

function stopScanner() {
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerStream = null;
    }
}

function detectCode() {
    // This is a simplified version - for production, use a proper barcode scanning library
    // For now, we'll show a prompt to enter the code manually
    const code = prompt('Camera active. For this demo, please enter the serial number:');
    
    if (code) {
        document.getElementById('device-serial').value = code;
        closeScannerModal();
        alert('Serial number captured: ' + code);
    } else {
        closeScannerModal();
    }
}

// ===== CHECK IN FUNCTIONALITY =====

// Check-in data storage
let checkIns = JSON.parse(localStorage.getItem('checkIns')) || [];
let checkInScannerStream = null;

// Show Check In modal
function showCheckInModal() {
    document.getElementById('checkin-modal').classList.remove('hidden');
    
    // Set current date and time
    const now = new Date();
    const dateTimeLocal = now.toISOString().slice(0, 16);
    document.getElementById('checkin-datetime').value = dateTimeLocal;
    
    document.getElementById('checkin-form').reset();
    document.getElementById('checkin-datetime').value = dateTimeLocal;
    
    // Hide device info panels
    document.getElementById('checkin-device-info').classList.add('hidden');
    document.getElementById('checkin-device-notfound').classList.add('hidden');
}

// Close Check In modal
function closeCheckInModal() {
    document.getElementById('checkin-modal').classList.add('hidden');
}

// Handle Check In form submission
function handleCheckIn(e) {
    e.preventDefault();
    
    const serialNumber = document.getElementById('checkin-serial').value;
    
    // Find device info if available
    const device = devices.find(d => d.serialNumber.toLowerCase() === serialNumber.toLowerCase());
    
    const checkIn = {
        id: generateId(),
        serialNumber: serialNumber,
        dateTime: document.getElementById('checkin-datetime').value,
        deliverPerson: document.getElementById('checkin-deliver').value,
        receiverPerson: document.getElementById('checkin-receiver').value,
        timestamp: new Date().toISOString(),
        // Additional device info if found
        deviceName: device ? device.name : 'N/A',
        deviceType: device ? device.type : 'N/A',
        deviceStatus: device ? device.status : 'Unknown'
    };
    
    checkIns.push(checkIn);
    saveCheckIns();
    renderCheckIns();
    closeCheckInModal();
    alert('Device checked in successfully!' + (device ? ` (${device.name})` : ''));
}

// Save check-ins to localStorage
function saveCheckIns() {
    localStorage.setItem('checkIns', JSON.stringify(checkIns));
}

// Render check-ins table
function renderCheckIns() {
    const tbody = document.getElementById('checkin-tbody');
    
    if (checkIns.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-12 text-center text-gray-400 text-lg">No check-ins recorded. Click "Check In Device" to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = checkIns.map(checkIn => {
        const dateTime = new Date(checkIn.dateTime);
        const formattedDateTime = dateTime.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <tr class="hover:bg-green-50 transition-colors">
                <td class="px-6 py-4"><code class="bg-green-100 px-2 py-1 rounded text-sm text-green-700 font-semibold">${checkIn.serialNumber}</code></td>
                <td class="px-6 py-4 text-gray-800">${formattedDateTime}</td>
                <td class="px-6 py-4 text-gray-800 font-medium">${checkIn.deliverPerson}</td>
                <td class="px-6 py-4 text-gray-800 font-medium">${checkIn.receiverPerson}</td>
                <td class="px-6 py-4">
                    <button onclick="deleteCheckIn('${checkIn.id}')" class="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Delete check-in
function deleteCheckIn(id) {
    if (confirm('Are you sure you want to delete this check-in record?')) {
        checkIns = checkIns.filter(c => c.id !== id);
        saveCheckIns();
        renderCheckIns();
    }
}

// Scanner for Check In
function scanCheckInSerial() {
    document.getElementById('checkin-scanner-modal').classList.remove('hidden');
    startCheckInScanner();
}

function closeCheckInScannerModal() {
    stopCheckInScanner();
    document.getElementById('checkin-scanner-modal').classList.add('hidden');
}

function startCheckInScanner() {
    const video = document.getElementById('checkin-scanner-video');
    
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment'
        } 
    })
    .then(stream => {
        checkInScannerStream = stream;
        video.srcObject = stream;
        video.play();
        
        setTimeout(() => {
            detectCheckInCode();
        }, 1000);
    })
    .catch(err => {
        console.error('Camera access error:', err);
        alert('Could not access camera. Please enter the serial number manually or check camera permissions.');
        closeCheckInScannerModal();
    });
}

function stopCheckInScanner() {
    if (checkInScannerStream) {
        checkInScannerStream.getTracks().forEach(track => track.stop());
        checkInScannerStream = null;
    }
}

function detectCheckInCode() {
    const code = prompt('Camera active. For this demo, please enter the serial number:');
    
    if (code) {
        document.getElementById('checkin-serial').value = code;
        closeCheckInScannerModal();
        searchDeviceBySerial(); // Auto-search after scanning
        alert('Serial number captured: ' + code);
    } else {
        closeCheckInScannerModal();
    }
}

// Auto-search device by serial number
function searchDeviceBySerial() {
    const serialNumber = document.getElementById('checkin-serial').value.trim();
    
    // Hide all info panels first
    document.getElementById('checkin-device-info').classList.add('hidden');
    document.getElementById('checkin-device-notfound').classList.add('hidden');
    
    // If serial number is empty, don't search
    if (!serialNumber) {
        return;
    }
    
    // Search in devices database
    const device = devices.find(d => d.serialNumber.toLowerCase() === serialNumber.toLowerCase());
    
    if (device) {
        // Device found - display info
        document.getElementById('checkin-device-info').classList.remove('hidden');
        document.getElementById('device-info-source').textContent = 'DEVICES DB';
        document.getElementById('device-info-name').textContent = device.name;
        document.getElementById('device-info-type').textContent = device.type;
        document.getElementById('device-info-assigned').textContent = device.assignedTo;
        document.getElementById('device-info-status').textContent = device.status;
        
        if (device.notes) {
            document.getElementById('device-info-notes').textContent = '📝 Notes: ' + device.notes;
            document.getElementById('device-info-notes').classList.remove('hidden');
        } else {
            document.getElementById('device-info-notes').classList.add('hidden');
        }
        
        return;
    }
    
    // Search in assignments database (check if serial matches any assignment data)
    const assignment = assignments.find(a => {
        const user = users.find(u => u.id === a.userId);
        const license = licenses.find(l => l.id === a.licenseId);
        // Check if serial number might be in assignment notes or related to user/license
        return user && user.name.toLowerCase().includes(serialNumber.toLowerCase());
    });
    
    if (assignment) {
        const user = users.find(u => u.id === assignment.userId);
        const license = licenses.find(l => l.id === assignment.licenseId);
        
        document.getElementById('checkin-device-info').classList.remove('hidden');
        document.getElementById('device-info-source').textContent = 'ASSIGNMENTS DB';
        document.getElementById('device-info-name').textContent = license ? license.softwareName : 'N/A';
        document.getElementById('device-info-type').textContent = 'License Assignment';
        document.getElementById('device-info-assigned').textContent = user ? user.name : 'N/A';
        document.getElementById('device-info-status').textContent = 'Assigned';
        document.getElementById('device-info-notes').textContent = '📝 Found in license assignments';
        document.getElementById('device-info-notes').classList.remove('hidden');
        
        return;
    }
    
    // Check if serial number appears in any previous check-ins
    const previousCheckIn = checkIns.find(c => c.serialNumber.toLowerCase() === serialNumber.toLowerCase());
    
    if (previousCheckIn) {
        const dateTime = new Date(previousCheckIn.dateTime);
        document.getElementById('checkin-device-info').classList.remove('hidden');
        document.getElementById('device-info-source').textContent = 'CHECK-IN HISTORY';
        document.getElementById('device-info-name').textContent = serialNumber;
        document.getElementById('device-info-type').textContent = 'Previous Check-In';
        document.getElementById('device-info-assigned').textContent = previousCheckIn.deliverPerson;
        document.getElementById('device-info-status').textContent = 'Previously Checked In';
        document.getElementById('device-info-notes').textContent = `📅 Last check-in: ${dateTime.toLocaleDateString()} by ${previousCheckIn.receiverPerson}`;
        document.getElementById('device-info-notes').classList.remove('hidden');
        
        return;
    }
    
    // Device not found in any database
    document.getElementById('checkin-device-notfound').classList.remove('hidden');
}

// Export check-ins to Excel
function exportCheckInsToExcel() {
    if (checkIns.length === 0) {
        alert('No check-in records to export.');
        return;
    }
    
    const data = checkIns.map(checkIn => {
        const dateTime = new Date(checkIn.dateTime);
        return {
            'Serial Number': checkIn.serialNumber,
            'Device Name': checkIn.deviceName || 'N/A',
            'Device Type': checkIn.deviceType || 'N/A',
            'Date': dateTime.toLocaleDateString('en-US'),
            'Time': dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            'Deliver Person': checkIn.deliverPerson,
            'IT Receiver Person': checkIn.receiverPerson,
            'Device Status': checkIn.deviceStatus || 'Unknown'
        };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Checked In');
    
    const fileName = `checked_in_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

