-- phpMyAdmin SQL Dump
-- version 5.3.0-dev+20221010.6785c97d22
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2023 at 12:55 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `palkkatuki`
--

-- --------------------------------------------------------

--
-- Table structure for table `painike`
--

CREATE TABLE `painike` (
  `id` int(11) NOT NULL,
  `sisalto_id` int(11) NOT NULL,
  `nimi` varchar(255) NOT NULL,
  `destination_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `runko`
--

CREATE TABLE `runko` (
  `id` int(11) NOT NULL,
  `nimike` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sisalto`
--

CREATE TABLE `sisalto` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `runko_id` int(11) DEFAULT NULL,
  `otsikko` varchar(250) NOT NULL,
  `kentta` longtext DEFAULT NULL,
  `jarjestysNro` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `painike`
--
ALTER TABLE `painike`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `runko`
--
ALTER TABLE `runko`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sisalto`
--
ALTER TABLE `sisalto`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `painike`
--
ALTER TABLE `painike`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `runko`
--
ALTER TABLE `runko`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=275;

--
-- AUTO_INCREMENT for table `sisalto`
--
ALTER TABLE `sisalto`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=276;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
