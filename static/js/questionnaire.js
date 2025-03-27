/**
 * Questionnaire JavaScript
 * Handles patient questionnaires for post-transplant monitoring and adverse drug reaction reporting
 */

// Initialize variables
let currentPatient = null;
let responseHistory = [];
let currentQuestions = {};

// Questionnaire templates organized by transplant type
const questionnaireTemplates = {
    'Kidney': [
        { id: 'fever', text: 'Have you experienced fever above 100.5°F (38°C)?', severity: 3 },
        { id: 'pain', text: 'Are you experiencing pain or tenderness over the transplant site?', severity: 4 },
        { id: 'swelling', text: 'Have you noticed swelling in your legs, ankles, or around your eyes?', severity: 2 },
        { id: 'urination', text: 'Have you noticed any changes in your urination (frequency, color, or amount)?', severity: 4 },
        { id: 'weight', text: 'Have you gained more than 2 kg (4.4 lbs) in 24 hours?', severity: 3 },
        { id: 'bp', text: 'Has your blood pressure been consistently high in home measurements?', severity: 3 },
        { id: 'fatigue', text: 'Are you experiencing unusual fatigue or weakness?', severity: 2 },
        { id: 'appetite', text: 'Have you noticed a decrease in appetite?', severity: 1 },
        { id: 'breathlessness', text: 'Are you experiencing shortness of breath or difficulty breathing?', severity: 4 },
        { id: 'medication', text: 'Have you missed any doses of your immunosuppressant medications?', severity: 5 }
    ],
    'Liver': [
        { id: 'fever', text: 'Have you experienced fever above 100.5°F (38°C)?', severity: 3 },
        { id: 'pain', text: 'Are you experiencing pain in your upper right abdomen?', severity: 4 },
        { id: 'jaundice', text: 'Have you noticed yellowing of your skin or eyes?', severity: 5 },
        { id: 'itching', text: 'Are you experiencing unusual itching all over your body?', severity: 2 },
        { id: 'urine', text: 'Have you noticed dark urine or light-colored stools?', severity: 4 },
        { id: 'swelling', text: 'Have you noticed swelling in your abdomen or legs?', severity: 3 },
        { id: 'confusion', text: 'Have you experienced any confusion or disorientation?', severity: 5 },
        { id: 'appetite', text: 'Have you noticed a decrease in appetite or nausea?', severity: 2 },
        { id: 'bleeding', text: 'Have you experienced any unusual bleeding or bruising?', severity: 4 },
        { id: 'medication', text: 'Have you missed any doses of your immunosuppressant medications?', severity: 5 }
    ],
    'Heart': [
        { id: 'chest_pain', text: 'Have you experienced chest pain or pressure?', severity: 5 },
        { id: 'palpitations', text: 'Have you noticed your heart racing, skipping beats, or palpitations?', severity: 4 },
        { id: 'shortness', text: 'Are you experiencing shortness of breath during activity or while resting?', severity: 4 },
        { id: 'swelling', text: 'Have you noticed swelling in your legs, ankles, or abdomen?', severity: 3 },
        { id: 'dizziness', text: 'Have you felt dizzy, lightheaded, or have you fainted?', severity: 4 },
        { id: 'fatigue', text: 'Are you experiencing unusual fatigue or weakness?', severity: 3 },
        { id: 'sleeping', text: 'Do you need to use more pillows than usual to sleep comfortably?', severity: 2 },
        { id: 'cough', text: 'Have you developed a new or worsening cough?', severity: 3 },
        { id: 'weight', text: 'Have you gained more than 2 kg (4.4 lbs) in 24 hours?', severity: 3 },
        { id: 'medication', text: 'Have you missed any doses of your immunosuppressant medications?', severity: 5 }
    ],
    'Lung': [
        { id: 'shortness', text: 'Are you experiencing shortness of breath or difficulty breathing?', severity: 5 },
        { id: 'cough', text: 'Have you developed a new or worsening cough?', severity: 4 },
        { id: 'sputum', text: 'Are you coughing up colored sputum (yellow, green, or brown)?', severity: 4 },
        { id: 'wheezing', text: 'Have you noticed wheezing or chest tightness?', severity: 3 },
        { id: 'chest_pain', text: 'Are you experiencing chest pain, especially when breathing deeply?', severity: 4 },
        { id: 'fever', text: 'Have you experienced fever above 100.5°F (38°C)?', severity: 3 },
        { id: 'fatigue', text: 'Are you experiencing unusual fatigue or weakness?', severity: 2 },
        { id: 'spirometry', text: 'Have your home spirometry readings decreased by more than 10%?', severity: 4 },
        { id: 'exercise', text: 'Has your exercise tolerance decreased?', severity: 3 },
        { id: 'medication', text: 'Have you missed any doses of your immunosuppressant medications?', severity: 5 }
    ],
    'Pancreas': [
        { id: 'blood_sugar', text: 'Have you noticed unusual fluctuations in your blood sugar levels?', severity: 4 },
        { id: 'pain', text: 'Are you experiencing pain in your abdomen?', severity: 4 },
        { id: 'nausea', text: 'Have you experienced nausea, vomiting, or decreased appetite?', severity: 3 },
        { id: 'fever', text: 'Have you experienced fever above 100.5°F (38°C)?', severity: 3 },
        { id: 'swelling', text: 'Have you noticed swelling, redness, or tenderness at the transplant site?', severity: 4 },
        { id: 'urination', text: 'Have you noticed any changes in your urination (frequency, color, or amount)?', severity: 3 },
        { id: 'insulin', text: 'Have you needed to resume or increase insulin use?', severity: 4 },
        { id: 'thirst', text: 'Are you experiencing increased thirst or dry mouth?', severity: 2 },
        { id: 'fatigue', text: 'Are you experiencing unusual fatigue or weakness?', severity: 2 },
        { id: 'medication', text: 'Have you missed any doses of your immunosuppressant medications?', severity: 5 }
    ],
    'Multiple Organs': [
        { id: 'fever', text: 'Have you experienced fever above 100.5°F (38°C)?', severity: 3 },
        { id: 'pain', text: 'Are you experiencing pain at any of your transplant sites?', severity: 4 },
        { id: 'swelling', text: 'Have you noticed swelling in your legs, ankles, or around your eyes?', severity: 3 },
        { id: 'breathing', text: 'Are you experiencing shortness of breath or difficulty breathing?', severity: 5 },
        { id: 'urination', text: 'Have you noticed any changes in your urination (frequency, color, or amount)?', severity: 4 },
        { id: 'appetite', text: 'Have you noticed a decrease in appetite or nausea?', severity: 2 },
        { id: 'fatigue', text: 'Are you experiencing unusual fatigue or weakness?', severity: 3 },
        { id: 'weight', text: 'Have you gained more than 2 kg (4.4 lbs) in 24 hours?', severity: 3 },
        { id: 'confusion', text: 'Have you experienced any confusion or disorientation?', severity: 5 },
        { id: 'medication', text: 'Have you missed any doses of your immunosuppressant medications?', severity: 5 }
    ]
};

