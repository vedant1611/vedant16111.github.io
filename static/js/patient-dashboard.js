/**
 * Patient Dashboard JavaScript
 * Handles patient registration, listing, search, and detail display
 */

// Initialize variables
let patients = [];
let currentPatient = null;

// DOM elements
const registerPatientForm = document.getElementById('registerPatientForm');
const savePatientBtn = document.getElementById('savePatientBtn');
const patientsTable = document.getElementById('patientsTable');
const patientSearch = document.getElementById('patientSearch');
const searchButton = document.getElementById('searchButton');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    if (registerPatientForm) {
        savePatientBtn.addEventListener('click', handlePatientRegistration);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', searchPatients);
    }
    
    if (patientSearch) {
        patientSearch.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchPatients();
            }
        });
    }
    
    // Load existing patients
    fetchPatients();
    
    // Initialize patient statistics
    updatePatientStats();
});

/**
 * Handle the patient registration form submission
 */
async function handlePatientRegistration() {
    // Validate form
    if (!validatePatientForm()) {
        return;
    }
    
    // Create patient data object
    const patientData = {
        name: document.getElementById('patientName').value,
        age: parseInt(document.getElementById('patientAge').value),
        gender: document.getElementById('patientGender').value,
        blood_type: document.getElementById('patientBloodType').value,
        phone: document.getElementById('patientPhone').value,
        aadhaar: document.getElementById('patientAadhaar').value || null,
        address: document.getElementById('patientAddress').value,
        status: document.getElementById('patientStatus').value,
        medical_condition: document.getElementById('medicalCondition').value || null,
        transplant_type: document.getElementById('transplantType').value || null
    };
    
    try {
        // Send data to the server
        const response = await fetch('/register-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerPatientModal'));
            modal.hide();
            
            // Show success message
            showAlert('Patient registered successfully!', 'success');
            
            // Reset form
            registerPatientForm.reset();
            
            // Refresh patient list
            fetchPatients();
        } else {
            showAlert('Failed to register patient: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error registering patient:', error);
        showAlert('An error occurred while registering the patient', 'danger');
    }
}

/**
 * Validate the patient registration form
 * @return {boolean} - True if form is valid, false otherwise
 */
