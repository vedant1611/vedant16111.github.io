/**
 * Drug Checklist JavaScript
 * Handles displaying alternative medications for post-transplant patients
 */

// Initialize variables
let drugAlternatives = {};

// DOM elements
const medicationSelect = document.getElementById('medicationSelect');
const alternativesContainer = document.getElementById('alternativesContainer');
const comparisonChart = document.getElementById('comparisonChart');
const priceRangeMin = document.getElementById('priceRangeMin');
const priceRangeMax = document.getElementById('priceRangeMax');
const filterForm = document.getElementById('filterForm');
let chart = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    if (medicationSelect) {
        medicationSelect.addEventListener('change', showAlternatives);
    }
    
    if (filterForm) {
        filterForm.addEventListener('submit', filterAlternatives);
    }
    
    // Fetch drug alternatives
    fetchDrugAlternatives();
    
    // Check for medication in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('medication')) {
        const medication = urlParams.get('medication');
        
        // Find closest match in select options (once loaded)
        setTimeout(() => {
            if (medicationSelect && medicationSelect.options.length > 1) {
                let bestMatch = null;
                let bestMatchScore = 0;
                
                for (let i = 0; i < medicationSelect.options.length; i++) {
                    const option = medicationSelect.options[i];
                    if (option.value === '') continue;
                    
                    // Simple string similarity check
                    const similarity = calculateStringSimilarity(medication.toLowerCase(), option.value.toLowerCase());
                    if (similarity > bestMatchScore) {
                        bestMatchScore = similarity;
                        bestMatch = option.value;
                    }
                }
                
                if (bestMatch && bestMatchScore > 0.5) {
                    medicationSelect.value = bestMatch;
                    showAlternatives();
                }
            }
        }, 500);
    }
});

/**
 * Calculate string similarity (simple implementation)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @return {number} - Similarity score (0-1)
 */
function calculateStringSimilarity(a, b) {
    if (a.includes(b) || b.includes(a)) {
        return 0.9;
    }
    
    const aWords = a.split(/\s+/);
    const bWords = b.split(/\s+/);
    
    let matches = 0;
    for (const aWord of aWords) {
        for (const bWord of bWords) {
            if (aWord === bWord || (aWord.length > 3 && bWord.includes(aWord)) || (bWord.length > 3 && aWord.includes(bWord))) {
                matches++;
                break;
            }
        }
    }
    
    return matches / Math.max(aWords.length, bWords.length);
}

/**
 * Fetch drug alternatives from the server
 */
