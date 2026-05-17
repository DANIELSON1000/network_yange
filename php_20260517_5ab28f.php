<?php
// index.php - Main dashboard
require_once 'db.php';

// Get latest metrics for initial display
$latestMetrics = getLatestMetrics($pdo);
$statistics = getStatistics($pdo);
$alerts = getAlertsCount($pdo);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Network Monitor - Google & YouTube Performance Dashboard</title>
    <link rel="icon" type="image/x-icon" href="images/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation"></script>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="main-header">
            <div class="header-content">
                <div class="logo-section">
                    <i class="fas fa-network-wired"></i>
                    <h1>AI Network Monitor</h1>
                </div>
                <div class="subtitle">Google & YouTube Performance Tracking | Real-time Monitoring</div>
            </div>
            <div class="header-stats">
                <div class="stat-badge">
                    <i class="fas fa-sync-alt"></i>
                    <span>Auto-refresh: <span id="refresh-status">15s</span></span>
                </div>
                <div class="stat-badge">
                    <i class="fas fa-database"></i>
                    <span>Last DB Save: <span id="last-save">--</span></span>
                </div>
            </div>
        </header>

        <!-- Network Score Card -->
        <div class="network-score-card" id="network-score-card">
            <div class="score-content">
                <div class="score-label">
                    <i class="fas fa-chart-line"></i>
                    <span>NETWORK HEALTH SCORE</span>
                </div>
                <div class="score-value" id="network-score">--</div>
                <div class="score-status" id="network-status">--</div>
                <div class="score-speed" id="combined-speed">-- Mbps</div>
            </div>
            <div class="score-gauge" id="score-gauge">
                <canvas id="gauge-chart"></canvas>
            </div>
        </div>

        <!-- Statistics Row -->
        <div class="stats-row">
            <div class="stat-card">
                <i class="fas fa-chart-bar"></i>
                <div class="stat-info">
                    <div class="stat-label">Total Records (24h)</div>
                    <div class="stat-value" id="total-records"><?php echo $statistics['total_records'] ?? 0; ?></div>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-tachometer-alt"></i>
                <div class="stat-info">
                    <div class="stat-label">Avg Network Score</div>
                    <div class="stat-value" id="avg-score"><?php echo round($statistics['avg_score'] ?? 0); ?>/100</div>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-tachometer-alt"></i>
                <div class="stat-info">
                    <div class="stat-label">Avg Combined Speed</div>
                    <div class="stat-value" id="avg-speed"><?php echo round($statistics['avg_speed'] ?? 0, 1); ?> Mbps</div>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="stat-info">
                    <div class="stat-label">Active Alerts</div>
                    <div class="stat-value" id="alert-count">
                        <?php echo ($alerts['critical'] ?? 0) + ($alerts['warning'] ?? 0); ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Services Row -->
        <div class="services-row">
            <!-- Google Card -->
            <div class="service-card google-card">
                <div class="service-header">
                    <i class="fab fa-google"></i>
                    <h2>Google Performance</h2>
                </div>
                <div class="service-metrics">
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-star"></i>
                            <span>Quality Score</span>
                        </div>
                        <div class="metric-value" id="google-quality">--/100</div>
                        <div class="metric-progress">
                            <div class="progress-bar" id="google-quality-bar" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-clock"></i>
                            <span>Latency</span>
                        </div>
                        <div class="metric-value" id="google-latency">-- ms</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Packet Loss</span>
                        </div>
                        <div class="metric-value" id="google-loss">--%</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-wifi"></i>
                            <span>Bandwidth</span>
                        </div>
                        <div class="metric-value" id="google-bandwidth">-- Mbps</div>
                    </div>
                </div>
            </div>

            <!-- YouTube Card -->
            <div class="service-card youtube-card">
                <div class="service-header">
                    <i class="fab fa-youtube"></i>
                    <h2>YouTube Performance</h2>
                </div>
                <div class="service-metrics">
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-star"></i>
                            <span>Quality Score</span>
                        </div>
                        <div class="metric-value" id="youtube-quality">--/100</div>
                        <div class="metric-progress">
                            <div class="progress-bar" id="youtube-quality-bar" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-clock"></i>
                            <span>Latency</span>
                        </div>
                        <div class="metric-value" id="youtube-latency">-- ms</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Packet Loss</span>
                        </div>
                        <div class="metric-value" id="youtube-loss">--%</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">
                            <i class="fas fa-wifi"></i>
                            <span>Bandwidth</span>
                        </div>
                        <div class="metric-value" id="youtube-bandwidth">-- Mbps</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Comparison Charts -->
        <div class="charts-section">
            <div class="chart-card">
                <div class="chart-header">
                    <i class="fas fa-chart-line"></i>
                    <h3>Network Score Trend (Last 24 Hours)</h3>
                </div>
                <canvas id="network-trend-chart"></canvas>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Service Comparison</h3>
                </div>
                <canvas id="comparison-chart"></canvas>
            </div>
        </div>

        <!-- Tabs Section -->
        <div class="tabs-container">
            <div class="tab-buttons">
                <button class="tab-btn active" data-tab="recommendations">
                    <i class="fas fa-lightbulb"></i> Recommendations
                </button>
                <button class="tab-btn" data-tab="history">
                    <i class="fas fa-history"></i> Historical Data
                </button>
                <button class="tab-btn" data-tab="logs">
                    <i class="fas fa-list"></i> System Logs
                </button>
                <button class="tab-btn" data-tab="alerts">
                    <i class="fas fa-bell"></i> Alerts
                </button>
            </div>

            <!-- Recommendations Tab -->
            <div id="recommendations-tab" class="tab-content active">
                <div class="recommendations-list" id="recommendations-list">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Loading recommendations...
                    </div>
                </div>
            </div>

            <!-- History Tab -->
            <div id="history-tab" class="tab-content">
                <div class="table-container">
                    <table class="data-table" id="history-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Google Quality</th>
                                <th>YouTube Quality</th>
                                <th>Network Score</th>
                                <th>Combined Speed</th>
                                <th>Status</th>
                                <th>Test Mode</th>
                            </tr>
                        </thead>
                        <tbody id="history-body">
                            <tr>
                                <td colspan="7" class="text-center">Loading data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Logs Tab -->
            <div id="logs-tab" class="tab-content">
                <div class="logs-container" id="logs-container">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Loading logs...
                    </div>
                </div>
            </div>

            <!-- Alerts Tab -->
            <div id="alerts-tab" class="tab-content">
                <div class="alerts-container" id="alerts-container">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Loading alerts...
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer>
            <div class="footer-content">
                <div class="update-time">
                    <i class="fas fa-clock"></i>
                    Last Updated: <span id="last-updated">--</span>
                </div>
                <div class="auto-refresh-toggle">
                    <label class="switch">
                        <input type="checkbox" id="auto-refresh" checked>
                        <span class="slider"></span>
                    </label>
                    <span>Auto-refresh (15s)</span>
                </div>
                <button id="manual-refresh" class="refresh-btn">
                    <i class="fas fa-sync-alt"></i> Refresh Now
                </button>
            </div>
        </footer>
    </div>

    <script src="js/charts.js"></script>
    <script src="js/dashboard.js"></script>
</body>
</html>