// DOM elements for questionnaire
const findPatientForQuestionnaireBtn = document.getElementById('findPatientForQuestionnaireBtn');
const questionnairePatientInfo = document.getElementById('questionnairePatientInfo');
const questionnaireSection = document.getElementById('questionnaireSection');
const transplantType = document.getElementById('transplantType');
const questionsList = document.getElementById('questionsList');
const questionnaireForm = document.getElementById('questionnaireForm');
const responsesTable = document.getElementById('responsesTable');
const severityCard = document.getElementById('severityCard');
const severityScore = document.getElementById('severityScore');
const severityProgressBar = document.getElementById('severityProgressBar');
const severityMessage = document.getElementById('severityMessage');

// DOM elements for ADR
const findPatientForAdrBtn = document.getElementById('findPatientForAdrBtn');
const adrPatientInfo = document.getElementById('adrPatientInfo');
const adrReportingSection = document.getElementById('adrReportingSection');
const adrReportForm = document.getElementById('adrReportForm');
const adrTable = document.getElementById('adrTable');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up questionnaire event listeners
    if (findPatientForQuestionnaireBtn) {
        findPatientForQuestionnaireBtn.addEventListener('click', findPatientForQuestionnaire);
    }
    
    if (transplantType) {
        transplantType.addEventListener('change', loadQuestionnaire);
    }
    
    if (questionnaireForm) {
        questionnaireForm.addEventListener('submit', submitQuestionnaire);
        
        // Add change event listener to update severity score
        questionnaireForm.addEventListener('change', updateSeverityScore);
    }
    
    // Set up ADR event listeners
    if (findPatientForAdrBtn) {
        findPatientForAdrBtn.addEventListener('click', findPatientForAdr);
    }
    
    if (adrReportForm) {
        adrReportForm.addEventListener('submit', submitAdrReport);
    }
    
    // Check for patient ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
        // For questionnaire page
        if (document.getElementById('questionnairePatientSearch')) {
            document.getElementById('questionnairePatientSearch').value = 'id';
            document.getElementById('questionnaireSearchValue').value = urlParams.get('id');
            findPatientForQuestionnaire();
        }
        
        // For ADR page
        if (document.getElementById('adrPatientSearch')) {
            document.getElementById('adrPatientSearch').value = 'id';
            document.getElementById('adrSearchValue').value = urlParams.get('id');
            findPatientForAdr();
        }
    }
});

