/**
 * Donor Registration JavaScript
 * Handles the registration of potential organ donors and displays donor records
 */

// Initialize variables to store donor data
let donors = [];

// DOM elements
const donorForm = document.getElementById('donor-registration-form');
const donorsTable = document.getElementById('donorsTable');
const successModal = new bootstrap.Modal(document.getElementById('successModal'));
const donorIdDisplay = document.getElementById('donorIdDisplay');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    donorForm.addEventListener('submit', handleDonorRegistration);
    
    // Load existing donors
    fetchDonors();
});

/**
 * Handle the donor registration form submission
 * @param {Event} event - The form submission event
 */
async function handleDonorRegistration(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateDonorForm()) {
        return;
    }
    
    // Collect organs for donation
    const organs = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.id.endsWith('Check')) {
            organs.push(checkbox.value);
        }
    });
    
    // Create donor data object
    const donorData = {
        name: document.getElementById('donorName').value,
        age: parseInt(document.getElementById('donorAge').value),
        gender: document.getElementById('donorGender').value,
        blood_type: document.getElementById('donorBloodType').value,
        hospital: document.getElementById('donorHospital').value,
        status: document.getElementById('donorStatus').value,
        cause_of_death: document.getElementById('causeOfDeath').value,
        organs: organs,
        medical_history: document.getElementById('medicalHistory').value,
        additional_notes: document.getElementById('additionalNotes').value,
        time_of_death: document.getElementById('timeOfDeath').value,
        consent_confirmed: document.getElementById('consentConfirmed').checked
    };
    
    try {
        // Send data to the server
        const response = await fetch('/register-donor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donorData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            donorIdDisplay.textContent = data.donor_id;
            successModal.show();
            
            // Reset form
            donorForm.reset();
            
            // Refresh donor list
            fetchDonors();
        } else {
            showAlert('Failed to register donor: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error registering donor:', error);
        showAlert('An error occurred while registering the donor', 'danger');
    }
}

/**
 * Validate the donor registration form
 * @return {boolean} - True if form is valid, false otherwise
 */
function validateDonorForm() {
    let isValid = true;
    
    // Check all required fields
    const requiredFields = [
        'donorName', 'donorAge', 'donorGender', 'donorBloodType', 
        'donorHospital', 'donorStatus', 'causeOfDeath'
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
    
    // Check if at least one organ is selected
    const organChecked = document.querySelector('input[type="checkbox"]:checked');
    if (!organChecked) {
        showAlert('Please select at least one organ for donation', 'warning');
        isValid = false;
    }
    
    // Check consent
    const consentConfirmed = document.getElementById('consentConfirmed');
    if (!consentConfirmed.checked) {
        consentConfirmed.classList.add('is-invalid');
        showAlert('Please confirm that proper consent has been obtained', 'warning');
        isValid = false;
    } else {
        consentConfirmed.classList.remove('is-invalid');
    }
    
    return isValid;
}

/**
 * Fetch donors from the server and update the table
 */
async function fetchDonors() {
    // For this static demo, we'll use mock data
    // In a real application, this would fetch data from the server
    const mockDonors = [{
        id: 1,
        name: "John Doe",
        age: 45,
        gender: "Male",
        blood_type: "O+",
        status: "Deceased",
        hospital: "City Medical Center",
        organs: ["Kidney", "Liver", "Corneas"],
        registration_date: "2023-07-15 10:30:42"
    }];
    
    // Update the donors array
    donors = mockDonors;
    
    // Update the table
    updateDonorsTable();
}

/**
 * Update the donors table with the latest data
 */
function updateDonorsTable() {
    // Clear existing rows
    const tbody = donorsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add donor rows
    if (donors.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="8" class="text-center">No donor records available</td>';
        tbody.appendChild(emptyRow);
    } else {
        donors.forEach(donor => {
            const row = document.createElement('tr');
            
            // Format organs list
            const organsList = donor.organs.join(', ');
            
            row.innerHTML = `
                <td>${donor.id}</td>
                <td>${donor.name}</td>
                <td>${donor.age}/${donor.gender}</td>
                <td>${donor.blood_type}</td>
                <td>${donor.status}</td>
                <td>${donor.hospital}</td>
                <td>${organsList}</td>
                <td>${formatDateTime(donor.registration_date)}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
}
