// js/charts.js - Chart configurations and utilities

// Chart color palettes
const chartColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#48bb78',
    warning: '#ed8936',
    danger: '#f56565',
    google: '#4285f4',
    youtube: '#ff0000',
    background: 'rgba(255, 255, 255, 0.1)',
    grid: 'rgba(255, 255, 255, 0.1)'
};

// Common chart options
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: {
                color: '#e2e8f0',
                font: { family: 'Inter', size: 12 }
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#e2e8f0',
            bodyColor: '#a0aec0'
        }
    },
    scales: {
        x: {
            ticks: { color: '#a0aec0' },
            grid: { color: chartColors.grid }
        },
        y: {
            ticks: { color: '#a0aec0' },
            grid: { color: chartColors.grid }
        }
    }
};

// Create network score gauge
function createGaugeChart(elementId, score) {
    const ctx = document.getElementById(elementId).getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: ['#48bb78', '#2d3748'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: { enabled: false },
                legend: { display: false }
            }
        }
    });
}

// Create line chart for trends
function createLineChart(elementId, labels, datasets) {
    const ctx = document.getElementById(elementId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            ...commonChartOptions,
            elements: {
                line: { tension: 0.4 },
                point: { radius: 3, hoverRadius: 5 }
            }
        }
    });
}

// Create bar chart for comparison
function createBarChart(elementId, labels, datasets) {
    const ctx = document.getElementById(elementId).getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            ...commonChartOptions,
            scales: {
                ...commonChartOptions.scales,
                y: {
                    ...commonChartOptions.scales.y,
                    beginAtZero: true
                }
            }
        }
    });
}

// Update chart data
function updateChart(chart, newData) {
    if (chart && chart.data) {
        chart.data.datasets.forEach((dataset, index) => {
            if (newData[index]) {
                dataset.data = newData[index];
            }
        });
        chart.update();
    }
}

// Format date for charts
function formatChartDate(date) {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Get color based on score
function getScoreColor(score) {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#4299e1';
    if (score >= 40) return '#ed8936';
    if (score >= 20) return '#f56565';
    return '#dc2626';
}

// Export functions for use in dashboard
window.chartUtils = {
    createGaugeChart,
    createLineChart,
    createBarChart,
    updateChart,
    formatChartDate,
    getScoreColor,
    chartColors
};