async function fetchDrugAlternatives() {
    try {
        const response = await fetch('/get-drug-alternatives');
        const data = await response.json();
        
        if (data.success) {
            drugAlternatives = data.drug_alternatives || {};
            
            // Populate medication select
            populateMedicationSelect();
        } else {
            showAlert('Failed to fetch drug alternatives: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error fetching drug alternatives:', error);
        showAlert('An error occurred while fetching drug alternatives', 'danger');
    }
}

/**
 * Populate medication select dropdown
 */
function populateMedicationSelect() {
    // Clear existing options (except the first one)
    while (medicationSelect.options.length > 1) {
        medicationSelect.remove(1);
    }
    
    // Add medication options
    for (const [medication, alternatives] of Object.entries(drugAlternatives)) {
        const option = document.createElement('option');
        option.value = medication;
        option.textContent = medication;
        medicationSelect.appendChild(option);
    }
}

/**
 * Show alternatives for the selected medication
 */
function showAlternatives() {
    const selectedMedication = medicationSelect.value;
    
    if (!selectedMedication) {
        alternativesContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Please select a medication to view alternatives.
            </div>
        `;
        return;
    }
    
    const alternatives = drugAlternatives[selectedMedication] || [];
    
    if (alternatives.length === 0) {
        alternativesContainer.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No alternatives found for ${selectedMedication}.
            </div>
        `;
        return;
    }
    
    // Get min and max prices
    const prices = alternatives.map(alt => alt.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Update price range filter
    if (priceRangeMin && priceRangeMax) {
        priceRangeMin.value = minPrice;
        priceRangeMin.min = minPrice;
        priceRangeMin.max = maxPrice;
        
        priceRangeMax.value = maxPrice;
        priceRangeMax.min = minPrice;
        priceRangeMax.max = maxPrice;
    }
    
    // Generate HTML for alternatives
    let alternativesHtml = `
        <h4 class="mb-3">Alternatives for ${selectedMedication}</h4>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Manufacturer</th>
                        <th>Dosage</th>
                        <th>Price (₹)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    alternatives.forEach(alt => {
        alternativesHtml += `
            <tr>
                <td class="fw-bold">${alt.brand}</td>
                <td>${alt.manufacturer}</td>
                <td>${alt.dosage}</td>
                <td>₹${alt.price.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info select-alternative" data-brand="${alt.brand}">
                        <i class="fas fa-check-circle me-1"></i> Select
                    </button>
                </td>
            </tr>
        `;
    });
    
    alternativesHtml += `
                </tbody>
            </table>
        </div>
    `;
    
    alternativesContainer.innerHTML = alternativesHtml;
    
    // Add event listeners to select buttons
    const selectButtons = document.querySelectorAll('.select-alternative');
    selectButtons.forEach(button => {
        button.addEventListener('click', () => {
            const brand = button.dataset.brand;
            selectAlternative(selectedMedication, brand);
        });
    });
    
    // Create price comparison chart
    createComparisonChart(selectedMedication, alternatives);
}

/**
 * Create price comparison chart
 * @param {string} medication - The selected medication
 * @param {Array} alternatives - Array of alternative objects
 */
function createComparisonChart(medication, alternatives) {
    if (!comparisonChart) return;
    
    // Destroy existing chart if any
    if (chart) {
        chart.destroy();
    }
    
    // Prepare chart data
    const labels = alternatives.map(alt => alt.brand);
    const prices = alternatives.map(alt => alt.price);
    
    // Get context and create chart
    const ctx = comparisonChart.getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Price (₹)',
                data: prices,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Price (₹)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Brand'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Price Comparison for ${medication} Alternatives`,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `₹${context.raw.toLocaleString()}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Filter alternatives based on price range
 * @param {Event} event - The form submission event
 */
function filterAlternatives(event) {
    event.preventDefault();
    
    const selectedMedication = medicationSelect.value;
    
    if (!selectedMedication) {
        return;
    }
    
    const minPrice = parseInt(priceRangeMin.value);
    const maxPrice = parseInt(priceRangeMax.value);
    
    const allAlternatives = drugAlternatives[selectedMedication] || [];
    const filteredAlternatives = allAlternatives.filter(alt => 
        alt.price >= minPrice && alt.price <= maxPrice
    );
    
    // Update alternatives display
    if (filteredAlternatives.length === 0) {
        alternativesContainer.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No alternatives found in the selected price range (₹${minPrice} - ₹${maxPrice}).
            </div>
        `;
    } else {
        let alternativesHtml = `
            <h4 class="mb-3">Alternatives for ${selectedMedication} (₹${minPrice} - ₹${maxPrice})</h4>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Brand</th>
                            <th>Manufacturer</th>
                            <th>Dosage</th>
                            <th>Price (₹)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        filteredAlternatives.forEach(alt => {
            alternativesHtml += `
                <tr>
                    <td class="fw-bold">${alt.brand}</td>
                    <td>${alt.manufacturer}</td>
                    <td>${alt.dosage}</td>
                    <td>₹${alt.price.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info select-alternative" data-brand="${alt.brand}">
                            <i class="fas fa-check-circle me-1"></i> Select
                        </button>
                    </td>
                </tr>
            `;
        });
        
        alternativesHtml += `
                    </tbody>
                </table>
            </div>
        `;
        
        alternativesContainer.innerHTML = alternativesHtml;
        
        // Add event listeners to select buttons
        const selectButtons = document.querySelectorAll('.select-alternative');
        selectButtons.forEach(button => {
            button.addEventListener('click', () => {
                const brand = button.dataset.brand;
                selectAlternative(selectedMedication, brand);
            });
        });
    }
    
    // Update comparison chart
    createComparisonChart(selectedMedication, filteredAlternatives);
}

/**
 * Select an alternative medication
 * @param {string} medication - The generic medication name
 * @param {string} brand - The selected brand
 */
function selectAlternative(medication, brand) {
    // Find the selected alternative
    const alternatives = drugAlternatives[medication] || [];
    const selected = alternatives.find(alt => alt.brand === brand);
    
    if (!selected) {
        showAlert('Alternative not found', 'danger');
        return;
    }
    
    // In a real app, this would save the selection to the patient's record
    // For this demo, we'll just show a success message
    
    showAlert(`Selected ${brand} as an alternative for ${medication}`, 'success');
    
    // Show selection modal with more details
    document.getElementById('selectedMedication').textContent = medication;
    document.getElementById('selectedBrand').textContent = brand;
    document.getElementById('selectedManufacturer').textContent = selected.manufacturer;
    document.getElementById('selectedDosage').textContent = selected.dosage;
    document.getElementById('selectedPrice').textContent = `₹${selected.price.toLocaleString()}`;
    
    // Calculate savings compared to most expensive alternative
    const mostExpensive = Math.max(...alternatives.map(alt => alt.price));
    const savings = mostExpensive - selected.price;
    const savingsPercent = Math.round((savings / mostExpensive) * 100);
    
    document.getElementById('potentialSavings').textContent = 
        `₹${savings.toLocaleString()} (${savingsPercent}% less than the most expensive option)`;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('selectionModal'));
    modal.show();
}
