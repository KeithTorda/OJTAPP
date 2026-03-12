<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection unavailable. Please ensure MySQL is running."));
    exit();
}

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

// Fetch User Data
$user_query = "SELECT target_hours FROM users WHERE id = :user_id";
$user_stmt = $db->prepare($user_query);
$user_stmt->execute([':user_id' => $user_id]);
$user_data = $user_stmt->fetch(PDO::FETCH_ASSOC);
$target_hours = $user_data ? (int)$user_data['target_hours'] : 600;

// Read log records
$query = "SELECT id, task_desc, hours, log_date, day_number, week_number, created_at FROM ojt_logs WHERE user_id = :user_id ORDER BY log_date ASC, created_at ASC";
$stmt = $db->prepare($query);
$stmt->execute([':user_id' => $user_id]);

$num = $stmt->rowCount();
// Dynamic base URL — works on localhost and any live server
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
// Go up one dir from /endpoints to /api
$base_path = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/') . '/';
$base_url = $protocol . '://' . $host . $base_path;

if ($num > 0) {
    $logs_arr = array();
    $logs_arr["records"] = array();
    $total_hours = 0;
    $auto_day = 0;
    $last_date = null;

    // Fetch all photos grouped by log_id
    $photo_query = "SELECT lp.id, lp.log_id, lp.photo_url FROM log_photos lp 
                    INNER JOIN ojt_logs ol ON lp.log_id = ol.id 
                    WHERE ol.user_id = :user_id ORDER BY lp.created_at ASC";
    $photo_stmt = $db->prepare($photo_query);
    $photo_stmt->execute([':user_id' => $user_id]);
    $all_photos = $photo_stmt->fetchAll(PDO::FETCH_ASSOC);

    $photos_map = [];
    foreach ($all_photos as $p) {
        if (!isset($photos_map[$p['log_id']])) $photos_map[$p['log_id']] = [];
        $relative_path = $p['photo_url'];
        $file_path = __DIR__ . '/../' . $relative_path;
        $mime_type = file_exists($file_path) ? mime_content_type($file_path) : 'application/octet-stream';
        $photos_map[$p['log_id']][] = array(
            "id" => $p['id'],
            "url" => $base_url . $relative_path,
            "name" => basename($relative_path),
            "mime_type" => $mime_type,
            "is_image" => strpos((string)$mime_type, 'image/') === 0
        );
    }

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $total_hours += $hours;

        // Auto day counter as fallback
        if ($log_date !== $last_date) {
            $auto_day++;
            $last_date = $log_date;
        }

        $computed_week = ceil(($day_number ? (int)$day_number : $auto_day) / 5);
        $log_item = array(
            "id" => $id,
            "task_desc" => html_entity_decode($task_desc),
            "hours" => $hours,
            "log_date" => $log_date,
            "day_number" => $day_number ? (int)$day_number : $auto_day,
            "week_number" => $week_number ? (int)$week_number : $computed_week,
            "photos" => isset($photos_map[$id]) ? $photos_map[$id] : [],
            "created_at" => $created_at
        );
        array_push($logs_arr["records"], $log_item);
    }

    // Reverse for newest first
    $logs_arr["records"] = array_reverse($logs_arr["records"]);

    $logs_arr["summary"] = array(
        "total_hours" => $total_hours,
        "target_hours" => $target_hours,
        "count" => $num
    );

    http_response_code(200);
    echo json_encode($logs_arr);
} else {
    http_response_code(200);
    echo json_encode(array(
        "message" => "No logs found.",
        "records" => [],
        "summary" => array("total_hours" => 0, "target_hours" => $target_hours, "count" => 0)
    ));
}
?>
