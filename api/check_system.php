<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Universal path finder for Database.php
$config_path = null;
$search_paths = [
    __DIR__ . '/config/Database.php',
    __DIR__ . '/../config/Database.php',
    __DIR__ . '/../../config/Database.php'
];

foreach ($search_paths as $path) {
    if (file_exists($path)) {
        $config_path = $path;
        break;
    }
}

if (!$config_path) {
    die(json_encode(["error" => "Database.php not found. Please ensure it is in api/config/Database.php"]));
}

require_once $config_path;

$report = [
    "status" => "diagnostics_running",
    "timestamp" => date("Y-m-d H:i:s"),
    "checks" => []
];

try {
    $dbClass = new Database();
    $conn = $dbClass->getConnection();
    
    if ($conn) {
        $report["checks"]["database"] = ["status" => "SUCCESS", "message" => "Connected successfully."];
        $tables = ['users', 'ojt_logs', 'log_photos'];
        foreach ($tables as $table) {
            $stmt = $conn->query("SHOW TABLES LIKE '$table'");
            $report["checks"]["table_$table"] = $stmt->rowCount() > 0 ? "EXISTS" : "MISSING";
        }
    } else {
        $report["checks"]["database"] = ["status" => "FAILURE", "message" => "Check Database.php credentials (Host, DB Name, User, Pass)."];
    }
} catch (Exception $e) {
    $report["checks"]["database"] = ["status" => "ERROR", "message" => $e->getMessage()];
}

echo json_encode($report, JSON_PRETTY_PRINT);
