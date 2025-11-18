<?php
// backend/config/database.php

class Database {
    private $host = 'localhost';
    private $db_name = 'dashboard_db';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';

    public function getConnection() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ];
            return new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => 'Database connection failed'
            ]);
            exit;
        }
    }
}
