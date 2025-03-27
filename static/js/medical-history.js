/**
 * Medical History JavaScript
 * Handles viewing and updating patient medical history records
 */

// Initialize variables
let currentPatient = null;
let patientHistory = [];
let surgeryRecords = [];
let labResults = [];

// DOM elements
const findPatientBtn = document.getElementById('findPatientBtn');
const patientInfoContainer = document.getElementById('patientInfoContainer');
const medicalHistorySection = document.getElementById('medicalHistorySection');
const historyTable = document.getElementById('historyTable');
const surgeryTable = document.getElementById('surgeryTable');
const labTable = document.getElementById('labTable');
const medicalHistoryForm = document.getElementById('medicalHistoryForm');
const saveSurgeryBtn = document.getElementById('saveSurgeryBtn');
const saveLabBtn = document.getElementById('saveLabBtn');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    if (findPatientBtn) {
        findPatientBtn.addEventListener('click', findPatient);
    }
    
    if (medicalHistoryForm) {
        medicalHistoryForm.addEventListener('submit', addMedicalRecord);
    }
    
    if (saveSurgeryBtn) {
        saveSurgeryBtn.addEventListener('click', addSurgeryRecord);
    }
    
    if (saveLabBtn) {
        saveLabBtn.addEventListener('click', addLabResult);
    }
    
    // Check for patient ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        document.getElementById('searchType').value = 'id';
        document.getElementById('searchValue').value = urlParams.get('id');
        findPatient();
    }
});

/**
 * Find patient based on search criteria
 */