/**
 * Find patient for questionnaire
 */
async function findPatientForQuestionnaire() {
    const searchType = document.getElementById('questionnairePatientSearch').value;
    const searchValue = document.getElementById('questionnaireSearchValue').value.trim();
    
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
            questionnairePatientInfo.innerHTML = `
                <div class="card-title border-bottom pb-2">
                    <span class="badge bg-info float-end">${patient.status}</span>
                    <h5 class="mb-0">${patient.name}</h5>
                </div>
                <p><strong>ID:</strong> ${patient.id}</p>
                <p><strong>Age/Gender:</strong> ${patient.age} years / ${patient.gender}</p>
                ${patient.transplant_type ? 
                    `<p><strong>Transplant Type:</strong> ${patient.transplant_type}</p>` : 
                    '<p class="text-warning"><strong>Warning:</strong> No transplant type specified</p>'}
                <p><strong>Contact:</strong> ${patient.phone}</p>
            `;
            
            // Show questionnaire section
            questionnaireSection.classList.remove('d-none');
            
            // Set patient ID in the form
            document.getElementById('questionnairePatientId').value = patient.id;
            
            // Set transplant type if available
            if (patient.transplant_type && transplantType.querySelector(`option[value="${patient.transplant_type}"]`)) {
                transplantType.value = patient.transplant_type;
                loadQuestionnaire();
            }
            
            // Fetch previous responses
            fetchQuestionnaireResponses(patient.id);
            
            // Scroll to questionnaire section
            questionnaireSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            questionnairePatientInfo.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No patient found with the provided ${searchType}.
                </div>
            `;
            
            // Hide questionnaire section
            questionnaireSection.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error finding patient:', error);
        questionnairePatientInfo.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                An error occurred while searching for the patient.
            </div>
        `;
        questionnaireSection.classList.add('d-none');
    }
}

/**
 * Load questionnaire based on transplant type
 */
