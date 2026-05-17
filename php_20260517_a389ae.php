<?php
// api/get_metrics.php - Get metrics data
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

$response = ['success' => false, 'data' => null, 'stats' => null, 'history' => null];

try {
    // Get latest metrics
    $latestMetrics = getLatestMetrics($pdo);
    
    // Get statistics
    $statistics = getStatistics($pdo);
    
    // Get alerts count
    $alerts = getAlertsCount($pdo);
    
    // Get historical data for charts
    $history = getHistoricalData($pdo, 50);
    
    // Get logs if requested
    $logs = null;
    if (isset($_GET['logs']) && $_GET['logs'] === 'true') {
        $logs = getSystemLogs($pdo, 100);
    }
    
    $response['success'] = true;
    $response['data'] = $latestMetrics;
    $response['stats'] = [
        'total_records' => $statistics['total_records'],
        'avg_score' => round($statistics['avg_score'] ?? 0, 1),
        'avg_speed' => round($statistics['avg_speed'] ?? 0, 1),
        'avg_google' => round($statistics['avg_google'] ?? 0, 1),
        'avg_youtube' => round($statistics['avg_youtube'] ?? 0, 1),
        'max_score' => round($statistics['max_score'] ?? 0, 1),
        'min_score' => round($statistics['min_score'] ?? 0, 1),
        'test_records' => $statistics['test_records'] ?? 0,
        'critical_alerts' => $alerts['critical'] ?? 0,
        'warning_alerts' => $alerts['warning'] ?? 0,
        'info_alerts' => $alerts['info'] ?? 0
    ];
    $response['history'] = $history;
    
    if ($logs) {
        $response['logs'] = $logs;
    }
    
} catch(Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>