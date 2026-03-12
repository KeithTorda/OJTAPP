<?php
class Database {
    private $host = "localhost";
    private $db_name = "u525340418_ojt";
    private $username = "u525340418_ojt";
    private $password = "Keith082703.1";
    public $conn;

    public function getConnection() {
        // Set PHP Default Timezone to Philippine Standard Time (UTC+8)
        date_default_timezone_set('Asia/Manila');

        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Set MySQL Connection Timezone to match PHT (+08:00)
            $this->conn->exec("SET time_zone = '+08:00'");
            
        } catch(PDOException $exception) {
            // error_log("Connection error: " . $exception->getMessage());
            $this->conn = null;
        }

        return $this->conn;
    }
}
?>
