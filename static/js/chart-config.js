/**
 * Chart Configuration JavaScript
 * Handles chart creation and configuration across the application
 */

// Initialize patient statistics chart
function updatePatientChart(transplantCount, waitlistCount, followupCount) {
    // Get the canvas element
    const ctx = document.getElementById('patientStatsChart');
    
    if (!ctx) return;
    
    // Create the chart
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Post-Transplant', 'On Waitlist', 'Regular Follow-up'],
            datasets: [{
                data: [transplantCount, waitlistCount, followupCount],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)', // success/green
                    'rgba(23, 162, 184, 0.8)', // info/blue
                    'rgba(255, 193, 7, 0.8)'   // warning/yellow
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(255, 193, 7, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize organ availability chart
function updateOrganAvailabilityChart(organs) {
    // Get the canvas element
    const ctx = document.getElementById('organAvailabilityChart');
    
    if (!ctx) return;
    
    // Create the chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(organs),
            datasets: [{
                label: 'Available Organs',
                data: Object.values(organs),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    },
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Organ Type'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Initialize medication adherence chart
function updateMedicationAdherenceChart(adherenceData) {
    // Get the canvas element
    const ctx = document.getElementById('medicationAdherenceChart');
    
    if (!ctx) return;
    
    // Prepare chart data
    const labels = adherenceData.map(d => d.date);
    const data = adherenceData.map(d => d.adherence);
    
    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Medication Adherence (%)',
                data: data,
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2,
                tension: 0.1,
                pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Adherence (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

// Initialize lab results chart
function updateLabResultsChart(labData) {
    // Get the canvas element
    const ctx = document.getElementById('labResultsChart');
    
    if (!ctx) return;
    
    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labData.dates,
            datasets: labData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

// Initialize donor statistics chart
function updateDonorStatisticsChart(donorData) {
    // Get the canvas element
    const ctx = document.getElementById('donorStatisticsChart');
    
    if (!ctx) return;
    
    // Create the chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(donorData),
            datasets: [{
                data: Object.values(donorData),
                backgroundColor: [
                    'rgba(220, 53, 69, 0.8)',  // danger/red
                    'rgba(255, 193, 7, 0.8)',  // warning/yellow
                    'rgba(40, 167, 69, 0.8)',  // success/green
                ],
                borderColor: [
                    'rgba(220, 53, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

// Initialize medication price comparison chart
function updatePriceComparisonChart(alternatives) {
    // Get the canvas element
    const ctx = document.getElementById('priceComparisonChart');
    
    if (!ctx) return;
    
    // Prepare chart data
    const labels = alternatives.map(alt => alt.brand);
    const prices = alternatives.map(alt => alt.price);
    
    // Create the chart
    new Chart(ctx, {
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
            maintainAspectRatio: false,
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
                legend: {
                    display: false
                }
            }
        }
    });
}

// Initialize adverse reaction severity chart
function updateAdverseReactionChart(severityData) {
    // Get the canvas element
    const ctx = document.getElementById('adverseReactionChart');
    
    if (!ctx) return;
    
    // Create the chart
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(severityData),
            datasets: [{
                label: 'Current Month',
                data: Object.values(severityData.current),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }, {
                label: 'Previous Month',
                data: Object.values(severityData.previous),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 5
                }
            }
        }
    });
}

// Initialize questionnaire trend chart
function updateQuestionnaireTrendsChart(trendsData) {
    // Get the canvas element
    const ctx = document.getElementById('questionnaireTrendsChart');
    
    if (!ctx) return;
    
    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendsData.dates,
            datasets: [{
                label: 'Severity Score',
                data: trendsData.scores,
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 2,
                tension: 0.2,
                pointBackgroundColor: 'rgba(220, 53, 69, 1)',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Severity Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 7,
                            yMax: 7,
                            borderColor: 'rgba(220, 53, 69, 0.7)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                content: 'Critical Threshold',
                                enabled: true,
                                position: 'start'
                            }
                        },
                        line2: {
                            type: 'line',
                            yMin: 4,
                            yMax: 4,
                            borderColor: 'rgba(255, 193, 7, 0.7)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                content: 'Moderate Threshold',
                                enabled: true,
                                position: 'start'
                            }
                        }
                    }
                }
            }
        }
    });
}
