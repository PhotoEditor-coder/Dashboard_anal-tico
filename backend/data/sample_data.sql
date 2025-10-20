-- Base de datos para Dashboard Analítico
-- Datos de ejemplo para demostrar capacidades

CREATE DATABASE IF NOT EXISTS dashboard_db;
USE dashboard_db;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'user', 'moderator') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de ventas
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    category VARCHAR(50),
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de logs del sistema
CREATE TABLE system_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de adopciones (para el ejemplo de pets)
CREATE TABLE adoptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    pet_name VARCHAR(100) NOT NULL,
    pet_type VARCHAR(50),
    adoption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'completed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insertar datos de ejemplo

-- Usuarios
INSERT INTO users (name, email, role, last_login, is_active) VALUES
('Ana García', 'ana@example.com', 'admin', '2024-01-15 10:30:00', TRUE),
('Carlos López', 'carlos@example.com', 'user', '2024-01-14 15:45:00', TRUE),
('María Rodríguez', 'maria@example.com', 'moderator', '2024-01-13 09:20:00', TRUE),
('Juan Pérez', 'juan@example.com', 'user', '2024-01-12 14:15:00', TRUE),
('Laura Martín', 'laura@example.com', 'user', '2024-01-11 11:30:00', TRUE),
('Pedro Sánchez', 'pedro@example.com', 'user', '2024-01-10 16:45:00', FALSE),
('Sofia Herrera', 'sofia@example.com', 'user', '2024-01-09 13:20:00', TRUE),
('Miguel Torres', 'miguel@example.com', 'moderator', '2024-01-08 08:15:00', TRUE);

-- Ventas
INSERT INTO sales (user_id, product_name, amount, quantity, category, sale_date) VALUES
(1, 'Premium Plan', 99.99, 1, 'subscription', '2024-01-15 10:30:00'),
(2, 'Basic Plan', 29.99, 1, 'subscription', '2024-01-14 15:45:00'),
(3, 'Premium Plan', 99.99, 1, 'subscription', '2024-01-13 09:20:00'),
(4, 'Add-on Feature', 19.99, 2, 'addon', '2024-01-12 14:15:00'),
(5, 'Basic Plan', 29.99, 1, 'subscription', '2024-01-11 11:30:00'),
(1, 'Enterprise Plan', 299.99, 1, 'subscription', '2024-01-10 16:45:00'),
(6, 'Basic Plan', 29.99, 1, 'subscription', '2024-01-09 13:20:00'),
(7, 'Premium Plan', 99.99, 1, 'subscription', '2024-01-08 08:15:00'),
(8, 'Add-on Feature', 19.99, 1, 'addon', '2024-01-07 12:30:00'),
(2, 'Premium Plan', 99.99, 1, 'subscription', '2024-01-06 17:45:00'),
(3, 'Basic Plan', 29.99, 1, 'subscription', '2024-01-05 14:20:00'),
(4, 'Enterprise Plan', 299.99, 1, 'subscription', '2024-01-04 11:15:00'),
(5, 'Add-on Feature', 19.99, 3, 'addon', '2024-01-03 16:30:00'),
(1, 'Basic Plan', 29.99, 1, 'subscription', '2024-01-02 09:45:00'),
(6, 'Premium Plan', 99.99, 1, 'subscription', '2024-01-01 13:20:00');

-- Logs del sistema
INSERT INTO system_logs (user_id, action, description, ip_address) VALUES
(1, 'login', 'Usuario inició sesión', '192.168.1.100'),
(2, 'purchase', 'Compra realizada: Basic Plan', '192.168.1.101'),
(3, 'login', 'Usuario inició sesión', '192.168.1.102'),
(1, 'admin_action', 'Configuración del sistema modificada', '192.168.1.100'),
(4, 'purchase', 'Compra realizada: Add-on Feature', '192.168.1.103'),
(5, 'login', 'Usuario inició sesión', '192.168.1.104'),
(2, 'profile_update', 'Perfil de usuario actualizado', '192.168.1.101'),
(3, 'logout', 'Usuario cerró sesión', '192.168.1.102'),
(6, 'login', 'Usuario inició sesión', '192.168.1.105'),
(7, 'purchase', 'Compra realizada: Premium Plan', '192.168.1.106'),
(8, 'login', 'Usuario inició sesión', '192.168.1.107'),
(1, 'admin_action', 'Nuevo usuario registrado', '192.168.1.100'),
(4, 'logout', 'Usuario cerró sesión', '192.168.1.103'),
(5, 'profile_update', 'Perfil de usuario actualizado', '192.168.1.104'),
(2, 'login', 'Usuario inició sesión', '192.168.1.101');

-- Adopciones
INSERT INTO adoptions (user_id, pet_name, pet_type, adoption_date, status) VALUES
(2, 'Max', 'Perro', '2024-01-14 15:45:00', 'completed'),
(4, 'Luna', 'Gato', '2024-01-12 14:15:00', 'completed'),
(5, 'Rocky', 'Perro', '2024-01-11 11:30:00', 'approved'),
(7, 'Mittens', 'Gato', '2024-01-08 08:15:00', 'pending'),
(3, 'Buddy', 'Perro', '2024-01-07 12:30:00', 'completed'),
(6, 'Whiskers', 'Gato', '2024-01-06 17:45:00', 'approved'),
(1, 'Charlie', 'Perro', '2024-01-05 14:20:00', 'completed'),
(8, 'Shadow', 'Gato', '2024-01-04 11:15:00', 'pending'),
(2, 'Bella', 'Perro', '2024-01-03 16:30:00', 'completed'),
(4, 'Simba', 'Gato', '2024-01-02 09:45:00', 'approved');
