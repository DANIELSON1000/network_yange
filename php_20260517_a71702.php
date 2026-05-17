<?php
// db.php - Database configuration for Network Monitor

$db_host = 'localhost';
$db_name = 'network_data';
$db_user = 'root';
$db_password = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Function to get latest metrics
    function getLatestMetrics($pdo) {
        $stmt = $pdo->query("
            SELECT * FROM network_metrics 
            ORDER BY timestamp DESC 
            LIMIT 1
        ");
        return $stmt->fetch();
    }
    
    // Function to get historical data
    function getHistoricalData($pdo, $limit = 100) {
        $stmt = $pdo->prepare("
            SELECT * FROM network_metrics 
            ORDER BY timestamp DESC 
            LIMIT :limit
        ");
        $stmt->execute(['limit' => $limit]);
        return $stmt->fetchAll();
    }
    
    // Function to get recent recommendations
    function getRecentRecommendations($pdo, $limit = 10) {
        $stmt = $pdo->prepare("
            SELECT r.*, n.timestamp, n.network_score, n.network_status
            FROM recommendations r
            JOIN network_metrics n ON r.metric_id = n.id
            ORDER BY r.created_at DESC
            LIMIT :limit
        ");
        $stmt->execute(['limit' => $limit]);
        return $stmt->fetchAll();
    }
    
    // Function to get system logs
    function getSystemLogs($pdo, $limit = 50) {
        $stmt = $pdo->prepare("
            SELECT * FROM system_logs 
            ORDER BY created_at DESC 
            LIMIT :limit
        ");
        $stmt->execute(['limit' => $limit]);
        return $stmt->fetchAll();
    }
    
    // Function to get statistics
    function getStatistics($pdo) {
        $stmt = $pdo->query("
            SELECT 
                COUNT(*) as total_records,
                AVG(network_score) as avg_score,
                AVG(combined_speed) as avg_speed,
                AVG(google_quality_score) as avg_google,
                AVG(youtube_quality_score) as avg_youtube,
                MAX(network_score) as max_score,
                MIN(network_score) as min_score,
                SUM(CASE WHEN test_mode = 1 THEN 1 ELSE 0 END) as test_records
            FROM network_metrics
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        return $stmt->fetch();
    }
    
    // Function to get alerts count
    function getAlertsCount($pdo) {
        $stmt = $pdo->query("
            SELECT 
                COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
                COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning,
                COUNT(CASE WHEN severity = 'info' THEN 1 END) as info
            FROM recommendations r
            JOIN network_metrics n ON r.metric_id = n.id
            WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ");
        return $stmt->fetch();
    }
    
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>