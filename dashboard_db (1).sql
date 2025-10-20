-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 20, 2025 at 11:53 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dashboard_db`
--
CREATE DATABASE IF NOT EXISTS `dashboard_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `dashboard_db`;

-- --------------------------------------------------------

--
-- Table structure for table `event_logs`
--

CREATE TABLE `event_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` enum('signup','login','purchase','page_view') NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_logs`
--

INSERT INTO `event_logs` (`id`, `user_id`, `type`, `created_at`) VALUES
(1, 1, 'signup', '2025-01-10 10:05:00'),
(2, 2, 'signup', '2025-02-05 14:35:00'),
(3, 3, 'signup', '2025-03-12 09:10:00'),
(4, 4, 'signup', '2025-04-22 16:25:00'),
(5, 5, 'signup', '2025-05-15 11:50:00'),
(6, 1, 'login', '2025-10-10 08:45:00'),
(7, 2, 'login', '2025-10-19 12:00:00'),
(8, 3, 'login', '2025-09-29 09:15:00'),
(9, 5, 'login', '2025-10-18 10:00:00'),
(10, 1, 'purchase', '2025-05-01 14:15:00'),
(11, 2, 'purchase', '2025-05-15 11:40:00'),
(12, 3, 'purchase', '2025-06-20 09:30:00'),
(13, 1, 'purchase', '2025-07-05 17:00:00'),
(14, 5, 'purchase', '2025-08-12 13:00:00'),
(15, 2, 'purchase', '2025-09-02 10:30:00'),
(16, 3, 'purchase', '2025-10-05 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `created_at`) VALUES
(1, 1, 350.00, 'completed', '2025-05-01 14:15:00'),
(2, 2, 610.00, 'completed', '2025-05-15 11:40:00'),
(3, 3, 280.00, 'completed', '2025-06-20 09:30:00'),
(4, 1, 470.00, 'completed', '2025-07-05 17:00:00'),
(5, 5, 120.00, 'completed', '2025-08-12 13:00:00'),
(6, 2, 670.00, 'completed', '2025-09-02 10:30:00'),
(7, 3, 490.00, 'pending', '2025-10-05 12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`) VALUES
(1, 1, 1, 1, 350.00),
(2, 2, 2, 1, 490.00),
(3, 2, 5, 1, 120.00),
(4, 3, 3, 1, 280.00),
(5, 4, 1, 1, 350.00),
(6, 4, 4, 1, 120.00),
(7, 5, 5, 1, 120.00),
(8, 6, 2, 1, 490.00),
(9, 6, 3, 1, 180.00),
(10, 7, 2, 1, 490.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `name`, `price`, `created_at`, `is_active`) VALUES
(1, 'P001', 'Abstract Painting – Blue Horizon', 350.00, '2024-12-15 10:00:00', 1),
(2, 'P002', 'Modern Sculpture – The Flow', 490.00, '2025-01-12 11:00:00', 1),
(3, 'P003', 'Canvas – Red Silence', 280.00, '2025-02-08 13:00:00', 1),
(4, 'P004', 'Mini Painting – Green Reflection', 180.00, '2025-03-21 15:00:00', 1),
(5, 'P005', 'Limited Edition Print – Vienna Night', 120.00, '2025-04-05 09:30:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`, `last_login_at`, `is_active`) VALUES
(1, 'anna.mueller@example.com', 'hashedpass', '2025-01-10 10:00:00', '2025-10-10 08:45:00', 1),
(2, 'markus.schmidt@example.com', 'hashedpass', '2025-02-05 14:30:00', '2025-10-19 12:00:00', 1),
(3, 'sabine.fischer@example.com', 'hashedpass', '2025-03-12 09:00:00', '2025-09-29 09:15:00', 1),
(4, 'lukas.wagner@example.com', 'hashedpass', '2025-04-22 16:20:00', NULL, 1),
(5, 'sophie.huber@example.com', 'hashedpass', '2025-05-15 11:45:00', '2025-10-18 10:00:00', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `event_logs`
--
ALTER TABLE `event_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `event_logs`
--
ALTER TABLE `event_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `event_logs`
--
ALTER TABLE `event_logs`
  ADD CONSTRAINT `event_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
