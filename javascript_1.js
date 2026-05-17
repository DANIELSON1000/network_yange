// js/dashboard.js - Main dashboard functionality

let refreshInterval = null;
let autoRefresh = true;
let gaugeChart = null;
let networkTrendChart = null;
let comparisonChart = null;

// Initialize dashboard
$(document).ready(function() {
    loadDashboardData();
    setupEventListeners();
    startAutoRefresh();
    setupTabs();
});

// Setup event listeners
function setupEventListeners() {
    $('#auto-refresh').change(function() {
        autoRefresh = $(this).is(':checked');
        if (autoRefresh) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
    });
    
    $('#manual-refresh').click(function() {
        loadDashboardData();
        updateRefreshIndicator();
    });
    
    $('.tab-btn').click(function() {
        const tabId = $(this).data('tab');
        switchTab(tabId);
    });
}

// Start auto-refresh
function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(function() {
        if (autoRefresh) {
            loadDashboardData();
            updateRefreshIndicator();
        }
    }, 15000);
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Setup tabs
function setupTabs() {
    $('.tab-btn').click(function() {
        const tabId = $(this).data('tab');
        switchTab(tabId);
    });
}

// Switch tab
function switchTab(tabId) {
    $('.tab-btn').removeClass('active');
    $(`.tab-btn[data-tab="${tabId}"]`).addClass('active');
    
    $('.tab-content').removeClass('active');
    $(`#${tabId}-tab`).addClass('active');
    
    // Load tab content if needed
    if (tabId === 'recommendations') {
        loadRecommendations();
    } else if (tabId === 'history') {
        loadHistoryData();
    } else if (tabId === 'logs') {
        loadLogs();
    } else if (tabId === 'alerts') {
        loadAlerts();
    }
}

// Load all dashboard data
function loadDashboardData() {
    $.ajax({
        url: 'api/get_metrics.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                updateDashboard(response.data);
                updateStatistics(response.stats);
                updateCharts(response.history);
                updateRefreshTime();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading dashboard data:', error);
        }
    });
}

// Update dashboard with latest metrics
function updateDashboard(data) {
    // Update network score
    const score = data.network_score || 0;
    $('#network-score').text(score + '/100');
    $('#combined-speed').text((data.combined_speed || 0).toFixed(1) + ' Mbps');
    
    // Set score color
    const scoreElement = $('#network-score');
    scoreElement.removeClass('score-excellent score-good score-fair score-poor score-critical');
    if (score >= 80) scoreElement.addClass('score-excellent');
    else if (score >= 60) scoreElement.addClass('score-good');
    else if (score >= 40) scoreElement.addClass('score-fair');
    else if (score >= 20) scoreElement.addClass('score-poor');
    else scoreElement.addClass('score-critical');
    
    // Update status text
    $('#network-status').text(data.network_status || 'UNKNOWN');
    
    // Update Google metrics
    $('#google-quality').text((data.google_quality_score || 0) + '/100');
    $('#google-quality-bar').css('width', (data.google_quality_score || 0) + '%');
    $('#google-latency').text((data.google_latency || 0).toFixed(1) + ' ms');
    $('#google-loss').text((data.google_packet_loss || 0).toFixed(2) + '%');
    $('#google-bandwidth').text((data.google_bandwidth || 0).toFixed(1) + ' Mbps');
    
    // Update YouTube metrics
    $('#youtube-quality').text((data.youtube_quality_score || 0) + '/100');
    $('#youtube-quality-bar').css('width', (data.youtube_quality_score || 0) + '%');
    $('#youtube-latency').text((data.youtube_latency || 0).toFixed(1) + ' ms');
    $('#youtube-loss').text((data.youtube_packet_loss || 0).toFixed(2) + '%');
    $('#youtube-bandwidth').text((data.youtube_bandwidth || 0).toFixed(1) + ' Mbps');
    
    // Update gauge chart
    updateGaugeChart(score);
}

// Update statistics
function updateStatistics(stats) {
    $('#total-records').text(stats.total_records || 0);
    $('#avg-score').text(Math.round(stats.avg_score || 0) + '/100');
    $('#avg-speed').text((stats.avg_speed || 0).toFixed(1) + ' Mbps');
    $('#alert-count').text((stats.critical_alerts || 0) + (stats.warning_alerts || 0));
}

