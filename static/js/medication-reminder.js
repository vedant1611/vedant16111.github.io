/**
 * Medication Reminder JavaScript
 * Handles setting up and managing post-transplant medication schedules
 */

// Initialize variables
let currentPatient = null;
let patientMedications = [];

// DOM elements
const findPatientForMedicationBtn = document.getElementById('findPatientForMedicationBtn');
const medicationPatientInfo = document.getElementById('medicationPatientInfo');
const medicationSection = document.getElementById('medicationSection');
const medicationsTable = document.getElementById('medicationsTable');
const addMedicationForm = document.getElementById('addMedicationForm');
const drugInfoSearch = document.getElementById('drugInfoSearch');
const drugInfoContainer = document.getElementById('drugInfoContainer');
const saveReminderSettingsBtn = document.getElementById('saveReminderSettingsBtn');

// Common medications information for demo
const medicationInfo = {
    'tacrolimus': {
        name: 'Tacrolimus (Prograf)',
        description: 'A calcineurin inhibitor immunosuppressant used to prevent organ rejection in transplant recipients.',
        dosage: 'Initially 0.1-0.2 mg/kg/day in 2 divided doses, adjusted based on blood levels.',
        sideEffects: 'Nephrotoxicity, tremor, headache, hypertension, hyperglycemia, increased risk of infections.',
        monitoring: 'Blood levels, renal function, blood pressure, blood glucose.',
        interactions: 'Interacts with many medications including azole antifungals, macrolide antibiotics, calcium channel blockers.'
    },
    'cyclosporine': {
        name: 'Cyclosporine (Neoral, Sandimmune)',
        description: 'A calcineurin inhibitor immunosuppressant that prevents T-cell activation and proliferation.',
        dosage: 'Initially 10-15 mg/kg/day in 2 divided doses, adjusted based on blood levels.',
        sideEffects: 'Nephrotoxicity, hypertension, hirsutism, gingival hyperplasia, tremor, hyperlipidemia.',
        monitoring: 'Blood levels, renal function, blood pressure, lipid profile.',
        interactions: 'Interacts with many medications including azole antifungals, macrolide antibiotics, grapefruit juice.'
    },
    'mycophenolate': {
        name: 'Mycophenolate Mofetil (CellCept)',
        description: 'An antiproliferative agent that inhibits purine synthesis, preventing T and B lymphocyte proliferation.',
        dosage: 'Typically 1-1.5g twice daily.',
        sideEffects: 'Gastrointestinal effects (diarrhea, nausea, vomiting), leukopenia, increased risk of infections.',
        monitoring: 'Complete blood count, liver function tests.',
        interactions: 'Antacids, cholestyramine, oral contraceptives.'
    },
    'prednisone': {
        name: 'Prednisone',
        description: 'A corticosteroid with potent anti-inflammatory and immunosuppressive properties.',
        dosage: 'Initially high dose (0.5-2 mg/kg/day), gradually tapered to maintenance dose.',
        sideEffects: 'Weight gain, mood changes, insomnia, hypertension, hyperglycemia, osteoporosis, cataracts.',
        monitoring: 'Blood pressure, blood glucose, bone density, ophthalmologic examination.',
        interactions: 'NSAIDs, antidiabetic agents, anticoagulants.'
    },
    'azathioprine': {
        name: 'Azathioprine (Imuran)',
        description: 'An antimetabolite that interferes with DNA synthesis and inhibits rapidly dividing cells.',
        dosage: 'Typically 1-3 mg/kg/day.',
        sideEffects: 'Myelosuppression, increased risk of infections, hepatotoxicity, increased risk of malignancies.',
        monitoring: 'Complete blood count, liver function tests.',
        interactions: 'Allopurinol, ACE inhibitors.'
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    if (findPatientForMedicationBtn) {
        findPatientForMedicationBtn.addEventListener('click', findPatientForMedication);
    }
    
    if (addMedicationForm) {
        addMedicationForm.addEventListener('submit', addMedication);
    }
    
    if (drugInfoSearch) {
        drugInfoSearch.addEventListener('input', searchMedicationInfo);
    }
    
    if (saveReminderSettingsBtn) {
        saveReminderSettingsBtn.addEventListener('click', saveReminderSettings);
    }
    
    // Check for patient ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        document.getElementById('patientSearchType').value = 'id';
        document.getElementById('patientSearchValue').value = urlParams.get('id');
        findPatientForMedication();
    }
});

/**
 * Find patient for medication management
 */
