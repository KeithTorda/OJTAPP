<?php
$db = new PDO('mysql:host=localhost;dbname=ojt_logs_db', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$check = $db->query("SHOW COLUMNS FROM ojt_logs LIKE 'week_number'");
if ($check->rowCount() === 0) {
    $db->exec("ALTER TABLE ojt_logs ADD COLUMN week_number INT DEFAULT NULL");
    
    // Auto-populate from day_number: ceil(day/5)
    $db->exec("UPDATE ojt_logs SET week_number = CEIL(day_number / 5) WHERE day_number IS NOT NULL");
    echo "Added and populated week_number column";
} else {
    echo "week_number already exists";
}
