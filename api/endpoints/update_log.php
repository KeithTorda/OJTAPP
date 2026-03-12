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
    echo json_encode(array("message" => "Database connection unavailable."));
    exit();
}

$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

if (strpos($contentType, 'multipart/form-data') !== false) {
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    $user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
    $task_desc = isset($_POST['task_desc']) ? $_POST['task_desc'] : null;
    $hours = isset($_POST['hours']) ? $_POST['hours'] : null;
    $log_date = isset($_POST['log_date']) ? $_POST['log_date'] : null;
    $day_number = isset($_POST['day_number']) && $_POST['day_number'] !== '' ? (int)$_POST['day_number'] : null;
    $week_number = isset($_POST['week_number']) && $_POST['week_number'] !== '' ? (int)$_POST['week_number'] : null;
    $remove_photo_ids = isset($_POST['remove_photo_ids']) ? $_POST['remove_photo_ids'] : '';
} else {
    $data = json_decode(file_get_contents("php://input"));
    $id = !empty($data->id) ? $data->id : null;
    $user_id = !empty($data->user_id) ? $data->user_id : null;
    $task_desc = !empty($data->task_desc) ? $data->task_desc : null;
    $hours = !empty($data->hours) ? $data->hours : null;
    $log_date = !empty($data->log_date) ? $data->log_date : null;
    $day_number = isset($data->day_number) ? (int)$data->day_number : null;
    $week_number = isset($data->week_number) ? (int)$data->week_number : null;
    $remove_photo_ids = isset($data->remove_photo_ids) ? $data->remove_photo_ids : '';
}

header("Content-Type: application/json; charset=UTF-8");

if (!empty($id) && !empty($user_id) && !empty($task_desc) && !empty($hours) && !empty($log_date)) {
    // Update log fields
    $task_desc = htmlspecialchars(strip_tags($task_desc));
    $query = "UPDATE ojt_logs SET task_desc=:task_desc, hours=:hours, log_date=:log_date, day_number=:day_number, week_number=:week_number WHERE id=:id AND user_id=:user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":task_desc", $task_desc);
    $stmt->bindParam(":hours", $hours);
    $stmt->bindParam(":log_date", $log_date);
    $stmt->bindParam(":day_number", $day_number);
    $stmt->bindParam(":week_number", $week_number);
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":user_id", $user_id);

    if ($stmt->execute()) {
        // Remove specified photos
        if (!empty($remove_photo_ids)) {
            $ids_to_remove = array_filter(explode(',', $remove_photo_ids), 'is_numeric');
            foreach ($ids_to_remove as $photo_id) {
                // Get file path and delete
                $pstmt = $db->prepare("SELECT photo_url FROM log_photos WHERE id = ? AND log_id = ?");
                $pstmt->execute([$photo_id, $id]);
                $prow = $pstmt->fetch(PDO::FETCH_ASSOC);
                if ($prow) {
                    $filepath = __DIR__ . '/../' . $prow['photo_url'];
                    if (file_exists($filepath)) unlink($filepath);
                    $db->prepare("DELETE FROM log_photos WHERE id = ?")->execute([$photo_id]);
                }
            }
        }

        // Handle new attachment uploads
        $uploaded = 0;
        error_log("UPDATE: Received files: " . (isset($_FILES['photos']) ? print_r($_FILES['photos'], true) : "none"));
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
                if (move_uploaded_file($tmp, $uploadDir . $filename)) {
                    $db->prepare("INSERT INTO log_photos (log_id, photo_url) VALUES (?, ?)")->execute([$id, 'uploads/' . $filename]);
                    $uploaded++;
                }
            }
        }

        http_response_code(200);
        echo json_encode(array("message" => "Log updated successfully.", "photos_added" => $uploaded));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update log."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