async function findPatientForMedication() {
    const searchType = document.getElementById('patientSearchType').value;
    const searchValue = document.getElementById('patientSearchValue').value.trim();
    
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
            medicationPatientInfo.innerHTML = `
                <div class="card-title border-bottom pb-2">
                    <span class="badge bg-info float-end">${patient.status}</span>
                    <h5 class="mb-0">${patient.name}</h5>
                </div>
                <p><strong>ID:</strong> ${patient.id}</p>
                <p><strong>Age/Gender:</strong> ${patient.age} years / ${patient.gender}</p>
                <p><strong>Blood Type:</strong> ${patient.blood_type}</p>
                <p><strong>Contact:</strong> ${patient.phone}</p>
                ${patient.transplant_type ? 
                    `<p><strong>Transplant Type:</strong> ${patient.transplant_type}</p>` : ''}
            `;
            
            // Show medication section
            medicationSection.classList.remove('d-none');
            
            // Set patient ID in the form
            document.getElementById('medicationPatientId').value = patient.id;
            
            // Fetch medications
            await fetchMedications(patient.id);
            
            // Scroll to medication section
            medicationSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            medicationPatientInfo.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No patient found with the provided ${searchType}.
                </div>
            `;
            
            // Hide medication section
            medicationSection.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error finding patient:', error);
        medicationPatientInfo.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                An error occurred while searching for the patient.
            </div>
        `;
        medicationSection.classList.add('d-none');
    }
}

/**
 * Fetch medications for a patient
 * @param {number} patientId - The ID of the patient
 */
