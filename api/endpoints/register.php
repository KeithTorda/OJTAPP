<?php
// API Endpoint: Create a new User
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

if(
    !empty($data->username) &&
    !empty($data->password)
) {
    // Check if username already exists
    $check_query = "SELECT id FROM users WHERE username = :username LIMIT 0,1";
    $check_stmt = $db->prepare($check_query);
    $check_username = htmlspecialchars(strip_tags($data->username));
    $check_stmt->bindParam(':username', $check_username);
    $check_stmt->execute();
    
    if($check_stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "Trainee Node (Username) already exists."));
        exit();
    }

    $query = "INSERT INTO users SET username=:username, password=:password";
    $stmt = $db->prepare($query);

    // Sanitize
    $username = htmlspecialchars(strip_tags($data->username));
    
    // Hash password
    $password = password_hash($data->password, PASSWORD_DEFAULT);

    // Bind parameters
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":password", $password);

    if($stmt->execute()) {
        http_response_code(201); // Created
        // Fetch the newly created user ID
        $new_user_id = $db->lastInsertId();
        
        echo json_encode(array(
            "message" => "Trainee profile successfully initiated.",
            "user" => array(
                "id" => $new_user_id,
                "username" => $username
            )
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create profile."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data. Username and Password required."));
}
?>