async function findPatient() {
    const searchType = document.getElementById('searchType').value;
    const searchValue = document.getElementById('searchValue').value.trim();
    
    if (!searchValue) {
        showAlert('Please enter a search value', 'warning');
        return;
    }
    
    try {
        const patient = await getPatientBySearch(searchType, searchValue);
        
        if (patient) {
            // Store current patient
            currentPatient = patient;
            
            // Display patient information
            patientInfoContainer.innerHTML = `
                <div class="card-title border-bottom pb-2">
                    <span class="badge bg-info float-end">${patient.status}</span>
                    <h5 class="mb-0">${patient.name}</h5>
                </div>
                <p><strong>ID:</strong> ${patient.id}</p>
                <p><strong>Age/Gender:</strong> ${patient.age} years / ${patient.gender}</p>
                <p><strong>Blood Type:</strong> ${patient.blood_type}</p>
                <p><strong>Contact:</strong> ${patient.phone}</p>
                <p><strong>Aadhaar:</strong> ${patient.aadhaar || 'Not provided'}</p>
                <p><strong>Address:</strong> ${patient.address}</p>
                ${patient.transplant_type ? 
                    `<p><strong>Transplant Type:</strong> ${patient.transplant_type}</p>` : ''}
                ${patient.medical_condition ? 
                    `<p><strong>Primary Condition:</strong> ${patient.medical_condition}</p>` : ''}
            `;
            
            // Show medical history section
            medicalHistorySection.classList.remove('d-none');
            
            // Set patient ID in the form
            document.getElementById('historyPatientId').value = patient.id;
            
            // Fetch medical history
            await fetchMedicalHistory(patient.id);
            
            // Scroll to medical history section
            medicalHistorySection.scrollIntoView({ behavior: 'smooth' });
        } else {
            patientInfoContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No patient found with the provided ${searchType}.
                </div>
            `;
            
            // Hide medical history section
            medicalHistorySection.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error finding patient:', error);
        patientInfoContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                An error occurred while searching for the patient.
            </div>
        `;
        medicalHistorySection.classList.add('d-none');
    }
}

/**
 * Fetch medical history for a patient
 * @param {number} patientId - The ID of the patient
 */
async function fetchMedicalHistory(patientId) {
    try {
        // In a real app, this would make an API call to fetch the medical history
        // For this static demo, we'll use mock data
        
        // Mock medical history records
        const mockHistory = [];
        if (currentPatient.medical_history) {
            mockHistory.push(...currentPatient.medical_history);
        }
        
        // Update medical history table
        updateMedicalHistoryTable(mockHistory);
        
        // Mock surgery records
        updateSurgeryTable([]);
        
        // Mock lab results
        updateLabTable([]);
    } catch (error) {
        console.error('Error fetching medical history:', error);
        showAlert('An error occurred while fetching medical history', 'danger');
    }
}

/**
 * Update the medical history table with the provided data
 * @param {Array} historyData - Array of medical history objects
 */
function updateMedicalHistoryTable(historyData) {
    // Store history data
    patientHistory = historyData || [];
    
    // Clear existing rows
    const tbody = historyTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add history rows
    if (patientHistory.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="text-center">No medical history records available</td>';
        tbody.appendChild(emptyRow);
    } else {
        patientHistory.forEach((record, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDateTime(record.date)}</td>
                <td>Dr. ${record.doctor_name || 'Unknown'}</td>
                <td>${record.diagnosis || 'N/A'}</td>
                <td>${record.treatment || 'N/A'}</td>
                <td>${record.notes || 'N/A'}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
}

/**
 * Update the surgery records table with the provided data
 * @param {Array} surgeryData - Array of surgery record objects
 */
function updateSurgeryTable(surgeryData) {
    // Store surgery data
    surgeryRecords = surgeryData || [];
    
    // Clear existing rows
    const tbody = surgeryTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add surgery rows
    if (surgeryRecords.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="text-center">No surgery records available</td>';
        tbody.appendChild(emptyRow);
    } else {
        surgeryRecords.forEach((record, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatDate(record.date)}</td>
                <td>${record.type}</td>
                <td>${record.surgeon}</td>
                <td>${record.organ_procedure}</td>
                <td>${record.outcome}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
}

/**
 * Update the laboratory results table with the provided data
 * @param {Array} labData - Array of laboratory result objects
 */
function updateLabTable(labData) {
    // Store lab data
    labResults = labData || [];
    
    // Clear existing rows
    const tbody = labTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add lab result rows
    if (labResults.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="text-center">No laboratory records available</td>';
        tbody.appendChild(emptyRow);
    } else {
        labResults.forEach((record, index) => {
            const row = document.createElement('tr');
            
            // Determine status class for color coding
            let statusClass = '';
            switch (record.status) {
                case 'Normal':
                    statusClass = 'text-success';
                    break;
                case 'Abnormal - High':
                case 'Abnormal - Low':
                    statusClass = 'text-warning';
                    break;
                case 'Critical':
                    statusClass = 'text-danger';
                    break;
                default:
                    statusClass = '';
            }
            
            row.innerHTML = `
                <td>${formatDate(record.date)}</td>
                <td>${record.test_name}</td>
                <td>${record.result}</td>
                <td>${record.reference_range || 'N/A'}</td>
                <td class="${statusClass}">${record.status}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
}

/**
 * Add a new medical record for the patient
 * @param {Event} event - The form submission event
 */
async function addMedicalRecord(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm(medicalHistoryForm)) {
        return;
    }
    
    // Create medical record data
    const medicalData = {
        patient_id: parseInt(document.getElementById('historyPatientId').value),
        diagnosis: document.getElementById('diagnosis').value,
        treatment: document.getElementById('treatment').value,
        notes: document.getElementById('historyNotes').value,
        procedures_performed: document.getElementById('proceduresPerformed').value || null,
        follow_up_date: document.getElementById('followUpDate').value || null
    };
    
    try {
        // Send data to the server
        const response = await fetch('/update-medical-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicalData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showAlert('Medical record added successfully!', 'success');
            
            // Reset form
            medicalHistoryForm.reset();
            
            // Refresh medical history
            await fetchMedicalHistory(medicalData.patient_id);
        } else {
            showAlert('Failed to add medical record: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error adding medical record:', error);
        showAlert('An error occurred while adding the medical record', 'danger');
    }
}

/**
 * Add a new surgery/transplant record
 */
async function addSurgeryRecord() {
    // Validate form
    const surgeryForm = document.getElementById('surgeryForm');
    if (!validateForm(surgeryForm)) {
        return;
    }
    
    // Create surgery record data
    const surgeryData = {
        patient_id: parseInt(document.getElementById('historyPatientId').value),
        date: document.getElementById('surgeryDate').value,
        type: document.getElementById('surgeryType').value,
        surgeon: document.getElementById('surgeon').value,
        organ_procedure: document.getElementById('organProcedure').value,
        outcome: document.getElementById('outcome').value,
        notes: document.getElementById('surgeryNotes').value || null
    };
    
    // Add to the list (in a real app, this would be sent to the server)
    surgeryRecords.push(surgeryData);
    
    // Update the table
    updateSurgeryTable(surgeryRecords);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addSurgeryModal'));
    modal.hide();
    
    // Show success message
    showAlert('Surgery record added successfully!', 'success');
    
    // Reset form
    surgeryForm.reset();
}

/**
 * Add a new laboratory result
 */
async function addLabResult() {
    // Validate form
    const labForm = document.getElementById('labForm');
    if (!validateForm(labForm)) {
        return;
    }
    
    // Create lab result data
    const labData = {
        patient_id: parseInt(document.getElementById('historyPatientId').value),
        date: document.getElementById('labDate').value,
        test_name: document.getElementById('testName').value,
        result: document.getElementById('testResult').value,
        reference_range: document.getElementById('referenceRange').value || null,
        status: document.getElementById('resultStatus').value,
        notes: document.getElementById('labNotes').value || null
    };
    
    // Add to the list (in a real app, this would be sent to the server)
    labResults.push(labData);
    
    // Update the table
    updateLabTable(labResults);
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addLabModal'));
    modal.hide();
    
    // Show success message
    showAlert('Laboratory result added successfully!', 'success');
    
    // Reset form
    labForm.reset();
}
