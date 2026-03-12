<?php
// API Endpoint: Update Target Hours
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
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
    http_response_code(500);
    echo json_encode(array("message" => "Database connection unavailable. Please ensure MySQL is running."));
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->user_id) && isset($data->target_hours)) {
    $query = "UPDATE users SET target_hours = :target_hours WHERE id = :user_id";
    $stmt = $db->prepare($query);

    $target_hours = (int) htmlspecialchars(strip_tags($data->target_hours));
    $user_id = (int) htmlspecialchars(strip_tags($data->user_id));

    $stmt->bindParam(':target_hours', $target_hours);
    $stmt->bindParam(':user_id', $user_id);

    if($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Target hours updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update target hours."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data. User ID and target_hours required."));
}
?>