function loadQuestionnaire() {
    const selectedType = transplantType.value;
    
    if (!selectedType) {
        questionsList.innerHTML = `
            <p class="text-center text-muted py-3">Please select a transplant type to load the questionnaire</p>
        `;
        severityCard.classList.add('d-none');
        return;
    }
    
    // Get questions for the selected transplant type
    const questions = questionnaireTemplates[selectedType] || [];
    currentQuestions = {};
    
    // Generate question HTML
    if (questions.length === 0) {
        questionsList.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No questions available for ${selectedType} transplant.
            </div>
        `;
    } else {
        let questionsHtml = '<div class="mb-3">';
        
        questions.forEach((question, index) => {
            currentQuestions[question.id] = question;
            
            questionsHtml += `
                <div class="card mb-3">
                    <div class="card-body">
                        <p class="mb-2"><strong>Q${index + 1}:</strong> ${question.text}</p>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="${question.id}" id="${question.id}_no" value="no" checked>
                            <label class="form-check-label" for="${question.id}_no">No</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="${question.id}" id="${question.id}_yes" value="yes">
                            <label class="form-check-label" for="${question.id}_yes">Yes</label>
                        </div>
                    </div>
                </div>
            `;
        });
        
        questionsHtml += '</div>';
        questionsList.innerHTML = questionsHtml;
        
        // Show severity card
        severityCard.classList.remove('d-none');
        
        // Initialize severity score
        updateSeverityScore();
    }
}

/**
 * Update severity score based on current answers
 */
function updateSeverityScore() {
    // Only proceed if we have questions and a visible severity card
    if (Object.keys(currentQuestions).length === 0 || severityCard.classList.contains('d-none')) {
        return;
    }
    
    let score = 0;
    let maxScore = 0;
    
    // Calculate score based on "yes" answers
    for (const [id, question] of Object.entries(currentQuestions)) {
        const yesRadio = document.getElementById(`${id}_yes`);
        
        if (yesRadio && yesRadio.checked) {
            score += question.severity;
        }
        
        maxScore += question.severity;
    }
    
    // Normalize score to 0-10 scale
    const normalizedScore = maxScore > 0 ? Math.round((score / maxScore) * 10) : 0;
    
    // Update display
    severityScore.textContent = normalizedScore;
    
    // Update progress bar
    severityProgressBar.style.width = `${normalizedScore * 10}%`;
    
    // Set appropriate color
    if (normalizedScore >= 7) {
        severityProgressBar.classList.remove('bg-success', 'bg-warning');
        severityProgressBar.classList.add('bg-danger');
        severityMessage.textContent = 'Critical: Immediate attention required';
        severityMessage.className = 'mt-2 small text-danger';
    } else if (normalizedScore >= 4) {
        severityProgressBar.classList.remove('bg-success', 'bg-danger');
        severityProgressBar.classList.add('bg-warning');
        severityMessage.textContent = 'Moderate concern: Follow-up recommended';
        severityMessage.className = 'mt-2 small text-warning';
    } else {
        severityProgressBar.classList.remove('bg-warning', 'bg-danger');
        severityProgressBar.classList.add('bg-success');
        severityMessage.textContent = 'Mild or no concerns detected';
        severityMessage.className = 'mt-2 small text-success';
    }
}

/**
 * Submit questionnaire
 * @param {Event} event - The form submission event
 */
async function submitQuestionnaire(event) {
    event.preventDefault();
    
    const patientId = document.getElementById('questionnairePatientId').value;
    const selectedType = document.getElementById('transplantType').value;
    
    if (!selectedType) {
        showAlert('Please select a transplant type', 'warning');
        return;
    }
    
    // Collect responses
    const responses = {};
    for (const id in currentQuestions) {
        const yesRadio = document.getElementById(`${id}_yes`);
        responses[id] = yesRadio && yesRadio.checked ? 'yes' : 'no';
    }
    
    // Get additional notes
    const additionalNotes = document.getElementById('additionalNotes').value;
    
    // Get severity score
    const score = parseInt(severityScore.textContent);
    
    // Create questionnaire data
    const questionnaireData = {
        patient_id: parseInt(patientId),
        transplant_type: selectedType,
        responses: responses,
        additional_notes: additionalNotes,
        severity_score: score
    };
    
    try {
        // Send data to the server
        const response = await fetch('/submit-questionnaire', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionnaireData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showAlert('Questionnaire submitted successfully!', 'success');
            
            // Reset form (but keep patient and transplant type)
            const formElements = questionnaireForm.elements;
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                if (element.type === 'radio' && element.id.endsWith('_no')) {
                    element.checked = true;
                } else if (element.type === 'textarea') {
                    element.value = '';
                }
            }
            
            // Reset severity score
            updateSeverityScore();
            
            // Fetch updated responses
            fetchQuestionnaireResponses(patientId);
            
            // Show alert if severity score is high
            if (score >= 7) {
                showAlert('Critical severity detected! Doctor notification sent.', 'danger', 0);
            } else if (score >= 4) {
                showAlert('Moderate severity detected. Follow-up recommended.', 'warning', 10000);
            }
        } else {
            showAlert('Failed to submit questionnaire: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error submitting questionnaire:', error);
        showAlert('An error occurred while submitting the questionnaire', 'danger');
    }
}

/**
 * Fetch questionnaire responses for a patient
 * @param {number} patientId - The ID of the patient
 */
async function fetchQuestionnaireResponses(patientId) {
    try {
        // In a real app, this would make an API call to fetch the responses
        // For this demo, we'll use mock data
        
        // Mock responses
        responseHistory = [
            {
                date: new Date().toISOString(),
                transplant_type: 'Kidney',
                severity_score: 3,
                responses: {
                    fever: 'no',
                    pain: 'no',
                    swelling: 'yes',
                    urination: 'no',
                    weight: 'no',
                    bp: 'yes',
                    fatigue: 'no',
                    appetite: 'no',
                    breathlessness: 'no',
                    medication: 'no'
                },
                additional_notes: 'Patient reports slight ankle swelling in the evening'
            }
        ];
        
        // Update responses table
        updateResponsesTable();
    } catch (error) {
        console.error('Error fetching questionnaire responses:', error);
        showAlert('An error occurred while fetching questionnaire responses', 'danger');
    }
}

/**
 * Update the responses table with the latest data
 */
function updateResponsesTable() {
    // Only proceed if the table exists
    if (!responsesTable) return;
    
    // Clear existing rows
    const tbody = responsesTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add response rows
    if (responseHistory.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="text-center">No questionnaire responses available</td>';
        tbody.appendChild(emptyRow);
    } else {
        responseHistory.forEach((response, index) => {
            const row = document.createElement('tr');
            
            // Determine severity class
            let severityClass = '';
            let severityBadge = '';
            if (response.severity_score >= 7) {
                severityClass = 'table-danger';
                severityBadge = 'bg-danger';
            } else if (response.severity_score >= 4) {
                severityClass = 'table-warning';
                severityBadge = 'bg-warning';
            } else {
                severityClass = '';
                severityBadge = 'bg-success';
            }
            
            row.className = severityClass;
            row.innerHTML = `
                <td>${formatDateTime(response.date)}</td>
                <td>${response.transplant_type}</td>
                <td><span class="badge ${severityBadge}">${response.severity_score}/10</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-info view-response" data-index="${index}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add event listener to view button
            row.querySelector('.view-response').addEventListener('click', () => {
                viewResponseDetails(index);
            });
        });
    }
}

