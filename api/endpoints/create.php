<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode(array("message" => "Database connection unavailable. Please ensure MySQL is running."));
    exit();
}

// Support both JSON and multipart/form-data
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

if (strpos($contentType, 'multipart/form-data') !== false) {
    $user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
    $task_desc = isset($_POST['task_desc']) ? $_POST['task_desc'] : null;
    $hours = isset($_POST['hours']) ? $_POST['hours'] : null;
    $log_date = isset($_POST['log_date']) ? $_POST['log_date'] : null;
    $day_number = isset($_POST['day_number']) && $_POST['day_number'] !== '' ? (int)$_POST['day_number'] : null;
    $week_number = isset($_POST['week_number']) && $_POST['week_number'] !== '' ? (int)$_POST['week_number'] : null;
} else {
    $data = json_decode(file_get_contents("php://input"));
    $user_id = !empty($data->user_id) ? $data->user_id : null;
    $task_desc = !empty($data->task_desc) ? $data->task_desc : null;
    $hours = !empty($data->hours) ? $data->hours : null;
    $log_date = !empty($data->log_date) ? $data->log_date : null;
    $day_number = isset($data->day_number) ? (int)$data->day_number : null;
    $week_number = isset($data->week_number) ? (int)$data->week_number : null;
}

header("Content-Type: application/json; charset=UTF-8");

if (!empty($user_id) && !empty($task_desc) && !empty($hours) && !empty($log_date)) {
    $query = "INSERT INTO ojt_logs SET user_id=:user_id, task_desc=:task_desc, hours=:hours, log_date=:log_date, day_number=:day_number, week_number=:week_number";
    $stmt = $db->prepare($query);

    $task_desc = htmlspecialchars(strip_tags($task_desc));

    $stmt->bindParam(":user_id", $user_id);
    $stmt->bindParam(":task_desc", $task_desc);
    $stmt->bindParam(":hours", $hours);
    $stmt->bindParam(":log_date", $log_date);
    $stmt->bindParam(":day_number", $day_number);
    $stmt->bindParam(":week_number", $week_number);

    if ($stmt->execute()) {
        $log_id = $db->lastInsertId();
        $uploaded_photos = [];

        // Handle multiple attachment uploads
        error_log("CREATE: Received files: " . (isset($_FILES['photos']) ? print_r($_FILES['photos'], true) : "none"));
        if (isset($_FILES['photos'])) {
            $files = $_FILES['photos'];
            $maxSize = 15 * 1024 * 1024;
            $uploadDir = __DIR__ . '/../uploads/';
            $blockedExtensions = ['php', 'php3', 'php4', 'php5', 'phtml', 'phar', 'exe', 'bat', 'cmd', 'com', 'js', 'jsp', 'asp', 'aspx', 'sh', 'cgi', 'pl'];

            $fileCount = is_array($files['name']) ? count($files['name']) : 1;

            for ($i = 0; $i < $fileCount; $i++) {
                $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                $tmp = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $size = is_array($files['size']) ? $files['size'][$i] : $files['size'];
                $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];

                if ($error !== UPLOAD_ERR_OK || $size > $maxSize) continue;

                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
                if (in_array($ext, $blockedExtensions, true)) continue;

                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $tmp);
                finfo_close($finfo);
                if ($mimeType === false) $mimeType = 'application/octet-stream';

                $safeExt = $ext !== '' ? $ext : 'bin';
                $filename = 'log_' . $user_id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $safeExt;
                $uploadPath = $uploadDir . $filename;

                if (move_uploaded_file($tmp, $uploadPath)) {
                    $photo_url = 'uploads/' . $filename;
                    $photo_stmt = $db->prepare("INSERT INTO log_photos (log_id, photo_url) VALUES (?, ?)");
                    $photo_stmt->execute([$log_id, $photo_url]);
                    $uploaded_photos[] = $photo_url;
                }
            }
        }

        http_response_code(201);
        echo json_encode(array(
            "message" => "Log was created.",
            "log_id" => $log_id,
            "photos_uploaded" => count($uploaded_photos)
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create log."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create log. Data is incomplete."));
}
?>