async function fetchMedications(patientId) {
    try {
        const response = await fetch(`/get-medications/${patientId}`);
        const data = await response.json();
        
        if (data.success) {
            patientMedications = data.medications || [];
            updateMedicationsTable();
        } else {
            showAlert('Failed to fetch medications: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error fetching medications:', error);
        showAlert('An error occurred while fetching medications', 'danger');
        patientMedications = [];
        updateMedicationsTable();
    }
}

/**
 * Update the medications table with the latest data
 */
function updateMedicationsTable() {
    // Clear existing rows
    const tbody = medicationsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add medication rows
    if (patientMedications.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">No medications prescribed for this patient</td>';
        tbody.appendChild(emptyRow);
    } else {
        patientMedications.forEach(medication => {
            const row = document.createElement('tr');
            
            // Determine status
            let status = 'Active';
            let statusClass = 'success';
            
            if (medication.end_date) {
                const endDate = new Date(medication.end_date);
                if (endDate < new Date()) {
                    status = 'Completed';
                    statusClass = 'secondary';
                }
            }
            
            row.innerHTML = `
                <td>${medication.name}</td>
                <td>${medication.dosage}</td>
                <td>${medication.frequency}</td>
                <td>${formatDate(medication.start_date)}</td>
                <td>${medication.end_date ? formatDate(medication.end_date) : 'Ongoing'}</td>
                <td><span class="badge bg-${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-info view-medication" data-id="${medication.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add event listener to view button
            row.querySelector('.view-medication').addEventListener('click', () => {
                viewMedicationDetails(medication.id);
            });
        });
    }
}

/**
 * Add a new medication for the patient
 * @param {Event} event - The form submission event
 */
async function addMedication(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm(addMedicationForm)) {
        return;
    }
    
    // Create medication data
    const medicationData = {
        patient_id: parseInt(document.getElementById('medicationPatientId').value),
        name: document.getElementById('medicationName').value,
        dosage: document.getElementById('medicationDosage').value,
        frequency: document.getElementById('medicationFrequency').value,
        route: document.getElementById('medicationRoute').value || null,
        start_date: document.getElementById('medicationStartDate').value,
        end_date: document.getElementById('medicationEndDate').value || null,
        notes: document.getElementById('medicationNotes').value || null,
        set_reminder: document.getElementById('setReminder').checked
    };
    
    try {
        // Send data to the server
        const response = await fetch('/add-medication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicationData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showAlert('Medication added successfully!', 'success');
            
            // Reset form
            addMedicationForm.reset();
            
            // Refresh medications
            await fetchMedications(medicationData.patient_id);
        } else {
            showAlert('Failed to add medication: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error adding medication:', error);
        showAlert('An error occurred while adding the medication', 'danger');
    }
}

/**
 * View medication details in a modal
 * @param {number} medicationId - The ID of the medication to view
 */
function viewMedicationDetails(medicationId) {
    // Find the medication in the array
    const medication = patientMedications.find(med => med.id === medicationId);
    
    if (!medication) {
        showAlert('Medication not found', 'danger');
        return;
    }
    
    // Populate modal fields
    document.getElementById('medDetailName').textContent = medication.name;
    document.getElementById('medDetailDosage').textContent = medication.dosage;
    document.getElementById('medDetailFrequency').textContent = medication.frequency;
    document.getElementById('medDetailRoute').textContent = medication.route || 'Not specified';
    
    // Format duration
    let duration = `From ${formatDate(medication.start_date)}`;
    if (medication.end_date) {
        duration += ` to ${formatDate(medication.end_date)}`;
    } else {
        duration += ' (Ongoing)';
    }
    document.getElementById('medDetailDuration').textContent = duration;
    
    document.getElementById('medDetailNotes').textContent = medication.notes || 'None';
    
    // Reminder settings (mock for demo)
    document.getElementById('medDetailSmsReminder').checked = true;
    document.getElementById('medDetailWhatsappReminder').checked = false;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('medicationDetailsModal'));
    modal.show();
    
    // Set up edit button
    document.getElementById('editMedicationBtn').addEventListener('click', () => {
        editMedication(medication);
    });
    
    // Set up delete button
    document.getElementById('deleteMedicationBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this medication?')) {
            deleteMedication(medication.id);
        }
    });
}

/**
 * Edit a medication
 * @param {Object} medication - The medication object to edit
 */
function editMedication(medication) {
    // Close the details modal
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('medicationDetailsModal'));
    detailsModal.hide();
    
    // Populate the form with medication data
    document.getElementById('medicationName').value = medication.name;
    document.getElementById('medicationDosage').value = medication.dosage;
    document.getElementById('medicationFrequency').value = medication.frequency;
    document.getElementById('medicationRoute').value = medication.route || '';
    document.getElementById('medicationStartDate').value = medication.start_date;
    document.getElementById('medicationEndDate').value = medication.end_date || '';
    document.getElementById('medicationNotes').value = medication.notes || '';
    document.getElementById('setReminder').checked = true;
    
    // Scroll to form
    addMedicationForm.scrollIntoView({ behavior: 'smooth' });
    
    // Focus on first field
    document.getElementById('medicationName').focus();
}

/**
 * Delete a medication
 * @param {number} medicationId - The ID of the medication to delete
 */
async function deleteMedication(medicationId) {
    try {
        // In a real app, this would call an API endpoint to delete the medication
        // For this demo, we'll just remove it from the array
        
        // Filter out the deleted medication
        patientMedications = patientMedications.filter(med => med.id !== medicationId);
        
        // Update the table
        updateMedicationsTable();
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('medicationDetailsModal'));
        modal.hide();
        
        // Show success message
        showAlert('Medication deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting medication:', error);
        showAlert('An error occurred while deleting the medication', 'danger');
    }
}

/**
 * Search for medication information
 */
function searchMedicationInfo() {
    const searchTerm = drugInfoSearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
        drugInfoContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-pills fa-3x text-muted mb-3"></i>
                <p class="text-muted">Search for a medication to view information</p>
            </div>
        `;
        return;
    }
    
    // Search for medication in the info object
    let foundMedication = null;
    
    for (const [key, med] of Object.entries(medicationInfo)) {
        if (key.includes(searchTerm) || med.name.toLowerCase().includes(searchTerm)) {
            foundMedication = med;
            break;
        }
    }
    
    if (foundMedication) {
        drugInfoContainer.innerHTML = `
            <h5 class="card-title">${foundMedication.name}</h5>
            <p><strong>Description:</strong> ${foundMedication.description}</p>
            <p><strong>Typical Dosage:</strong> ${foundMedication.dosage}</p>
            <hr>
            <p><strong>Side Effects:</strong> ${foundMedication.sideEffects}</p>
            <p><strong>Monitoring Required:</strong> ${foundMedication.monitoring}</p>
            <p><strong>Drug Interactions:</strong> ${foundMedication.interactions}</p>
            <div class="mt-3">
                <a href="/drug-checklist?medication=${encodeURIComponent(foundMedication.name)}" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-search-dollar me-1"></i> Find Alternatives
                </a>
            </div>
        `;
    } else {
        drugInfoContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No information found for "${searchTerm}". Try another medication name.
            </div>
        `;
    }
}

/**
 * Save reminder settings
 */
function saveReminderSettings() {
    const smsReminder = document.getElementById('smsReminder').checked;
    const whatsappReminder = document.getElementById('whatsappReminder').checked;
    const reminderFrequency = document.getElementById('reminderFrequency').value;
    const caregiverContact = document.getElementById('caregiverContact').value;
    
    // In a real app, this would send the settings to the server
    // For this demo, we'll just show a success message
    
    showAlert('Reminder settings saved successfully!', 'success');
}
