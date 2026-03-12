<?php
/**
 * Database migration: Add day_number, create log_photos table, migrate data
 */
$conn = new PDO('mysql:host=localhost;dbname=ojt_logs_db', 'root', '');
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "=== OJT Database Migration ===\n\n";

// 1. Add day_number column to ojt_logs
$check = $conn->query("SHOW COLUMNS FROM ojt_logs LIKE 'day_number'");
if ($check->rowCount() === 0) {
    $conn->exec("ALTER TABLE ojt_logs ADD COLUMN day_number INT DEFAULT NULL");
    echo "[OK] Added 'day_number' column to ojt_logs\n";

    // Auto-populate day_number based on existing log dates
    $logs = $conn->query("SELECT id, user_id, log_date FROM ojt_logs ORDER BY user_id, log_date ASC, created_at ASC");
    $all = $logs->fetchAll(PDO::FETCH_ASSOC);
    $dayMap = [];
    foreach ($all as $row) {
        $key = $row['user_id'];
        if (!isset($dayMap[$key])) $dayMap[$key] = ['counter' => 0, 'lastDate' => null];
        if ($row['log_date'] !== $dayMap[$key]['lastDate']) {
            $dayMap[$key]['counter']++;
            $dayMap[$key]['lastDate'] = $row['log_date'];
        }
        $conn->prepare("UPDATE ojt_logs SET day_number = ? WHERE id = ?")->execute([$dayMap[$key]['counter'], $row['id']]);
    }
    echo "[OK] Populated day_number for existing logs\n";
} else {
    echo "[SKIP] 'day_number' already exists\n";
}

// 2. Create log_photos table
$conn->exec("CREATE TABLE IF NOT EXISTS log_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES ojt_logs(id) ON DELETE CASCADE
)");
echo "[OK] Created 'log_photos' table\n";

// 3. Migrate existing photo_url from ojt_logs to log_photos
$checkCol = $conn->query("SHOW COLUMNS FROM ojt_logs LIKE 'photo_url'");
if ($checkCol->rowCount() > 0) {
    $existing = $conn->query("SELECT id, photo_url FROM ojt_logs WHERE photo_url IS NOT NULL AND photo_url != ''");
    $migrated = 0;
    while ($row = $existing->fetch(PDO::FETCH_ASSOC)) {
        // Clean the URL to relative path
        $url = str_replace('http://localhost/ojt/api/', '', $row['photo_url']);
        $checkDup = $conn->prepare("SELECT COUNT(*) FROM log_photos WHERE log_id = ? AND photo_url = ?");
        $checkDup->execute([$row['id'], $url]);
        if ($checkDup->fetchColumn() == 0) {
            $conn->prepare("INSERT INTO log_photos (log_id, photo_url) VALUES (?, ?)")->execute([$row['id'], $url]);
            $migrated++;
        }
    }
    echo "[OK] Migrated $migrated photos to log_photos table\n";

    // Drop old column
    $conn->exec("ALTER TABLE ojt_logs DROP COLUMN photo_url");
    echo "[OK] Dropped old 'photo_url' column from ojt_logs\n";
} else {
    echo "[SKIP] 'photo_url' column already removed\n";
}

echo "\n=== Migration Complete ===\n";