function validatePatientForm() {
    let isValid = true;
    
    // Check all required fields
    const requiredFields = [
        'patientName', 'patientAge', 'patientGender', 'patientBloodType', 
        'patientPhone', 'patientAddress', 'patientStatus'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validate Aadhaar if provided (must be 12 digits)
    const aadhaarField = document.getElementById('patientAadhaar');
    if (aadhaarField.value && !/^\d{12}$/.test(aadhaarField.value)) {
        aadhaarField.classList.add('is-invalid');
        showAlert('Aadhaar number must be 12 digits without spaces', 'warning');
        isValid = false;
    } else if (aadhaarField.value) {
        aadhaarField.classList.remove('is-invalid');
    }
    
    // Validate phone number (basic validation)
    const phoneField = document.getElementById('patientPhone');
    if (phoneField.value && !/^\d{10}$/.test(phoneField.value.replace(/[^0-9]/g, ''))) {
        phoneField.classList.add('is-invalid');
        showAlert('Please enter a valid phone number', 'warning');
        isValid = false;
    } else {
        phoneField.classList.remove('is-invalid');
    }
    
    return isValid;
}

/**
 * Fetch patients from the server and update the table
 */
async function fetchPatients() {
    try {
        const response = await fetch('/get-patients');
        const data = await response.json();
        
        if (data.success) {
            patients = data.patients;
            updatePatientsTable(patients);
            updatePatientStats();
        } else {
            showAlert('Failed to fetch patients: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error fetching patients:', error);
        showAlert('An error occurred while fetching patients', 'danger');
    }
}

/**
 * Update the patients table with the provided patient data
 * @param {Array} patientData - Array of patient objects
 */
function updatePatientsTable(patientData) {
    // Clear existing rows
    const tbody = patientsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add patient rows
    if (patientData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">No patient records available</td>';
        tbody.appendChild(emptyRow);
    } else {
        patientData.forEach(patient => {
            const row = document.createElement('tr');
            
            // Determine ID type
            const idType = patient.aadhaar ? 'Aadhaar' : 'Phone';
            const idValue = patient.aadhaar || patient.phone;
            
            row.innerHTML = `
                <td>${patient.id}</td>
                <td>${patient.name}</td>
                <td>${patient.age}/${patient.gender}</td>
                <td>${patient.blood_type}</td>
                <td>${patient.phone}</td>
                <td>${idType}</td>
                <td>${formatDate(patient.registration_date)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info view-patient" data-id="${patient.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add event listener to view button
            row.querySelector('.view-patient').addEventListener('click', () => {
                viewPatientDetails(patient.id);
            });
        });
    }
}

/**
 * View patient details in a modal
 * @param {number} patientId - The ID of the patient to view
 */
async function viewPatientDetails(patientId) {
    try {
        // Fetch patient details
        const response = await fetch(`/get-patient/${patientId}`);
        const data = await response.json();
        
        if (data.success) {
            const patient = data.patient;
            currentPatient = patient;
            
            // Populate modal fields
            document.getElementById('detailsName').textContent = patient.name;
            document.getElementById('detailsAgeGender').textContent = `${patient.age} years / ${patient.gender}`;
            document.getElementById('detailsBloodType').textContent = patient.blood_type;
            document.getElementById('detailsPhone').textContent = patient.phone;
            document.getElementById('detailsAadhaar').textContent = patient.aadhaar || 'Not provided';
            document.getElementById('detailsAddress').textContent = patient.address;
            document.getElementById('detailsStatus').textContent = patient.status;
            document.getElementById('detailsCondition').textContent = patient.medical_condition || 'Not specified';
            document.getElementById('detailsTransplant').textContent = patient.transplant_type || 'None';
            document.getElementById('detailsRegistration').textContent = formatDate(patient.registration_date);
            
            // Set up action buttons
            document.getElementById('detailsViewMedical').href = `/medical-history?id=${patient.id}`;
            document.getElementById('detailsSetMedication').href = `/medication-reminder?id=${patient.id}`;
            document.getElementById('detailsQuestionnaire').href = `/questionnaire?id=${patient.id}`;
            document.getElementById('detailsAdverseReaction').href = `/adverse-reaction?id=${patient.id}`;
            document.getElementById('detailsEditPatient').addEventListener('click', () => {
                editPatient(patient);
            });
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('patientDetailsModal'));
            modal.show();
        } else {
            showAlert('Failed to fetch patient details: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error fetching patient details:', error);
        showAlert('An error occurred while fetching patient details', 'danger');
    }
}

/**
 * Enable editing of patient details
 * @param {Object} patient - The patient object to edit
 */
function editPatient(patient) {
    // Close the details modal
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('patientDetailsModal'));
    detailsModal.hide();
    
    // Populate the registration form with patient data
    document.getElementById('patientName').value = patient.name;
    document.getElementById('patientAge').value = patient.age;
    document.getElementById('patientGender').value = patient.gender;
    document.getElementById('patientBloodType').value = patient.blood_type;
    document.getElementById('patientPhone').value = patient.phone;
    document.getElementById('patientAadhaar').value = patient.aadhaar || '';
    document.getElementById('patientAddress').value = patient.address;
    document.getElementById('patientStatus').value = patient.status;
    document.getElementById('medicalCondition').value = patient.medical_condition || '';
    document.getElementById('transplantType').value = patient.transplant_type || '';
    
    // Show the registration modal
    const registerModal = new bootstrap.Modal(document.getElementById('registerPatientModal'));
    registerModal.show();
    
    // Change the button text to indicate editing
    savePatientBtn.textContent = 'Update Patient';
    
    // Store the patient ID for updating
    savePatientBtn.dataset.editId = patient.id;
}

/**
 * Search patients based on the search input
 */
function searchPatients() {
    const searchTerm = patientSearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
        updatePatientsTable(patients);
        return;
    }
    
    // Filter patients based on search term
    const filteredPatients = patients.filter(patient => {
        return (
            patient.name.toLowerCase().includes(searchTerm) ||
            patient.id.toString().includes(searchTerm) ||
            (patient.aadhaar && patient.aadhaar.includes(searchTerm)) ||
            patient.phone.includes(searchTerm) ||
            patient.blood_type.toLowerCase().includes(searchTerm)
        );
    });
    
    updatePatientsTable(filteredPatients);
}

/**
 * Update patient statistics
 */
function updatePatientStats() {
    // Update count displays
    document.getElementById('totalPatients').textContent = patients.length || 0;
    
    // Count patients by status
    const transplantCount = patients.filter(p => p.transplant_type && p.status === 'Post-Transplant').length;
    const waitlistCount = patients.filter(p => p.status === 'Pre-Transplant').length;
    const followupCount = patients.filter(p => p.status === 'Regular Follow-up').length;
    
    document.getElementById('transplantPatients').textContent = transplantCount;
    document.getElementById('waitlistPatients').textContent = waitlistCount;
    document.getElementById('followupPatients').textContent = followupCount;
    
    // Update chart
    updatePatientChart(transplantCount, waitlistCount, followupCount);
}
