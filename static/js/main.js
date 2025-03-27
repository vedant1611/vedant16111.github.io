/**
 * Main JavaScript file for the Organ Transplant Management System
 * Contains common utility functions used across multiple pages
 */

// Initialize tooltips and popovers when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Initialize all popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});

/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format (YYYY-MM-DD or ISO format)
 * @return {string} - Formatted date (e.g., "Jan 15, 2023")
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Format a datetime string to a more readable format
 * @param {string} dateTimeString - The datetime string to format
 * @return {string} - Formatted datetime (e.g., "Jan 15, 2023, 2:30 PM")
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, warning, info)
 * @param {number} duration - Duration in milliseconds before alert disappears (0 for no auto-dismiss)
 */
function showAlert(message, type = 'info', duration = 5000) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Append to the alert container
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.appendChild(alertDiv);
    } else {
        // If no alert container exists, create one at the top of the main content
        const mainContent = document.querySelector('main');
        const newAlertContainer = document.createElement('div');
        newAlertContainer.id = 'alertContainer';
        newAlertContainer.className = 'container mt-3';
        newAlertContainer.appendChild(alertDiv);
        
        if (mainContent) {
            mainContent.prepend(newAlertContainer);
        } else {
            document.body.prepend(newAlertContainer);
        }
    }
    
    // Auto dismiss after duration (if not 0)
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv) {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, duration);
    }
}

/**
 * Get patient information by ID, Aadhaar, or Phone
 * @param {string} searchType - Type of search (id, aadhaar, phone)
 * @param {string} searchValue - The value to search for
 * @return {Promise} - Promise resolving to patient object or null if not found
 */
async function getPatientBySearch(searchType, searchValue) {
    try {
        // Fetch all patients and filter on the client side (for demo purposes)
        const response = await fetch('/get-patients');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to fetch patients');
        }
        
        // Filter patients based on search criteria
        let patient = null;
        
        if (searchType === 'id') {
            const patientId = parseInt(searchValue);
            patient = data.patients.find(p => p.id === patientId);
        } else if (searchType === 'aadhaar') {
            patient = data.patients.find(p => p.aadhaar === searchValue);
        } else if (searchType === 'phone') {
            patient = data.patients.find(p => p.phone === searchValue);
        }
        
        return patient;
    } catch (error) {
        console.error('Error finding patient:', error);
        return null;
    }
}

/**
 * Generate a unique ID for the application
 * @return {string} - Unique ID
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Validate that all required form fields are filled
 * @param {HTMLFormElement} form - The form to validate
 * @return {boolean} - True if all required fields are filled, false otherwise
 */
function validateForm(form) {
    let isValid = true;
    
    // Check all required inputs
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

/**
 * Calculate age from birthdate
 * @param {string} birthdate - The birthdate in format YYYY-MM-DD
 * @return {number} - Age in years
 */
function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * Check if the user is logged in
 * @return {boolean} - True if user is logged in, false otherwise
 */
function isLoggedIn() {
    // Simple check for demo purposes
    // In a real application, this would check a session cookie or token
    return document.querySelector('body').classList.contains('logged-in') || 
           document.getElementById('navbarDropdown') !== null;
}

// Add logged-in class to body if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('navbarDropdown')) {
        document.querySelector('body').classList.add('logged-in');
    }
});