/**
 * View response details in a modal
 * @param {number} index - The index of the response in the responseHistory array
 */
function viewResponseDetails(index) {
    const response = responseHistory[index];
    
    if (!response) {
        showAlert('Response not found', 'danger');
        return;
    }
    
    // Populate modal fields
    document.getElementById('responseDate').textContent = formatDateTime(response.date);
    document.getElementById('responseTransplantType').textContent = response.transplant_type;
    document.getElementById('responseSeverityScore').textContent = `${response.severity_score}/10`;
    
    // Set severity alert color
    const severityAlert = document.getElementById('responseSeverityAlert');
    const severityMessage = document.getElementById('responseSeverityMessage');
    
    if (response.severity_score >= 7) {
        severityAlert.className = 'alert alert-danger';
        severityMessage.textContent = 'Critical: Immediate attention required';
    } else if (response.severity_score >= 4) {
        severityAlert.className = 'alert alert-warning';
        severityMessage.textContent = 'Moderate concern: Follow-up recommended';
    } else {
        severityAlert.className = 'alert alert-success';
        severityMessage.textContent = 'Mild or no concerns detected';
    }
    
    // Populate responses
    const answersContainer = document.getElementById('responseAnswers');
    const questions = questionnaireTemplates[response.transplant_type] || [];
    
    if (questions.length === 0) {
        answersContainer.innerHTML = '<p class="text-muted">No questions available for this transplant type</p>';
    } else {
        let answersHtml = '';
        
        questions.forEach((question, qIndex) => {
            const answer = response.responses[question.id] === 'yes';
            const answerClass = answer ? 'text-danger' : 'text-success';
            const answerIcon = answer ? 
                '<i class="fas fa-exclamation-circle text-danger"></i>' : 
                '<i class="fas fa-check-circle text-success"></i>';
            
            answersHtml += `
                <div class="mb-2 pb-2 border-bottom">
                    <p class="mb-1"><strong>Q${qIndex + 1}:</strong> ${question.text}</p>
                    <p class="mb-0 ${answerClass}">${answerIcon} ${answer ? 'Yes' : 'No'}</p>
                </div>
            `;
        });
        
        answersContainer.innerHTML = answersHtml;
    }
    
    // Set additional notes
    document.getElementById('responseNotes').textContent = response.additional_notes || 'No additional notes provided';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('responseDetailsModal'));
    modal.show();
}

