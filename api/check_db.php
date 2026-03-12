<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once 'config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Connection failed");
}

echo "--- USERS ---\n";
$users = $db->query("SELECT id, username FROM users")->fetchAll(PDO::FETCH_ASSOC);
print_r($users);

echo "\n--- LOGS ---\n";
$logs = $db->query("SELECT id, user_id, task_desc, log_date FROM ojt_logs")->fetchAll(PDO::FETCH_ASSOC);
print_r($logs);
?>