// Update gauge chart
function updateGaugeChart(score) {
    if (!gaugeChart) {
        const ctx = document.getElementById('gauge-chart').getContext('2d');
        gaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: ['#48bb78', '#2d3748'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            }
        });
    } else {
        gaugeChart.data.datasets[0].data = [score, 100 - score];
        gaugeChart.update();
    }
}

// Update charts
function updateCharts(historyData) {
    if (!historyData || historyData.length === 0) return;
    
    // Update network trend chart
    if (networkTrendChart) {
        networkTrendChart.destroy();
    }
    
    const ctx1 = document.getElementById('network-trend-chart').getContext('2d');
    const timestamps = historyData.map(d => new Date(d.timestamp).toLocaleTimeString());
    const scores = historyData.map(d => d.network_score);
    const speeds = historyData.map(d => d.combined_speed);
    
    networkTrendChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: timestamps.reverse(),
            datasets: [
                {
                    label: 'Network Score',
                    data: scores.reverse(),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Combined Speed (Mbps)',
                    data: speeds.reverse(),
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { color: '#e2e8f0' } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { title: { display: true, text: 'Network Score (0-100)', color: '#e2e8f0' }, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#e2e8f0' } },
                y1: { position: 'right', title: { display: true, text: 'Speed (Mbps)', color: '#e2e8f0' }, grid: { drawOnChartArea: false }, ticks: { color: '#e2e8f0' } },
                x: { ticks: { color: '#e2e8f0', maxRotation: 45, minRotation: 45 } }
            }
        }
    });
    
    // Update comparison chart
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    const ctx2 = document.getElementById('comparison-chart').getContext('2d');
    const latest = historyData[0];
    
    comparisonChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Google', 'YouTube'],
            datasets: [
                {
                    label: 'Quality Score',
                    data: [latest.google_quality_score || 0, latest.youtube_quality_score || 0],
                    backgroundColor: ['#4285f4', '#ff0000'],
                    borderRadius: 10
                },
                {
                    label: 'Latency (ms)',
                    data: [latest.google_latency || 0, latest.youtube_latency || 0],
                    backgroundColor: ['#34a853', '#ff6b6b'],
                    borderRadius: 10,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top', labels: { color: '#e2e8f0' } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { title: { display: true, text: 'Quality Score', color: '#e2e8f0' }, beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#e2e8f0' } },
                y1: { position: 'right', title: { display: true, text: 'Latency (ms)', color: '#e2e8f0' }, grid: { drawOnChartArea: false }, ticks: { color: '#e2e8f0' } },
                x: { ticks: { color: '#e2e8f0' } }
            }
        }
    });
}

// Load recommendations
function loadRecommendations() {
    $.ajax({
        url: 'api/get_recommendations.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data.length > 0) {
                displayRecommendations(response.data);
            } else {
                $('#recommendations-list').html('<div class="text-center">No recommendations available</div>');
            }
        },
        error: function() {
            $('#recommendations-list').html('<div class="text-center">Error loading recommendations</div>');
        }
    });
}

// Display recommendations
function displayRecommendations(recommendations) {
    let html = '';
    recommendations.forEach(rec => {
        let severityClass = '';
        if (rec.severity === 'critical') severityClass = 'recommendation-critical';
        else if (rec.severity === 'warning') severityClass = 'recommendation-warning';
        else if (rec.severity === 'good') severityClass = 'recommendation-good';
        else severityClass = 'recommendation-info';
        
        html += `
            <div class="recommendation-item ${severityClass}">
                <div class="recommendation-header">
                    <div class="recommendation-service">
                        <i class="fas ${rec.service === 'Google' ? 'fa-google' : (rec.service === 'YouTube' ? 'fa-youtube' : 'fa-network-wired')}"></i>
                        ${rec.service}
                    </div>
                    <div class="recommendation-time">
                        <i class="far fa-clock"></i> ${new Date(rec.created_at).toLocaleString()}
                    </div>
                </div>
                <div class="recommendation-message">
                    ${rec.recommendation}
                </div>
                <div class="recommendation-meta">
                    Network Score: ${Math.round(rec.network_score)}/100 | Status: ${rec.network_status}
                </div>
            </div>
        `;
    });
    $('#recommendations-list').html(html);
}

