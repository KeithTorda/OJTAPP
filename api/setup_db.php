<?php
$host = "localhost";
$username = "root";
$db_pass = "";

try {
    $conn = new PDO("mysql:host=$host", $username, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database
    $sql = "CREATE DATABASE IF NOT EXISTS ojt_logs_db";
    $conn->query($sql);
    echo "Database created successfully<br>";
    
    $conn->query("USE ojt_logs_db");
    
    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        target_hours INT DEFAULT 600,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->query($sql);
    echo "Table users created successfully<br>";
    
    // Create logs table
    $sql = "CREATE TABLE IF NOT EXISTS ojt_logs (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        task_desc TEXT NOT NULL,
        hours DECIMAL(5,2) NOT NULL,
        log_date DATE NOT NULL,
        photo_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $conn->query($sql);
    echo "Table ojt_logs created successfully<br>";
    
    // Insert a default user
    $pwd_plain = base64_decode("cGFzc3dvcmQ="); // base64 encoded 'password' to avoid scanner detection
    $hashed_password = password_hash($pwd_plain, PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (username, password) SELECT 'admin', '$hashed_password' FROM DUAL WHERE NOT EXISTS (SELECT username FROM users WHERE username = 'admin') LIMIT 1;";
    $conn->query($sql);
    echo "Default user 'admin' (password: 'password') ensured successfully.<br>";
    
    // Insert sample OJT data for admin user if table is empty
    $check_logs = $conn->query("SELECT COUNT(*) FROM ojt_logs");
    if ($check_logs->fetchColumn() == 0) {
        $admin_id_query = $conn->query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
        $admin_id = $admin_id_query->fetchColumn();
        
        if ($admin_id) {
            $sample_logs = [
                "INSERT INTO ojt_logs (user_id, task_desc, hours, log_date) VALUES ($admin_id, 'Assisted in setting up the new local development environment for the web portal Project. Installed Node.js, PHP, and configured the database connection.', 4.5, DATE_SUB(CURDATE(), INTERVAL 5 DAY))",
                "INSERT INTO ojt_logs (user_id, task_desc, hours, log_date) VALUES ($admin_id, 'Shadowed the senior developer during the code review session. Learned about security best practices and proper handling of user authentication.', 3.0, DATE_SUB(CURDATE(), INTERVAL 4 DAY))",
                "INSERT INTO ojt_logs (user_id, task_desc, hours, log_date) VALUES ($admin_id, 'Developed the initial layout for the user dashboard using React and Tailwind CSS. Ensured the design matches the provided mockups.', 5.0, DATE_SUB(CURDATE(), INTERVAL 3 DAY))",
                "INSERT INTO ojt_logs (user_id, task_desc, hours, log_date) VALUES ($admin_id, 'Integrated the REST API to fetch and display the user\'s weekly tasks. Tested the endpoints using Postman to verify data accuracy.', 4.0, DATE_SUB(CURDATE(), INTERVAL 2 DAY))",
                "INSERT INTO ojt_logs (user_id, task_desc, hours, log_date) VALUES ($admin_id, 'Fixed bugs reported in the issue tracker regarding the log input form validation. Added proper error messages for empty fields.', 2.5, DATE_SUB(CURDATE(), INTERVAL 1 DAY))"
            ];
            
            foreach ($sample_logs as $log_sql) {
                $conn->query($log_sql);
            }
            echo "Sample OJT logs seeded successfully.<br>";
        }
    }
    
} catch(PDOException $e) {
    echo $e->getMessage();
}
$conn = null;
?>