/**
 * Find patient for adverse drug reaction reporting
 */
async function findPatientForAdr() {
    if (!document.getElementById('adrPatientSearch')) return;
    
    const searchType = document.getElementById('adrPatientSearch').value;
    const searchValue = document.getElementById('adrSearchValue').value.trim();
    
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
            adrPatientInfo.innerHTML = `
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
            
            // Show ADR reporting section
            adrReportingSection.classList.remove('d-none');
            
            // Set patient ID in the form
            document.getElementById('adrPatientId').value = patient.id;
            
            // Populate medication dropdown
            populateMedicationDropdown(patient.id);
            
            // Fetch previous ADR reports
            fetchAdrReports(patient.id);
            
            // Scroll to ADR section
            adrReportingSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            adrPatientInfo.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No patient found with the provided ${searchType}.
                </div>
            `;
            
            // Hide ADR section
            adrReportingSection.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error finding patient:', error);
        adrPatientInfo.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                An error occurred while searching for the patient.
            </div>
        `;
        adrReportingSection.classList.add('d-none');
    }
}

/**
 * Populate medication dropdown for ADR reporting
 * @param {number} patientId - The ID of the patient
 */
async function populateMedicationDropdown(patientId) {
    const adrMedicationSelect = document.getElementById('adrMedication');
    
    if (!adrMedicationSelect) return;
    
    try {
        // In a real app, this would fetch patient's medications from the server
        // For this demo, we'll use mock data
        
        // Mock medications
        const mockMedications = [
            { name: 'Tacrolimus (Prograf)' },
            { name: 'Mycophenolate Mofetil (CellCept)' },
            { name: 'Prednisone' },
            { name: 'Valganciclovir' },
            { name: 'Trimethoprim-Sulfamethoxazole' }
        ];
        
        // Clear existing options (except the first one)
        while (adrMedicationSelect.options.length > 1) {
            adrMedicationSelect.remove(1);
        }
        
        // Add medication options
        mockMedications.forEach(med => {
            const option = document.createElement('option');
            option.value = med.name;
            option.textContent = med.name;
            adrMedicationSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating medication dropdown:', error);
        showAlert('An error occurred while loading medications', 'danger');
    }
}

/**
 * Fetch adverse drug reaction reports for a patient
 * @param {number} patientId - The ID of the patient
 */
async function fetchAdrReports(patientId) {
    if (!adrTable) return;
    
    try {
        // In a real app, this would make an API call to fetch the ADR reports
        // For this demo, we'll use mock data
        
        // Mock ADR reports
        const mockReports = [
            {
                date: new Date().toISOString(),
                medication: 'Tacrolimus (Prograf)',
                symptoms: 'Tremors in hands, headache, elevated blood pressure',
                severity: 'Moderate',
                outcome: 'Dose reduced'
            }
        ];
        
        // Update ADR table
        updateAdrTable(mockReports);
    } catch (error) {
        console.error('Error fetching ADR reports:', error);
        showAlert('An error occurred while fetching adverse reaction reports', 'danger');
    }
}

/**
 * Update the ADR table with the latest data
 * @param {Array} reports - Array of ADR report objects
 */
function updateAdrTable(reports) {
    if (!adrTable) return;
    
    // Clear existing rows
    const tbody = adrTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Add report rows
    if (reports.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="text-center">No adverse reaction reports available</td>';
        tbody.appendChild(emptyRow);
    } else {
        reports.forEach((report, index) => {
            const row = document.createElement('tr');
            
            // Determine severity class
            let severityClass = '';
            switch (report.severity) {
                case 'Mild':
                    severityClass = 'text-success';
                    break;
                case 'Moderate':
                    severityClass = 'text-warning';
                    break;
                case 'Severe':
                case 'Life-threatening':
                case 'Fatal':
                    severityClass = 'text-danger';
                    break;
                default:
                    severityClass = '';
            }
            
            row.innerHTML = `
                <td>${formatDateTime(report.date)}</td>
                <td>${report.medication}</td>
                <td>${report.symptoms.length > 50 ? report.symptoms.substring(0, 50) + '...' : report.symptoms}</td>
                <td class="${severityClass}">${report.severity}</td>
                <td>${report.outcome || 'Unknown'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info view-adr" data-index="${index}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add event listener to view button
            row.querySelector('.view-adr').addEventListener('click', () => {
                viewAdrDetails(report);
            });
        });
    }
}