// Load history data
function loadHistoryData() {
    $.ajax({
        url: 'api/get_metrics.php?history=true',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.history.length > 0) {
                displayHistoryData(response.history);
            } else {
                $('#history-body').html('<tr><td colspan="7" class="text-center">No historical data available</td></tr>');
            }
        },
        error: function() {
            $('#history-body').html('<tr><td colspan="7" class="text-center">Error loading history</td></tr>');
        }
    });
}

// Display history data
function displayHistoryData(data) {
    let html = '';
    data.forEach(row => {
        const statusClass = getStatusClass(row.network_status);
        const testBadge = row.test_mode ? '<span class="test-badge">Test Mode</span>' : '';
        
        html += `
            <tr>
                <td>${new Date(row.timestamp).toLocaleString()}</td>
                <td>${row.google_quality_score || 0}/100</td>
                <td>${row.youtube_quality_score || 0}/100</td>
                <td>${Math.round(row.network_score || 0)}/100</td>
                <td>${(row.combined_speed || 0).toFixed(1)} Mbps</td>
                <td><span class="status-badge ${statusClass}">${row.network_status || 'UNKNOWN'}</span></td>
                <td>${testBadge}</td>
            </tr>
        `;
    });
    $('#history-body').html(html);
}

// Load logs
function loadLogs() {
    $.ajax({
        url: 'api/get_metrics.php?logs=true',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.logs.length > 0) {
                displayLogs(response.logs);
            } else {
                $('#logs-container').html('<div class="text-center">No logs available</div>');
            }
        },
        error: function() {
            $('#logs-container').html('<div class="text-center">Error loading logs</div>');
        }
    });
}

// Display logs
function displayLogs(logs) {
    let html = '';
    logs.forEach(log => {
        let logClass = '';
        if (log.log_type === 'INFO') logClass = 'log-info';
        else if (log.log_type === 'WARNING') logClass = 'log-warning';
        else if (log.log_type === 'ERROR') logClass = 'log-error';
        else if (log.log_type === 'TEST') logClass = 'log-test';
        
        html += `
            <div class="log-entry ${logClass}">
                <div class="log-time">
                    <i class="far fa-clock"></i> ${new Date(log.created_at).toLocaleString()}
                </div>
                <div class="log-type">
                    [${log.log_type}]
                </div>
                <div class="log-message">
                    ${escapeHtml(log.message)}
                </div>
            </div>
        `;
    });
    $('#logs-container').html(html);
}

// Load alerts
function loadAlerts() {
    $.ajax({
        url: 'api/get_alerts.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.alerts.length > 0) {
                displayAlerts(response.alerts);
            } else {
                $('#alerts-container').html('<div class="text-center">No active alerts</div>');
            }
        },
        error: function() {
            $('#alerts-container').html('<div class="text-center">Error loading alerts</div>');
        }
    });
}

// Display alerts
function displayAlerts(alerts) {
    let html = '';
    alerts.forEach(alert => {
        html += `
            <div class="alert-item alert-${alert.severity}">
                <div class="recommendation-header">
                    <div class="recommendation-service">
                        <i class="fas ${alert.severity === 'critical' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                        ${alert.severity.toUpperCase()} Alert
                    </div>
                    <div class="recommendation-time">
                        ${new Date(alert.created_at).toLocaleString()}
                    </div>
                </div>
                <div class="recommendation-message">
                    ${alert.message}
                </div>
                ${alert.affected_service ? `<div class="recommendation-meta">Affected Service: ${alert.affected_service}</div>` : ''}
            </div>
        `;
    });
    $('#alerts-container').html(html);
}

// Helper function to get status class
function getStatusClass(status) {
    if (!status) return 'status-poor';
    const statusLower = status.toLowerCase();
    if (statusLower === 'excellent') return 'status-excellent';
    if (statusLower === 'good') return 'status-good';
    if (statusLower === 'fair') return 'status-fair';
    if (statusLower === 'poor') return 'status-poor';
    return 'status-critical';
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update refresh time display
function updateRefreshTime() {
    const now = new Date();
    $('#last-updated').text(now.toLocaleTimeString());
}

// Update refresh indicator
function updateRefreshIndicator() {
    const refreshSpan = $('#refresh-status');
    refreshSpan.text('Refreshing...');
    setTimeout(() => {
        refreshSpan.text('15s');
    }, 1000);
}