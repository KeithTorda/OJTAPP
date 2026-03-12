<?php
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

if (!empty($data->id) && !empty($data->user_id)) {
    $query = "DELETE FROM ojt_logs WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);

    $stmt->bindParam(":id", $data->id);
    $stmt->bindParam(":user_id", $data->user_id);

    if ($stmt->execute() && $stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(array("message" => "Log was deleted."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete log or it does not exist."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete log. Data is incomplete."));
}
?>