/**
 * View ADR details in a modal
 * @param {Object} report - The ADR report object
 */
function viewAdrDetails(report) {
    // Populate modal fields
    document.getElementById('detailPatientName').textContent = currentPatient ? currentPatient.name : 'Unknown';
    document.getElementById('detailMedication').textContent = report.medication;
    document.getElementById('detailOnsetDate').textContent = formatDate(report.onset_date || report.date);
    document.getElementById('detailReportDate').textContent = formatDateTime(report.date);
    document.getElementById('detailSeverity').textContent = report.severity;
    document.getElementById('detailOutcome').textContent = report.outcome || 'Unknown';
    document.getElementById('detailAction').textContent = report.action || 'Unknown';
    document.getElementById('detailSerious').textContent = report.serious ? 'Yes' : 'No';
    document.getElementById('detailSymptoms').textContent = report.symptoms;
    document.getElementById('detailNotes').textContent = report.notes || 'None';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adrDetailsModal'));
    modal.show();
}

/**
 * Submit adverse drug reaction report
 * @param {Event} event - The form submission event
 */
async function submitAdrReport(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm(adrReportForm)) {
        return;
    }
    
    // Create ADR report data
    const adrData = {
        patient_id: parseInt(document.getElementById('adrPatientId').value),
        medication: document.getElementById('adrMedication').value,
        onset_date: document.getElementById('adrOnsetDate').value,
        symptoms: document.getElementById('adrSymptoms').value,
        severity: document.getElementById('adrSeverity').value,
        outcome: document.getElementById('adrOutcome').value || null,
        action: document.getElementById('adrAction').value || null,
        notes: document.getElementById('adrNotes').value || null,
        serious: document.getElementById('adrSeriousCheck').checked
    };
    
    try {
        // Send data to the server
        const response = await fetch('/report-adverse-reaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adrData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showAlert('Adverse reaction reported successfully!', 'success');
            
            // Reset form (but keep patient info)
            adrReportForm.reset();
            
            // Refetch ADR reports
            fetchAdrReports(adrData.patient_id);
            
            // Show critical alert if severity is high
            if (adrData.severity === 'Severe' || adrData.severity === 'Life-threatening' || adrData.serious) {
                showAlert('Critical adverse reaction reported! Doctor notification sent.', 'danger', 0);
            }
        } else {
            showAlert('Failed to report adverse reaction: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error reporting adverse reaction:', error);
        showAlert('An error occurred while reporting the adverse reaction', 'danger');
    }
}
