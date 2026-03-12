<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once 'config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "ERROR: DB connection is NULL\n";
    exit;
}

echo "DB connection OK\n";

// Check table structure
$cols = $db->query("SHOW COLUMNS FROM ojt_logs");
echo "ojt_logs columns:\n";
while ($col = $cols->fetch(PDO::FETCH_ASSOC)) {
    echo "  - " . $col['Field'] . " (" . $col['Type'] . ")\n";
}

// Check data count
$count = $db->query("SELECT COUNT(*) FROM ojt_logs")->fetchColumn();
echo "Total logs: $count\n";

// Test read with user_id=1
$query = "SELECT id, task_desc, hours, log_date, photo_url, created_at FROM ojt_logs WHERE user_id = 1 ORDER BY log_date DESC, created_at DESC";
$stmt = $db->prepare($query);
$stmt->execute();
echo "Query OK, rows: " . $stmt->rowCount() . "\n";

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "  Log #{$row['id']}: {$row['task_desc']} ({$row['hours']}h on {$row['log_date']})\n";
}

echo "DONE\n";
?>
