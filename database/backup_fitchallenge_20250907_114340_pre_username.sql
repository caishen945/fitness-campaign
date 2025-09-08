/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.8-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: fitchallenge
-- ------------------------------------------------------
-- Server version	11.4.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `fitchallenge`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `fitchallenge` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `fitchallenge`;

--
-- Table structure for table `achievement_types`
--

DROP TABLE IF EXISTS `achievement_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievement_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '成就类型名称',
  `code` varchar(50) NOT NULL COMMENT '成就类型代码',
  `description` text DEFAULT NULL COMMENT '成就类型描述',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement_types`
--

LOCK TABLES `achievement_types` WRITE;
/*!40000 ALTER TABLE `achievement_types` DISABLE KEYS */;
INSERT INTO `achievement_types` VALUES
(1,'团队人数成就','team_size','团队成员数量达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',1,1),
(2,'团队参与挑战人数成就','team_challenge_participants','团队中参与挑战的人数达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',2,1),
(3,'VIP挑战完成次数成就','vip_challenge_completions','完成VIP挑战的次数达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',3,1),
(4,'累计步数成就','total_steps','累计步数达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',4,1),
(5,'连续签到成就','consecutive_checkins','连续签到天数达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',5,1),
(6,'PK挑战胜利次数成就','pk_challenge_wins','PK挑战胜利次数达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',6,1),
(7,'注册时长成就','registration_duration','注册账号时长达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',7,1),
(8,'挑战参与度成就','challenge_participation','参与挑战次数达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',8,1),
(9,'钱包余额成就','wallet_balance','累计获得USDT数量达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',9,1),
(10,'运动习惯成就','exercise_habits','连续运动天数达到指定目标','2025-08-18 05:41:20','2025-08-18 06:26:57',10,1);
/*!40000 ALTER TABLE `achievement_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `target_value` int(11) NOT NULL,
  `reward_amount` decimal(10,2) DEFAULT 0.00,
  `reward_type` enum('usdt','points','badge') DEFAULT 'usdt',
  `icon` varchar(100) DEFAULT 'trophy',
  `color` varchar(20) DEFAULT '#FFD700',
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `achievement_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES
(4,1,'团队新秀','团队A级注册达到15人',15,2.00,'usdt','users','#4caf50',1,1,'2025-08-18 06:39:39','2025-08-21 07:32:08'),
(5,1,'团队精英','团队成员达到50人',50,20.00,'usdt','users','#2196F3',1,2,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(6,1,'团队领袖','团队成员达到100人',100,50.00,'usdt','users','#9C27B0',1,3,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(7,2,'挑战先锋','团队中10人参与挑战',10,3.00,'usdt','running','#FF9800',1,4,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(8,2,'挑战军团','团队中50人参与挑战',50,15.00,'usdt','running','#E91E63',1,5,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(9,2,'挑战帝国','团队中100人参与挑战',100,40.00,'usdt','running','#607D8B',1,6,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(10,3,'挑战新手','完成1次VIP挑战',1,1.00,'usdt','star','#4CAF50',1,7,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(11,3,'挑战达人','完成10次VIP挑战',10,5.00,'usdt','star','#2196F3',1,8,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(12,3,'挑战专家','完成50次VIP挑战',50,20.00,'usdt','star','#FF9800',1,9,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(13,3,'挑战大师','完成100次VIP挑战',100,50.00,'usdt','star','#9C27B0',1,10,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(14,4,'健身新手','累计步数达到1000步',1000,2.00,'usdt','walking','#4CAF50',1,11,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(15,4,'健身达人','累计步数达到5000步',5000,8.00,'usdt','walking','#2196F3',1,12,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(16,4,'健身专家','累计步数达到10000步',10000,20.00,'usdt','walking','#FF9800',1,13,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(17,5,'签到新手','连续签到10天',10,3.00,'usdt','calendar-check','#4CAF50',1,14,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(18,5,'签到达人','连续签到20天',20,8.00,'usdt','calendar-check','#2196F3',1,15,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(19,5,'签到专家','连续签到30天',30,20.00,'usdt','calendar-check','#FF9800',1,16,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(20,6,'PK新手','PK挑战胜利10次',10,5.00,'usdt','fist-raised','#4CAF50',1,17,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(21,6,'常胜将军','PK挑战胜利20次',20,15.00,'usdt','fist-raised','#2196F3',1,18,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(22,6,'PK王者','PK挑战胜利30次',30,30.00,'usdt','fist-raised','#FF9800',1,19,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(23,7,'新用户','注册账号7天',7,1.00,'usdt','clock','#4CAF50',1,20,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(24,7,'忠实用户','注册账号30天',30,5.00,'usdt','clock','#2196F3',1,21,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(25,7,'资深用户','注册账号100天',100,15.00,'usdt','clock','#FF9800',1,22,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(26,7,'元老用户','注册账号365天',365,50.00,'usdt','clock','#9C27B0',1,23,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(27,8,'参与新手','参与挑战5次',5,2.00,'usdt','play','#4CAF50',1,24,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(28,8,'参与达人','参与挑战20次',20,8.00,'usdt','play','#2196F3',1,25,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(29,8,'参与专家','参与挑战50次',50,20.00,'usdt','play','#FF9800',1,26,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(30,9,'财富新手','累计获得100USDT',100,5.00,'usdt','wallet','#4CAF50',1,27,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(31,9,'财富达人','累计获得500USDT',500,20.00,'usdt','wallet','#2196F3',1,28,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(32,9,'财富专家','累计获得1000USDT',1000,50.00,'usdt','wallet','#FF9800',1,29,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(33,10,'习惯新手','连续运动7天',7,3.00,'usdt','heart','#4CAF50',1,30,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(34,10,'习惯达人','连续运动30天',30,10.00,'usdt','heart','#2196F3',1,31,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(35,10,'习惯专家','连续运动100天',100,30.00,'usdt','heart','#FF9800',1,32,'2025-08-18 06:39:39','2025-08-18 06:39:39'),
(36,1,'团队之魂','邀请注册人数达到 600人',600,50.00,'usdt','users','#ffd700',1,33,'2025-08-18 07:50:17','2025-08-20 06:56:59');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_audit_logs`
--

DROP TABLE IF EXISTS `admin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_ip_address` (`ip_address`),
  CONSTRAINT `admin_audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_logs`
--

LOCK TABLES `admin_audit_logs` WRITE;
/*!40000 ALTER TABLE `admin_audit_logs` DISABLE KEYS */;
INSERT INTO `admin_audit_logs` VALUES
(1,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-24 11:25:22'),
(2,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-08-25 11:15:53'),
(3,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-08-25 11:16:02'),
(4,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-08-25 12:03:10'),
(5,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-08-25 12:07:33'),
(6,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-08-25 12:08:19'),
(7,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-08-25 12:11:15'),
(8,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-08-25 12:21:25'),
(9,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-26 06:15:34'),
(10,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-26 11:31:07'),
(11,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-27 11:46:14'),
(12,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-27 12:05:48'),
(13,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-27 12:29:24'),
(14,1,'TEST_LOGIN','{\"test\":true}','127.0.0.1',NULL,'2025-08-28 09:13:48'),
(15,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"127.0.0.1\"}','127.0.0.1',NULL,'2025-08-28 09:13:48'),
(16,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-28 09:26:45'),
(17,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\"}','::1',NULL,'2025-08-28 09:38:05'),
(18,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-28 10:03:53'),
(19,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\"}','::1',NULL,'2025-08-28 13:07:24'),
(20,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-29 13:02:07'),
(21,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-08-30 14:01:58'),
(22,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-09-02 14:14:04'),
(23,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-02 14:17:37'),
(24,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-09-02 14:39:53'),
(25,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"axios/1.11.0\"}','::1',NULL,'2025-09-03 00:23:17'),
(26,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"axios/1.11.0\"}','::1',NULL,'2025-09-03 00:26:38'),
(27,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-09-03 00:30:16'),
(28,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"axios/1.11.0\"}','::1',NULL,'2025-09-03 00:31:36'),
(29,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"axios/1.11.0\"}','::1',NULL,'2025-09-03 00:33:52'),
(30,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"axios/1.11.0\"}','::1',NULL,'2025-09-03 00:39:54'),
(31,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-03 06:47:44'),
(32,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 QuarkPC/4.4.0.495\"}','::1',NULL,'2025-09-03 07:00:52'),
(33,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 QuarkPC/4.4.0.495\"}','::1',NULL,'2025-09-03 07:11:54'),
(34,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\"}','::1',NULL,'2025-09-03 09:44:55'),
(35,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-03 15:06:11'),
(36,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-04 05:30:45'),
(37,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; zh-CN) WindowsPowerShell/5.1.22621.4391\"}','::1',NULL,'2025-09-04 05:48:51'),
(38,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-04 05:52:21'),
(39,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::ffff:127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 QuarkPC/4.4.0.495\"}','::ffff:127.0.0.1',NULL,'2025-09-04 06:01:24'),
(40,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-04 06:41:33'),
(41,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0\"}','::1',NULL,'2025-09-04 10:18:04'),
(42,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\"}','::1',NULL,'2025-09-05 05:49:41'),
(43,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\"}','::1',NULL,'2025-09-05 05:50:06'),
(44,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\"}','::1',NULL,'2025-09-05 05:50:39'),
(45,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.22631; zh-CN) PowerShell/7.5.2\"}','::1',NULL,'2025-09-06 14:55:20'),
(46,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.22631; zh-CN) PowerShell/7.5.2\"}','::1',NULL,'2025-09-06 14:55:28'),
(47,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.22631; zh-CN) PowerShell/7.5.2\"}','::1',NULL,'2025-09-06 14:55:32'),
(48,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-06 16:06:14'),
(49,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 QuarkPC/4.4.5.497\"}','::1',NULL,'2025-09-06 17:03:25'),
(50,7,'ADMIN_LOGIN','{\"username\":\"admin\",\"ip\":\"::1\",\"userAgent\":\"node-fetch\"}','::1',NULL,'2025-09-07 02:52:59'),
(51,1,'ADMIN_LOGIN','{\"username\":\"superadmin\",\"ip\":\"::1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36\"}','::1',NULL,'2025-09-07 02:53:40');
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_permissions`
--

DROP TABLE IF EXISTS `admin_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_role_permissions`
--

DROP TABLE IF EXISTS `admin_role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('super_admin','admin','moderator') NOT NULL,
  `permission_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role`,`permission_id`),
  KEY `idx_role` (`role`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `admin_role_permissions_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `admin_permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_role_permissions`
--

LOCK TABLES `admin_role_permissions` WRITE;
/*!40000 ALTER TABLE `admin_role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_sessions`
--

DROP TABLE IF EXISTS `admin_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_sessions` (
  `id` varchar(255) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `last_activity` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_sessions`
--

LOCK TABLES `admin_sessions` WRITE;
/*!40000 ALTER TABLE `admin_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES
(1,'superadmin','$2a$12$TmfMh2tktN20pUZ/.dOt5uBCRD5jy6.GsnkAln3jACNnoMZn1v1x.','admin@fitchallenge.com','super_admin','[\"*\"]',1,'2025-09-07 10:53:40','2025-08-18 14:28:49','2025-09-07 02:53:40'),
(2,'moderator','$2a$12$umHYrjDLbyOA2Vys0yfcduz61PeAFhxOFzYTNAhWf0dz4MyfKuZMi','moderator@fitchallenge.com','moderator','[\"user:read\",\"checkin:read\",\"achievement:read\"]',1,NULL,'2025-08-18 14:28:49','2025-08-26 06:14:47'),
(7,'admin','$2a$10$PKTVduu2ILYmB107.C2UfeMl.GE88IgATj1tH98pH/LQrZgNnvfrm',NULL,'admin','[\"all\"]',1,'2025-09-07 10:52:59','2025-09-02 14:13:57','2025-09-07 02:52:59');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `challenges`
--

DROP TABLE IF EXISTS `challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `points_reward` int(11) DEFAULT 0,
  `duration_days` int(11) DEFAULT 30,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challenges`
--

LOCK TABLES `challenges` WRITE;
/*!40000 ALTER TABLE `challenges` DISABLE KEYS */;
/*!40000 ALTER TABLE `challenges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkins`
--

DROP TABLE IF EXISTS `checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `checkin_date` date NOT NULL,
  `points_earned` int(11) DEFAULT 10,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`checkin_date`),
  CONSTRAINT `checkins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkins`
--

LOCK TABLES `checkins` WRITE;
/*!40000 ALTER TABLE `checkins` DISABLE KEYS */;
/*!40000 ALTER TABLE `checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_records`
--

DROP TABLE IF EXISTS `commission_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commission_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID who receives commission',
  `from_user_id` int(11) NOT NULL COMMENT 'User ID who generates commission',
  `vip_challenge_id` int(11) NOT NULL COMMENT 'VIP challenge ID',
  `challenge_reward` decimal(10,2) NOT NULL COMMENT 'Challenge reward amount',
  `commission_rate` decimal(5,4) NOT NULL COMMENT 'Commission rate',
  `commission_amount` decimal(10,2) NOT NULL COMMENT 'Commission amount',
  `level` int(11) NOT NULL COMMENT 'Commission level',
  `status` enum('pending','paid','failed') DEFAULT 'pending' COMMENT 'Commission status',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `paid_at` timestamp NULL DEFAULT NULL COMMENT 'Payment time',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_from_user_id` (`from_user_id`),
  KEY `idx_vip_challenge_id` (`vip_challenge_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Commission records table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_records`
--

LOCK TABLES `commission_records` WRITE;
/*!40000 ALTER TABLE `commission_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `commission_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deposit_orders`
--

DROP TABLE IF EXISTS `deposit_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `deposit_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_method` enum('trc20','erc20','admin','system') NOT NULL,
  `trx_hash` varchar(255) DEFAULT NULL,
  `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `deposit_orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deposit_orders`
--

LOCK TABLES `deposit_orders` WRITE;
/*!40000 ALTER TABLE `deposit_orders` DISABLE KEYS */;
INSERT INTO `deposit_orders` VALUES
(3,'DEP1756120857778QZLNB',1,100.00,'admin',NULL,'completed',NULL,NULL,'2025-08-25 11:20:57','2025-08-25 11:20:57'),
(4,'DEP1756912846352939Q4',1,10.00,'admin',NULL,'completed',NULL,NULL,'2025-09-03 15:20:46','2025-09-03 15:20:46'),
(5,'DEP20250903709750YOVU9C',33,100.00,'trc20',NULL,'pending','??????',NULL,'2025-09-03 19:45:09','2025-09-03 19:45:09'),
(6,'DEP20250903715436XOZSBP',33,100.00,'trc20',NULL,'pending','??????',NULL,'2025-09-03 19:45:15','2025-09-03 19:45:15'),
(7,'DEP202509038327577CAEQR',33,100.00,'trc20',NULL,'pending','用户充值申请',NULL,'2025-09-03 19:47:12','2025-09-03 19:47:12');
/*!40000 ALTER TABLE `deposit_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitation_records`
--

DROP TABLE IF EXISTS `invitation_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitation_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inviter_id` int(11) NOT NULL COMMENT 'Inviter ID',
  `invitee_id` int(11) NOT NULL COMMENT 'Invitee ID',
  `invitation_code` varchar(50) NOT NULL COMMENT 'Invitation code',
  `level` int(11) NOT NULL DEFAULT 1 COMMENT 'Invitation level',
  `status` enum('pending','completed','expired') DEFAULT 'pending' COMMENT 'Invitation status',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL COMMENT 'Completion time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invitation` (`inviter_id`,`invitee_id`),
  KEY `idx_inviter_id` (`inviter_id`),
  KEY `idx_invitee_id` (`invitee_id`),
  KEY `idx_invitation_code` (`invitation_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Invitation records table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation_records`
--

LOCK TABLES `invitation_records` WRITE;
/*!40000 ALTER TABLE `invitation_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `invitation_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitation_rewards`
--

DROP TABLE IF EXISTS `invitation_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitation_rewards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID who receives reward',
  `invited_user_id` int(11) NOT NULL COMMENT 'Invited user ID',
  `reward_amount` decimal(10,2) NOT NULL COMMENT 'Reward amount',
  `recharge_amount` decimal(10,2) NOT NULL COMMENT 'Recharge amount',
  `status` enum('pending','paid','failed') DEFAULT 'pending' COMMENT 'Reward status',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `paid_at` timestamp NULL DEFAULT NULL COMMENT 'Payment time',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_invited_user_id` (`invited_user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Invitation rewards table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation_rewards`
--

LOCK TABLES `invitation_rewards` WRITE;
/*!40000 ALTER TABLE `invitation_rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `invitation_rewards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `published` tinyint(1) DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pk_challenge_history`
--

DROP TABLE IF EXISTS `pk_challenge_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pk_challenge_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `challenge_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `steps` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_challenge_user_date` (`challenge_id`,`user_id`,`date`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pk_challenge_history_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `pk_challenges` (`id`),
  CONSTRAINT `pk_challenge_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pk_challenge_history`
--

LOCK TABLES `pk_challenge_history` WRITE;
/*!40000 ALTER TABLE `pk_challenge_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `pk_challenge_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pk_challenge_messages`
--

DROP TABLE IF EXISTS `pk_challenge_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pk_challenge_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `challenge_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `challenge_id` (`challenge_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `pk_challenge_messages_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `pk_challenges` (`id`),
  CONSTRAINT `pk_challenge_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `pk_challenge_messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pk_challenge_messages`
--

LOCK TABLES `pk_challenge_messages` WRITE;
/*!40000 ALTER TABLE `pk_challenge_messages` DISABLE KEYS */;
INSERT INTO `pk_challenge_messages` VALUES
(1,1,33,37,'邀请您参加PK挑战！',0,'2025-08-16 09:11:38'),
(2,2,33,37,'邀请您参加PK挑战！',0,'2025-08-16 09:19:32'),
(3,1,37,33,'已拒绝您的PK挑战',0,'2025-08-16 11:13:53'),
(4,2,37,33,'已接受您的PK挑战！',0,'2025-08-16 11:40:13');
/*!40000 ALTER TABLE `pk_challenge_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pk_challenges`
--

DROP TABLE IF EXISTS `pk_challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pk_challenges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `challenger_id` int(11) NOT NULL,
  `opponent_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `reward_amount` decimal(10,2) NOT NULL,
  `step_target` int(11) NOT NULL,
  `challenger_steps` int(11) NOT NULL DEFAULT 0,
  `opponent_steps` int(11) NOT NULL DEFAULT 0,
  `winner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `challenger_id` (`challenger_id`),
  KEY `opponent_id` (`opponent_id`),
  KEY `winner_id` (`winner_id`),
  CONSTRAINT `pk_challenges_ibfk_1` FOREIGN KEY (`challenger_id`) REFERENCES `users` (`id`),
  CONSTRAINT `pk_challenges_ibfk_2` FOREIGN KEY (`opponent_id`) REFERENCES `users` (`id`),
  CONSTRAINT `pk_challenges_ibfk_3` FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pk_challenges`
--

LOCK TABLES `pk_challenges` WRITE;
/*!40000 ALTER TABLE `pk_challenges` DISABLE KEYS */;
INSERT INTO `pk_challenges` VALUES
(1,33,37,'rejected','2025-08-16','2025-08-23',1.00,2.00,1000,0,0,NULL,'2025-08-16 09:11:38','2025-08-16 11:13:53'),
(2,33,37,'completed','2025-08-16','2025-08-23',1.00,2.00,1000,0,0,NULL,'2025-08-16 09:19:32','2025-08-28 09:27:12');
/*!40000 ALTER TABLE `pk_challenges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reward_configs`
--

DROP TABLE IF EXISTS `reward_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reward_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reward_type` enum('daily_checkin','weekly_checkin','monthly_checkin','challenge_complete','referral_user','step_milestone','team_activity') NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `conditions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conditions`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reward_type` (`reward_type`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reward_configs`
--

LOCK TABLES `reward_configs` WRITE;
/*!40000 ALTER TABLE `reward_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `reward_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_events`
--

DROP TABLE IF EXISTS `security_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_events` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `event_type` varchar(100) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
  `status` enum('NEW','IN_PROGRESS','RESOLVED','IGNORED') DEFAULT 'NEW',
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `security_events_ibfk_1` FOREIGN KEY (`resolved_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_events`
--

LOCK TABLES `security_events` WRITE;
/*!40000 ALTER TABLE `security_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `security_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `step_records`
--

DROP TABLE IF EXISTS `step_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `step_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `record_date` date NOT NULL,
  `steps` int(11) NOT NULL DEFAULT 0,
  `source` enum('manual','device','app') DEFAULT 'manual',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`record_date`),
  CONSTRAINT `step_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `step_records`
--

LOCK TABLES `step_records` WRITE;
/*!40000 ALTER TABLE `step_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `step_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_configs`
--

DROP TABLE IF EXISTS `system_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_configs` (
  `config_key` varchar(100) NOT NULL,
  `config_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_configs`
--

LOCK TABLES `system_configs` WRITE;
/*!40000 ALTER TABLE `system_configs` DISABLE KEYS */;
INSERT INTO `system_configs` VALUES
('checkin_base_reward','0.01','基础签到奖励','2025-08-16 16:10:32','2025-08-18 16:25:42'),
('checkin_consecutive_reward_30','0.2','连续签到30天额外奖励','2025-08-16 16:10:32','2025-08-16 16:10:32'),
('checkin_consecutive_reward_7','0.1','连续签到7天额外奖励','2025-08-16 16:10:32','2025-08-16 16:10:32'),
('version_info','{\"VERSION\":\"3.2.1\",\"MAJOR\":3,\"MINOR\":2,\"PATCH\":1,\"BUILD_TIME\":\"20250905135039\",\"BUILD_TIME_READABLE\":\"13:50:39\",\"BUILD_DATE\":\"2025-09-05\",\"DESCRIPTION\":\"FitChallenge管理员系统v3.2.1 - 完整功能版\",\"FULL_VERSION\":\"v3.2.1-20250905135039\",\"QUERY_PARAM\":\"?v=20250905135039\",\"FILE_SUFFIX\":\".js?v=20250905135039\",\"UPDATED_AT\":\"2025-09-05T05:50:39.818Z\"}',NULL,'2025-09-05 13:50:06','2025-09-05 13:50:39');
/*!40000 ALTER TABLE `system_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(100) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_config`
--

DROP TABLE IF EXISTS `team_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) NOT NULL COMMENT 'Config key',
  `config_value` text NOT NULL COMMENT 'Config value',
  `description` varchar(255) DEFAULT NULL COMMENT 'Config description',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Team system config table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_config`
--

LOCK TABLES `team_config` WRITE;
/*!40000 ALTER TABLE `team_config` DISABLE KEYS */;
INSERT INTO `team_config` VALUES
(1,'level1_commission_rate','0.05','Level 1 member VIP challenge commission rate (5%)','2025-08-18 09:42:33','2025-08-18 09:42:33'),
(2,'level2_commission_rate','0.03','Level 2 member VIP challenge commission rate (3%)','2025-08-18 09:42:33','2025-08-18 09:42:33'),
(3,'level3_commission_rate','0.01','Level 3 member VIP challenge commission rate (1%)','2025-08-18 09:42:33','2025-08-18 09:42:33'),
(4,'invitation_reward_amount','1.00','Invitation effective member reward amount (USDT)','2025-08-18 09:42:33','2025-08-18 09:42:33'),
(5,'invitation_recharge_threshold','30.00','Invitation effective member recharge threshold (USDT)','2025-08-18 09:42:33','2025-08-18 09:42:33'),
(6,'max_team_level','3','Maximum team level','2025-08-18 09:42:33','2025-08-18 09:42:33');
/*!40000 ALTER TABLE `team_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_relationships`
--

DROP TABLE IF EXISTS `team_relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_relationships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `parent_id` int(11) NOT NULL COMMENT 'Parent User ID',
  `level` int(11) NOT NULL DEFAULT 1 COMMENT 'Level: 1=Level1, 2=Level2, 3=Level3',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`user_id`,`parent_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Team relationships table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_relationships`
--

LOCK TABLES `team_relationships` WRITE;
/*!40000 ALTER TABLE `team_relationships` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_relationships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_statistics`
--

DROP TABLE IF EXISTS `team_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `level1_count` int(11) DEFAULT 0 COMMENT 'Level 1 member count',
  `level2_count` int(11) DEFAULT 0 COMMENT 'Level 2 member count',
  `level3_count` int(11) DEFAULT 0 COMMENT 'Level 3 member count',
  `total_commission` decimal(10,2) DEFAULT 0.00 COMMENT 'Total commission amount',
  `total_invitation_rewards` decimal(10,2) DEFAULT 0.00 COMMENT 'Total invitation rewards',
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_stats` (`user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Team statistics table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_statistics`
--

LOCK TABLES `team_statistics` WRITE;
/*!40000 ALTER TABLE `team_statistics` DISABLE KEYS */;
INSERT INTO `team_statistics` VALUES
(1,22,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(2,27,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(3,8,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(4,19,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(5,31,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(6,32,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(7,21,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(8,30,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(9,15,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(10,17,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(11,16,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(12,29,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(13,12,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(14,2,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(15,33,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(16,13,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(17,37,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(18,28,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(19,18,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(20,14,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(21,20,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(22,26,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(23,25,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(24,1,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(25,23,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(26,5,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(27,24,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(28,38,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(29,36,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(30,35,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(31,7,0,0,0,0.00,0.00,'2025-08-18 09:42:33'),
(32,42,0,0,0,0.00,0.00,'2025-08-18 10:54:13'),
(33,43,0,0,0,0.00,0.00,'2025-08-18 10:54:14'),
(34,44,0,0,0,0.00,0.00,'2025-08-18 10:54:14'),
(35,45,0,0,0,0.00,0.00,'2025-08-18 12:54:11'),
(36,46,0,0,0,0.00,0.00,'2025-08-18 13:25:30'),
(37,47,0,0,0,0.00,0.00,'2025-08-18 13:30:27'),
(38,48,0,0,0,0.00,0.00,'2025-08-18 13:31:15');
/*!40000 ALTER TABLE `team_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `leader_id` int(11) DEFAULT NULL,
  `max_members` int(11) DEFAULT 10,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `leader_id` (`leader_id`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `achievement_id` int(11) NOT NULL,
  `current_value` int(11) DEFAULT 0,
  `is_completed` tinyint(1) DEFAULT 0,
  `is_claimed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `claimed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`),
  KEY `achievement_id` (`achievement_id`),
  CONSTRAINT `user_achievements_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_ibfk_2` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1519 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES
(1,22,36,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(2,22,4,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(3,22,5,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(4,22,6,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(5,22,7,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(6,22,8,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(7,22,9,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(8,22,10,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(9,22,11,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(10,22,12,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(11,22,13,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(12,22,14,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(13,22,15,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(14,22,16,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(15,22,17,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(16,22,18,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(17,22,19,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(18,22,20,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(19,22,21,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(20,22,22,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(21,22,23,5,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(22,22,24,5,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(23,22,25,5,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(24,22,26,5,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(25,22,27,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(26,22,28,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(27,22,29,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(28,22,30,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(29,22,31,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(30,22,32,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(31,22,33,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(32,22,34,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(33,22,35,0,0,0,NULL,NULL,'2025-08-18 08:12:32','2025-08-18 08:13:31'),
(34,33,36,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(35,33,4,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(36,33,5,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(37,33,6,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(38,33,7,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(39,33,8,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(40,33,9,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(41,33,10,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(42,33,11,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(43,33,12,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(44,33,13,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(45,33,14,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(46,33,15,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(47,33,16,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(48,33,17,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(49,33,18,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(50,33,19,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(51,33,20,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(52,33,21,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(53,33,22,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(54,33,23,7,1,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(55,33,24,22,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(56,33,25,22,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(57,33,26,22,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(58,33,27,1,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(59,33,28,1,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(60,33,29,1,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(61,33,30,100,1,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(62,33,31,269,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(63,33,32,269,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(64,33,33,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(65,33,34,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(66,33,35,0,0,0,NULL,NULL,'2025-08-18 08:19:43','2025-09-04 07:16:05'),
(67,32,36,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(68,32,4,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(69,32,5,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(70,32,6,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(71,32,7,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(72,32,8,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(73,32,9,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(74,32,10,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(75,32,11,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(76,32,12,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(77,32,13,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(78,32,14,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(79,32,15,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(80,32,16,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(81,32,17,1,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(82,32,18,1,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(83,32,19,1,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(84,32,20,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(85,32,21,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(86,32,22,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(87,32,23,5,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(88,32,24,5,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(89,32,25,5,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(90,32,26,5,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(91,32,27,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(92,32,28,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(93,32,29,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(94,32,30,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(95,32,31,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(96,32,32,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(97,32,33,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(98,32,34,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(99,32,35,0,0,0,NULL,NULL,'2025-08-18 08:32:29','2025-08-18 08:32:29'),
(100,1,36,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(101,1,4,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(102,1,5,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(103,1,6,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(104,1,7,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(105,1,8,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(106,1,9,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(107,1,10,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(108,1,11,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(109,1,12,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(110,1,13,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(111,1,14,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(112,1,15,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(113,1,16,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(114,1,17,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(115,1,18,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(116,1,19,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(117,1,20,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(118,1,21,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(119,1,22,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(120,1,23,5,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(121,1,24,5,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(122,1,25,5,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(123,1,26,5,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(124,1,27,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(125,1,28,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(126,1,29,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(127,1,30,100,1,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(128,1,31,500,1,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(129,1,32,610,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(130,1,33,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(131,1,34,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(132,1,35,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(133,2,36,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(134,2,4,0,0,0,NULL,NULL,'2025-08-18 08:46:41','2025-08-18 08:46:41'),
(135,2,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(136,2,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(137,2,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(138,2,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(139,2,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(140,2,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(141,2,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(142,2,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(143,2,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(144,2,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(145,2,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(146,2,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(147,2,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(148,2,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(149,2,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(150,2,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(151,2,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(152,2,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(153,2,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(154,2,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(155,2,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(156,2,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(157,2,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(158,2,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(159,2,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(160,2,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(161,2,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(162,2,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(163,2,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(164,2,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(165,2,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(166,5,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(167,5,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(168,5,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(169,5,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(170,5,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(171,5,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(172,5,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(173,5,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(174,5,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(175,5,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(176,5,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(177,5,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(178,5,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(179,5,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(180,5,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(181,5,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(182,5,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(183,5,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(184,5,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(185,5,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(186,5,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(187,5,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(188,5,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(189,5,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(190,5,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(191,5,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(192,5,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(193,5,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(194,5,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(195,5,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(196,5,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(197,5,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(198,5,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(199,7,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(200,7,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(201,7,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(202,7,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(203,7,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(204,7,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(205,7,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(206,7,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(207,7,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(208,7,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(209,7,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(210,7,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(211,7,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(212,7,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(213,7,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(214,7,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(215,7,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(216,7,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(217,7,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(218,7,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(219,7,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(220,7,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(221,7,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(222,7,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(223,7,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(224,7,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(225,7,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(226,7,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(227,7,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(228,7,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(229,7,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(230,7,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(231,7,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(232,8,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(233,8,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(234,8,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(235,8,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(236,8,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(237,8,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(238,8,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(239,8,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(240,8,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(241,8,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(242,8,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(243,8,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(244,8,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(245,8,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(246,8,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(247,8,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(248,8,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(249,8,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(250,8,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(251,8,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(252,8,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(253,8,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(254,8,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(255,8,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(256,8,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(257,8,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(258,8,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(259,8,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(260,8,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(261,8,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(262,8,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(263,8,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(264,8,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(265,12,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(266,12,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(267,12,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(268,12,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(269,12,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(270,12,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(271,12,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(272,12,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(273,12,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(274,12,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(275,12,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(276,12,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(277,12,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(278,12,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(279,12,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(280,12,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(281,12,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(282,12,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(283,12,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(284,12,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(285,12,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(286,12,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(287,12,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(288,12,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(289,12,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(290,12,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(291,12,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(292,12,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(293,12,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(294,12,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(295,12,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(296,12,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(297,12,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(298,13,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(299,13,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(300,13,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(301,13,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(302,13,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(303,13,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(304,13,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(305,13,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(306,13,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(307,13,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(308,13,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(309,13,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(310,13,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(311,13,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(312,13,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(313,13,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(314,13,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(315,13,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(316,13,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(317,13,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(318,13,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(319,13,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(320,13,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(321,13,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(322,13,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(323,13,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(324,13,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(325,13,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(326,13,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(327,13,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(328,13,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(329,13,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(330,13,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(331,14,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(332,14,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(333,14,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(334,14,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(335,14,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(336,14,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(337,14,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(338,14,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(339,14,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(340,14,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(341,14,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(342,14,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(343,14,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(344,14,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(345,14,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(346,14,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(347,14,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(348,14,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(349,14,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(350,14,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(351,14,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(352,14,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(353,14,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(354,14,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(355,14,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(356,14,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(357,14,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(358,14,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(359,14,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(360,14,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(361,14,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(362,14,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(363,14,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(364,15,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(365,15,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(366,15,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(367,15,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(368,15,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(369,15,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(370,15,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(371,15,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(372,15,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(373,15,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(374,15,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(375,15,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(376,15,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(377,15,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(378,15,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(379,15,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(380,15,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(381,15,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(382,15,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(383,15,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(384,15,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(385,15,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(386,15,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(387,15,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(388,15,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(389,15,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(390,15,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(391,15,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(392,15,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(393,15,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(394,15,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(395,15,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(396,15,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(397,16,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(398,16,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(399,16,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(400,16,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(401,16,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(402,16,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(403,16,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(404,16,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(405,16,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(406,16,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(407,16,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(408,16,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(409,16,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(410,16,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(411,16,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(412,16,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(413,16,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(414,16,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(415,16,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(416,16,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(417,16,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(418,16,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(419,16,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(420,16,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(421,16,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(422,16,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(423,16,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(424,16,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(425,16,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(426,16,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(427,16,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(428,16,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(429,16,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(430,17,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(431,17,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(432,17,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(433,17,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(434,17,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(435,17,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(436,17,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(437,17,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(438,17,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(439,17,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(440,17,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(441,17,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(442,17,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(443,17,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(444,17,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(445,17,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(446,17,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(447,17,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(448,17,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(449,17,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(450,17,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(451,17,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(452,17,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(453,17,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(454,17,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(455,17,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(456,17,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(457,17,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(458,17,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(459,17,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(460,17,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(461,17,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(462,17,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(463,18,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(464,18,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(465,18,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(466,18,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(467,18,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(468,18,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(469,18,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(470,18,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(471,18,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(472,18,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(473,18,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(474,18,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(475,18,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(476,18,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(477,18,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(478,18,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(479,18,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(480,18,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(481,18,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(482,18,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(483,18,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(484,18,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(485,18,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(486,18,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(487,18,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(488,18,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(489,18,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(490,18,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(491,18,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(492,18,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(493,18,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(494,18,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(495,18,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(496,19,36,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(497,19,4,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(498,19,5,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(499,19,6,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(500,19,7,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(501,19,8,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(502,19,9,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(503,19,10,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(504,19,11,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(505,19,12,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(506,19,13,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(507,19,14,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(508,19,15,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(509,19,16,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(510,19,17,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(511,19,18,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(512,19,19,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(513,19,20,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(514,19,21,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(515,19,22,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(516,19,23,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(517,19,24,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(518,19,25,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(519,19,26,5,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(520,19,27,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(521,19,28,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(522,19,29,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(523,19,30,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(524,19,31,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(525,19,32,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(526,19,33,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(527,19,34,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(528,19,35,0,0,0,NULL,NULL,'2025-08-18 08:46:42','2025-08-18 08:46:42'),
(529,20,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(530,20,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(531,20,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(532,20,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(533,20,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(534,20,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(535,20,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(536,20,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(537,20,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(538,20,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(539,20,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(540,20,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(541,20,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(542,20,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(543,20,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(544,20,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(545,20,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(546,20,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(547,20,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(548,20,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(549,20,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(550,20,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(551,20,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(552,20,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(553,20,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(554,20,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(555,20,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(556,20,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(557,20,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(558,20,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(559,20,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(560,20,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(561,20,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(562,21,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(563,21,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(564,21,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(565,21,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(566,21,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(567,21,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(568,21,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(569,21,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(570,21,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(571,21,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(572,21,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(573,21,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(574,21,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(575,21,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(576,21,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(577,21,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(578,21,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(579,21,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(580,21,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(581,21,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(582,21,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(583,21,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(584,21,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(585,21,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(586,21,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(587,21,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(588,21,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(589,21,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(590,21,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(591,21,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(592,21,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(593,21,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(594,21,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(595,23,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(596,23,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(597,23,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(598,23,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(599,23,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(600,23,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(601,23,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(602,23,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(603,23,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(604,23,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(605,23,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(606,23,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(607,23,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(608,23,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(609,23,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(610,23,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(611,23,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(612,23,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(613,23,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(614,23,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(615,23,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(616,23,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(617,23,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(618,23,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(619,23,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(620,23,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(621,23,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(622,23,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(623,23,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(624,23,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(625,23,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(626,23,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(627,23,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(628,24,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(629,24,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(630,24,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(631,24,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(632,24,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(633,24,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(634,24,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(635,24,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(636,24,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(637,24,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(638,24,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(639,24,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(640,24,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(641,24,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(642,24,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(643,24,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(644,24,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(645,24,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(646,24,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(647,24,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(648,24,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(649,24,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(650,24,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(651,24,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(652,24,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(653,24,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(654,24,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(655,24,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(656,24,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(657,24,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(658,24,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(659,24,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(660,24,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(661,25,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(662,25,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(663,25,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(664,25,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(665,25,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(666,25,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(667,25,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(668,25,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(669,25,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(670,25,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(671,25,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(672,25,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(673,25,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(674,25,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(675,25,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(676,25,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(677,25,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(678,25,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(679,25,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(680,25,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(681,25,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(682,25,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(683,25,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(684,25,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(685,25,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(686,25,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(687,25,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(688,25,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(689,25,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(690,25,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(691,25,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(692,25,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(693,25,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(694,26,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(695,26,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(696,26,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(697,26,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(698,26,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(699,26,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(700,26,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(701,26,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(702,26,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(703,26,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(704,26,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(705,26,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(706,26,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(707,26,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(708,26,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(709,26,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(710,26,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(711,26,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(712,26,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(713,26,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(714,26,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(715,26,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(716,26,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(717,26,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(718,26,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(719,26,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(720,26,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(721,26,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(722,26,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(723,26,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(724,26,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(725,26,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(726,26,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(727,27,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(728,27,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(729,27,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(730,27,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(731,27,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(732,27,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(733,27,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(734,27,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(735,27,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(736,27,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(737,27,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(738,27,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(739,27,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(740,27,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(741,27,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(742,27,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(743,27,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(744,27,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(745,27,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(746,27,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(747,27,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(748,27,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(749,27,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(750,27,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(751,27,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(752,27,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(753,27,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(754,27,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(755,27,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(756,27,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(757,27,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(758,27,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(759,27,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(760,28,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(761,28,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(762,28,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(763,28,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(764,28,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(765,28,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(766,28,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(767,28,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(768,28,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(769,28,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(770,28,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(771,28,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(772,28,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(773,28,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(774,28,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(775,28,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(776,28,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(777,28,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(778,28,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(779,28,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(780,28,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(781,28,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(782,28,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(783,28,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(784,28,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(785,28,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(786,28,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(787,28,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(788,28,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(789,28,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(790,28,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(791,28,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(792,28,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(793,29,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(794,29,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(795,29,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(796,29,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(797,29,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(798,29,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(799,29,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(800,29,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(801,29,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(802,29,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(803,29,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(804,29,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(805,29,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(806,29,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(807,29,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(808,29,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(809,29,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(810,29,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(811,29,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(812,29,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(813,29,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(814,29,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(815,29,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(816,29,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(817,29,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(818,29,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(819,29,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(820,29,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(821,29,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(822,29,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(823,29,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(824,29,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(825,29,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(826,30,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(827,30,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(828,30,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(829,30,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(830,30,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(831,30,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(832,30,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(833,30,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(834,30,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(835,30,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(836,30,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(837,30,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(838,30,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(839,30,16,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(840,30,17,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(841,30,18,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(842,30,19,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(843,30,20,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(844,30,21,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(845,30,22,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(846,30,23,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(847,30,24,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(848,30,25,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(849,30,26,5,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(850,30,27,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(851,30,28,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(852,30,29,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(853,30,30,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(854,30,31,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(855,30,32,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(856,30,33,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(857,30,34,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(858,30,35,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(859,31,36,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(860,31,4,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(861,31,5,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(862,31,6,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(863,31,7,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(864,31,8,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(865,31,9,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(866,31,10,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(867,31,11,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(868,31,12,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(869,31,13,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(870,31,14,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(871,31,15,0,0,0,NULL,NULL,'2025-08-18 08:46:43','2025-08-18 08:46:43'),
(872,31,16,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(873,31,17,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(874,31,18,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(875,31,19,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(876,31,20,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(877,31,21,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(878,31,22,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(879,31,23,5,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(880,31,24,5,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(881,31,25,5,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(882,31,26,5,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(883,31,27,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(884,31,28,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(885,31,29,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(886,31,30,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(887,31,31,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(888,31,32,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(889,31,33,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(890,31,34,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(891,31,35,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(892,35,36,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(893,35,4,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(894,35,5,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(895,35,6,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(896,35,7,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(897,35,8,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(898,35,9,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(899,35,10,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(900,35,11,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(901,35,12,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(902,35,13,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(903,35,14,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(904,35,15,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(905,35,16,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(906,35,17,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(907,35,18,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(908,35,19,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(909,35,20,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(910,35,21,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(911,35,22,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(912,35,23,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(913,35,24,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(914,35,25,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(915,35,26,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(916,35,27,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(917,35,28,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(918,35,29,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(919,35,30,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(920,35,31,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(921,35,32,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(922,35,33,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(923,35,34,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(924,35,35,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(925,36,36,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(926,36,4,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(927,36,5,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(928,36,6,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(929,36,7,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(930,36,8,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(931,36,9,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(932,36,10,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(933,36,11,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(934,36,12,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(935,36,13,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(936,36,14,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(937,36,15,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(938,36,16,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(939,36,17,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(940,36,18,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(941,36,19,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(942,36,20,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(943,36,21,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(944,36,22,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(945,36,23,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(946,36,24,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(947,36,25,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(948,36,26,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(949,36,27,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(950,36,28,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(951,36,29,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(952,36,30,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(953,36,31,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(954,36,32,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(955,36,33,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(956,36,34,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(957,36,35,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(958,37,36,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(959,37,4,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(960,37,5,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(961,37,6,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(962,37,7,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(963,37,8,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(964,37,9,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(965,37,10,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(966,37,11,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(967,37,12,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(968,37,13,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(969,37,14,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(970,37,15,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(971,37,16,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(972,37,17,1,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(973,37,18,1,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(974,37,19,1,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(975,37,20,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(976,37,21,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(977,37,22,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(978,37,23,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(979,37,24,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(980,37,25,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(981,37,26,4,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(982,37,27,1,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(983,37,28,1,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(984,37,29,1,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(985,37,30,100,1,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(986,37,31,500,1,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(987,37,32,514,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(988,37,33,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(989,37,34,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(990,37,35,0,0,0,NULL,NULL,'2025-08-18 08:46:44','2025-08-18 08:46:44'),
(991,38,36,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(992,38,4,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(993,38,5,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(994,38,6,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(995,38,7,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(996,38,8,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(997,38,9,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(998,38,10,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(999,38,11,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1000,38,12,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1001,38,13,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1002,38,14,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1003,38,15,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1004,38,16,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1005,38,17,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1006,38,18,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1007,38,19,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1008,38,20,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1009,38,21,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1010,38,22,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1011,38,23,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1012,38,24,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1013,38,25,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1014,38,26,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1015,38,27,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1016,38,28,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1017,38,29,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1018,38,30,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1019,38,31,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1020,38,32,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1021,38,33,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1022,38,34,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1023,38,35,0,0,0,NULL,NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36'),
(1057,40,36,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1058,40,4,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1059,40,5,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1060,40,6,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1061,40,7,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1062,40,8,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1063,40,9,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1064,40,10,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1065,40,11,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1066,40,12,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1067,40,13,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1068,40,14,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1069,40,15,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1070,40,16,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1071,40,17,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1072,40,18,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1073,40,19,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1074,40,20,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1075,40,21,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1076,40,22,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1077,40,23,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1078,40,24,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1079,40,25,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1080,40,26,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1081,40,27,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1082,40,28,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1083,40,29,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1084,40,30,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1085,40,31,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1086,40,32,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1087,40,33,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1088,40,34,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1089,40,35,0,0,0,NULL,NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52'),
(1090,41,36,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1091,41,4,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1092,41,5,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1093,41,6,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1094,41,7,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1095,41,8,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1096,41,9,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1097,41,10,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1098,41,11,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1099,41,12,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1100,41,13,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1101,41,14,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1102,41,15,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1103,41,16,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1104,41,17,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1105,41,18,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1106,41,19,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1107,41,20,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1108,41,21,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1109,41,22,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1110,41,23,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1111,41,24,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1112,41,25,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1113,41,26,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1114,41,27,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1115,41,28,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1116,41,29,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1117,41,30,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1118,41,31,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1119,41,32,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1120,41,33,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1121,41,34,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1122,41,35,0,0,0,NULL,NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08'),
(1123,42,36,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1124,42,4,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1125,42,5,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1126,42,6,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1127,42,7,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1128,42,8,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1129,42,9,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1130,42,10,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1131,42,11,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1132,42,12,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1133,42,13,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1134,42,14,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1135,42,15,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1136,42,16,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1137,42,17,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1138,42,18,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1139,42,19,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1140,42,20,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1141,42,21,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1142,42,22,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1143,42,23,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1144,42,24,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1145,42,25,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1146,42,26,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1147,42,27,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1148,42,28,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1149,42,29,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1150,42,30,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1151,42,31,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1152,42,32,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1153,42,33,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1154,42,34,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1155,42,35,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1156,43,36,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1157,43,4,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1158,43,5,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1159,43,6,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1160,43,7,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1161,43,8,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1162,43,9,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1163,43,10,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1164,43,11,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1165,43,12,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1166,43,13,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1167,43,14,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1168,43,15,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1169,43,16,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1170,43,17,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1171,43,18,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1172,43,19,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1173,43,20,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1174,43,21,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1175,43,22,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1176,43,23,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1177,43,24,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1178,43,25,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1179,43,26,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1180,43,27,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1181,43,28,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1182,43,29,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1183,43,30,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1184,43,31,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1185,43,32,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1186,43,33,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1187,43,34,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1188,43,35,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1189,44,36,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1190,44,4,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1191,44,5,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1192,44,6,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1193,44,7,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1194,44,8,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1195,44,9,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1196,44,10,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1197,44,11,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1198,44,12,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1199,44,13,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1200,44,14,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1201,44,15,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1202,44,16,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1203,44,17,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1204,44,18,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1205,44,19,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1206,44,20,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1207,44,21,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1208,44,22,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1209,44,23,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1210,44,24,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1211,44,25,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1212,44,26,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1213,44,27,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1214,44,28,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1215,44,29,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1216,44,30,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1217,44,31,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1218,44,32,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1219,44,33,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1220,44,34,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1221,44,35,0,0,0,NULL,NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(1222,45,36,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1223,45,4,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1224,45,5,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1225,45,6,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1226,45,7,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1227,45,8,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1228,45,9,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1229,45,10,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1230,45,11,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1231,45,12,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1232,45,13,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1233,45,14,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1234,45,15,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1235,45,16,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1236,45,17,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1237,45,18,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1238,45,19,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1239,45,20,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1240,45,21,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1241,45,22,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1242,45,23,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1243,45,24,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1244,45,25,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1245,45,26,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1246,45,27,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1247,45,28,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1248,45,29,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1249,45,30,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1250,45,31,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1251,45,32,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1252,45,33,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1253,45,34,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1254,45,35,0,0,0,NULL,NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03'),
(1255,46,36,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1256,46,4,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1257,46,5,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1258,46,6,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1259,46,7,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1260,46,8,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1261,46,9,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1262,46,10,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1263,46,11,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1264,46,12,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1265,46,13,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1266,46,14,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1267,46,15,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1268,46,16,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1269,46,17,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1270,46,18,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1271,46,19,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1272,46,20,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1273,46,21,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1274,46,22,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1275,46,23,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1276,46,24,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1277,46,25,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1278,46,26,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1279,46,27,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1280,46,28,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1281,46,29,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1282,46,30,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1283,46,31,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1284,46,32,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1285,46,33,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1286,46,34,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1287,46,35,0,0,0,NULL,NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17'),
(1288,47,36,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1289,47,4,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1290,47,5,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1291,47,6,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1292,47,7,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1293,47,8,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1294,47,9,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1295,47,10,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1296,47,11,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1297,47,12,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1298,47,13,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1299,47,14,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1300,47,15,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1301,47,16,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1302,47,17,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1303,47,18,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1304,47,19,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1305,47,20,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1306,47,21,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1307,47,22,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1308,47,23,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1309,47,24,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1310,47,25,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1311,47,26,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1312,47,27,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1313,47,28,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1314,47,29,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1315,47,30,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1316,47,31,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1317,47,32,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1318,47,33,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1319,47,34,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1320,47,35,0,0,0,NULL,NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(1321,48,36,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1322,48,4,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1323,48,5,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1324,48,6,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1325,48,7,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1326,48,8,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1327,48,9,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1328,48,10,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1329,48,11,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1330,48,12,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1331,48,13,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1332,48,14,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1333,48,15,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1334,48,16,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1335,48,17,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1336,48,18,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1337,48,19,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1338,48,20,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1339,48,21,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1340,48,22,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1341,48,23,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1342,48,24,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1343,48,25,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1344,48,26,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1345,48,27,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1346,48,28,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1347,48,29,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1348,48,30,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1349,48,31,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1350,48,32,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1351,48,33,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1352,48,34,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1353,48,35,0,0,0,NULL,NULL,'2025-08-18 13:31:15','2025-08-18 13:31:15'),
(1354,58,4,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1355,58,5,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1356,58,6,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1357,58,36,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1358,58,7,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1359,58,8,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1360,58,9,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1361,58,10,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1362,58,11,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1363,58,12,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1364,58,13,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1365,58,14,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1366,58,15,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1367,58,16,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1368,58,17,1,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1369,58,18,1,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1370,58,19,1,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1371,58,20,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1372,58,21,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1373,58,22,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1374,58,23,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1375,58,24,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1376,58,25,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1377,58,26,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1378,58,27,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1379,58,28,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1380,58,29,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1381,58,30,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1382,58,31,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1383,58,32,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1384,58,33,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1385,58,34,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1386,58,35,0,0,0,NULL,NULL,'2025-08-27 12:34:18','2025-08-27 12:34:18'),
(1387,129,4,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1388,129,5,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1389,129,6,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1390,129,36,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1391,129,7,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1392,129,8,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1393,129,9,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1394,129,10,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1395,129,11,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1396,129,12,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1397,129,13,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1398,129,14,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1399,129,15,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1400,129,16,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1401,129,17,1,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1402,129,18,1,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1403,129,19,1,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1404,129,20,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1405,129,21,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1406,129,22,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1407,129,23,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1408,129,24,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1409,129,25,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1410,129,26,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1411,129,27,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1412,129,28,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1413,129,29,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1414,129,30,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1415,129,31,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1416,129,32,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1417,129,33,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1418,129,34,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1419,129,35,0,0,0,NULL,NULL,'2025-09-01 13:05:09','2025-09-01 13:05:26'),
(1420,132,4,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1421,132,5,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1422,132,6,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1423,132,36,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1424,132,7,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1425,132,8,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1426,132,9,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1427,132,10,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1428,132,11,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1429,132,12,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1430,132,13,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1431,132,14,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1432,132,15,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1433,132,16,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1434,132,17,1,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1435,132,18,1,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1436,132,19,1,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1437,132,20,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1438,132,21,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1439,132,22,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1440,132,23,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1441,132,24,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1442,132,25,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1443,132,26,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1444,132,27,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1445,132,28,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1446,132,29,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1447,132,30,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1448,132,31,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1449,132,32,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1450,132,33,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1451,132,34,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1452,132,35,0,0,0,NULL,NULL,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(1453,133,4,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1454,133,5,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1455,133,6,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1456,133,36,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1457,133,7,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1458,133,8,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1459,133,9,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1460,133,10,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1461,133,11,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1462,133,12,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1463,133,13,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1464,133,14,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1465,133,15,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1466,133,16,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1467,133,17,1,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1468,133,18,1,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1469,133,19,1,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1470,133,20,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1471,133,21,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1472,133,22,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1473,133,23,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1474,133,24,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1475,133,25,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1476,133,26,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1477,133,27,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1478,133,28,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1479,133,29,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1480,133,30,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1481,133,31,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1482,133,32,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1483,133,33,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1484,133,34,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1485,133,35,0,0,0,NULL,NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(1486,134,4,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1487,134,5,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1488,134,6,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1489,134,36,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1490,134,7,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1491,134,8,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1492,134,9,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1493,134,10,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1494,134,11,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1495,134,12,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1496,134,13,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1497,134,14,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1498,134,15,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1499,134,16,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1500,134,17,1,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1501,134,18,1,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1502,134,19,1,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1503,134,20,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1504,134,21,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1505,134,22,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1506,134,23,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1507,134,24,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1508,134,25,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1509,134,26,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1510,134,27,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1511,134,28,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1512,134,29,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1513,134,30,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1514,134,31,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1515,134,32,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1516,134,33,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1517,134,34,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(1518,134,35,0,0,0,NULL,NULL,'2025-09-01 13:20:47','2025-09-01 13:20:47');
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_checkins`
--

DROP TABLE IF EXISTS `user_checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_checkins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `checkin_date` datetime NOT NULL,
  `reward_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `consecutive_days` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`checkin_date`),
  KEY `idx_user_checkins_user_id` (`user_id`),
  KEY `idx_user_checkins_date` (`checkin_date`),
  CONSTRAINT `user_checkins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_checkins`
--

LOCK TABLES `user_checkins` WRITE;
/*!40000 ALTER TABLE `user_checkins` DISABLE KEYS */;
INSERT INTO `user_checkins` VALUES
(1,33,'2025-08-16 16:15:02',0.10,1,'2025-08-16 16:15:02','2025-08-16 16:15:02'),
(2,37,'2025-08-16 17:13:21',0.10,1,'2025-08-16 17:13:21','2025-08-16 17:13:21'),
(3,33,'2025-08-17 20:43:29',0.10,2,'2025-08-17 20:43:29','2025-08-17 20:43:29'),
(4,33,'2025-08-18 15:37:25',0.10,3,'2025-08-18 15:37:25','2025-08-18 15:37:25'),
(5,37,'2025-08-18 16:26:49',0.10,1,'2025-08-18 16:26:49','2025-08-18 16:26:49'),
(6,32,'2025-08-18 16:28:40',0.10,1,'2025-08-18 16:28:40','2025-08-18 16:28:40'),
(8,33,'2025-08-21 00:00:00',0.01,4,'2025-08-21 13:26:29','2025-08-21 13:26:29'),
(9,23,'2025-08-21 00:00:00',0.01,1,'2025-08-21 15:07:54','2025-08-21 15:07:54'),
(10,33,'2025-08-22 00:00:00',0.01,5,'2025-08-22 10:44:53','2025-08-22 10:44:53'),
(11,33,'2025-08-23 22:16:12',0.10,6,'2025-08-23 22:16:12','2025-08-23 22:16:12'),
(12,33,'2025-08-25 13:51:35',0.10,1,'2025-08-25 13:51:35','2025-08-25 13:51:35'),
(13,33,'2025-08-26 19:31:02',0.10,2,'2025-08-26 19:31:02','2025-08-26 19:31:02'),
(14,33,'2025-08-27 17:43:57',0.10,3,'2025-08-27 17:43:57','2025-08-27 17:43:57'),
(15,58,'2025-08-27 20:34:18',0.10,1,'2025-08-27 20:34:18','2025-08-27 20:34:18'),
(16,33,'2025-08-28 15:12:58',0.10,4,'2025-08-28 15:12:58','2025-08-28 15:12:58'),
(17,33,'2025-08-29 21:40:07',0.10,5,'2025-08-29 21:40:07','2025-08-29 21:40:07'),
(18,129,'2025-09-01 21:05:09',0.10,1,'2025-09-01 21:05:09','2025-09-01 21:05:09'),
(19,132,'2025-09-01 21:07:09',0.10,1,'2025-09-01 21:07:09','2025-09-01 21:07:09'),
(20,133,'2025-09-01 21:18:53',0.10,1,'2025-09-01 21:18:53','2025-09-01 21:18:53'),
(21,134,'2025-09-01 21:20:47',0.10,1,'2025-09-01 21:20:47','2025-09-01 21:20:47'),
(22,33,'2025-09-02 22:18:11',0.10,1,'2025-09-02 22:18:11','2025-09-02 22:18:11'),
(23,33,'2025-09-03 01:22:41',0.10,2,'2025-09-03 01:22:41','2025-09-03 01:22:41');
/*!40000 ALTER TABLE `user_checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_invitation_codes`
--

DROP TABLE IF EXISTS `user_invitation_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_invitation_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `invitation_code` varchar(50) NOT NULL COMMENT 'Invitation code',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Is active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_code` (`user_id`),
  UNIQUE KEY `unique_code` (`invitation_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_invitation_code` (`invitation_code`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User invitation codes table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_invitation_codes`
--

LOCK TABLES `user_invitation_codes` WRITE;
/*!40000 ALTER TABLE `user_invitation_codes` DISABLE KEYS */;
INSERT INTO `user_invitation_codes` VALUES
(1,22,'INV000022E758FE1B',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(2,27,'INV00002710619707',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(3,8,'INV0000089853C768',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(4,19,'INV000019D1676E93',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(5,31,'INV000031A97AE22E',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(6,32,'INV000032A06393AA',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(7,21,'INV000021E9EEAEF5',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(8,30,'INV00003010237277',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(9,15,'INV0000158A687CB8',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(10,17,'INV000017766EC26A',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(11,16,'INV00001664454070',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(12,29,'INV00002932764143',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(13,12,'INV00001287FFF97C',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(14,2,'INV000002B519801F',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(15,33,'INV000033655D448A',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(16,13,'INV000013640669B6',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(17,37,'INV00003753D4BE76',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(18,28,'INV0000287D743B2F',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(19,18,'INV00001876F347D3',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(20,14,'INV000014209D30D0',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(21,20,'INV000020315A2CB6',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(22,26,'INV000026F1CA2AFC',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(23,25,'INV000025210F3C1F',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(24,1,'INV000001F87C711C',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(25,23,'INV000023335837FF',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(26,5,'INV00000517614A0E',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(27,24,'INV000024531D9270',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(28,38,'INV000038DEDB5916',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(29,36,'INV000036BEDAEA84',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(30,35,'INV00003516D9E3D0',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(31,7,'INV00000791D4317A',1,'2025-08-18 09:42:33','2025-08-18 09:42:33'),
(32,42,'INV000042CD691F47',1,'2025-08-18 10:54:13','2025-08-18 10:54:13'),
(33,43,'INV000043C8701257',1,'2025-08-18 10:54:14','2025-08-18 10:54:14'),
(34,44,'INV000044F7062614',1,'2025-08-18 10:54:14','2025-08-18 10:54:14'),
(35,45,'INV000045D9C90977',1,'2025-08-18 12:54:11','2025-08-18 12:54:11'),
(36,46,'INV00004620A40DBE',1,'2025-08-18 13:25:30','2025-08-18 13:25:30'),
(37,47,'INV0000478C2E29A9',1,'2025-08-18 13:30:27','2025-08-18 13:30:27'),
(38,48,'INV0000482AF20BB0',1,'2025-08-18 13:31:15','2025-08-18 13:31:15');
/*!40000 ALTER TABLE `user_invitation_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES
(1,1,NULL,NULL,NULL,NULL,NULL,NULL),
(2,2,NULL,NULL,NULL,NULL,NULL,NULL),
(5,5,NULL,NULL,NULL,NULL,NULL,NULL),
(7,7,NULL,NULL,NULL,NULL,NULL,NULL),
(8,8,NULL,NULL,NULL,NULL,NULL,NULL),
(12,12,NULL,NULL,NULL,NULL,NULL,NULL),
(13,13,NULL,NULL,NULL,NULL,NULL,NULL),
(14,14,NULL,NULL,NULL,NULL,NULL,NULL),
(15,15,NULL,NULL,NULL,NULL,NULL,NULL),
(16,16,NULL,NULL,NULL,NULL,NULL,NULL),
(17,17,NULL,NULL,NULL,NULL,NULL,NULL),
(18,18,NULL,NULL,NULL,NULL,NULL,NULL),
(19,19,NULL,NULL,NULL,NULL,NULL,NULL),
(20,20,NULL,NULL,NULL,NULL,NULL,NULL),
(21,21,NULL,NULL,NULL,NULL,NULL,NULL),
(22,22,NULL,NULL,NULL,NULL,NULL,NULL),
(23,23,NULL,NULL,NULL,NULL,NULL,NULL),
(24,24,NULL,NULL,NULL,NULL,NULL,NULL),
(25,25,NULL,NULL,NULL,NULL,NULL,NULL),
(26,26,NULL,NULL,NULL,NULL,NULL,NULL),
(27,27,NULL,NULL,NULL,NULL,NULL,NULL),
(28,28,NULL,NULL,NULL,NULL,NULL,NULL),
(29,29,NULL,NULL,NULL,NULL,NULL,NULL),
(30,30,NULL,NULL,NULL,NULL,NULL,NULL),
(31,31,NULL,NULL,NULL,NULL,NULL,NULL),
(32,32,NULL,NULL,NULL,NULL,NULL,NULL),
(33,33,NULL,NULL,NULL,NULL,NULL,NULL),
(34,35,NULL,NULL,NULL,NULL,NULL,NULL),
(35,36,NULL,NULL,NULL,NULL,NULL,NULL),
(36,37,NULL,NULL,NULL,NULL,NULL,NULL),
(37,38,NULL,NULL,NULL,NULL,NULL,NULL),
(39,40,NULL,NULL,NULL,NULL,NULL,NULL),
(40,41,NULL,NULL,NULL,NULL,NULL,NULL),
(41,42,NULL,NULL,NULL,NULL,NULL,NULL),
(42,43,NULL,NULL,NULL,NULL,NULL,NULL),
(43,44,NULL,NULL,NULL,NULL,NULL,NULL),
(44,45,NULL,NULL,NULL,NULL,NULL,NULL),
(45,46,NULL,NULL,NULL,NULL,NULL,NULL),
(46,47,NULL,NULL,NULL,NULL,NULL,NULL),
(47,48,NULL,NULL,NULL,NULL,NULL,NULL),
(48,71,NULL,NULL,NULL,NULL,NULL,NULL),
(49,72,NULL,NULL,NULL,NULL,NULL,NULL),
(50,73,NULL,NULL,NULL,NULL,NULL,NULL),
(51,74,NULL,NULL,NULL,NULL,NULL,NULL),
(52,75,NULL,NULL,NULL,NULL,NULL,NULL),
(53,76,NULL,NULL,NULL,NULL,NULL,NULL),
(54,77,NULL,NULL,NULL,NULL,NULL,NULL),
(55,78,NULL,NULL,NULL,NULL,NULL,NULL),
(56,79,NULL,NULL,NULL,NULL,NULL,NULL),
(57,80,NULL,NULL,NULL,NULL,NULL,NULL),
(58,81,NULL,NULL,NULL,NULL,NULL,NULL),
(59,82,NULL,NULL,NULL,NULL,NULL,NULL),
(60,83,NULL,NULL,NULL,NULL,NULL,NULL),
(61,84,NULL,NULL,NULL,NULL,NULL,NULL),
(62,86,NULL,NULL,NULL,NULL,NULL,NULL),
(63,85,NULL,NULL,NULL,NULL,NULL,NULL),
(64,87,NULL,NULL,NULL,NULL,NULL,NULL),
(65,88,NULL,NULL,NULL,NULL,NULL,NULL),
(66,89,NULL,NULL,NULL,NULL,NULL,NULL),
(67,90,NULL,NULL,NULL,NULL,NULL,NULL),
(68,91,NULL,NULL,NULL,NULL,NULL,NULL),
(69,92,NULL,NULL,NULL,NULL,NULL,NULL),
(70,93,NULL,NULL,NULL,NULL,NULL,NULL),
(71,94,NULL,NULL,NULL,NULL,NULL,NULL),
(72,95,NULL,NULL,NULL,NULL,NULL,NULL),
(73,96,NULL,NULL,NULL,NULL,NULL,NULL),
(74,97,NULL,NULL,NULL,NULL,NULL,NULL),
(75,98,NULL,NULL,NULL,NULL,NULL,NULL),
(76,99,NULL,NULL,NULL,NULL,NULL,NULL),
(77,101,NULL,NULL,NULL,NULL,NULL,NULL),
(78,100,NULL,NULL,NULL,NULL,NULL,NULL),
(79,102,NULL,NULL,NULL,NULL,NULL,NULL),
(80,103,NULL,NULL,NULL,NULL,NULL,NULL),
(81,106,NULL,NULL,NULL,NULL,NULL,NULL),
(82,105,NULL,NULL,NULL,NULL,NULL,NULL),
(83,104,NULL,NULL,NULL,NULL,NULL,NULL),
(84,107,NULL,NULL,NULL,NULL,NULL,NULL),
(85,108,NULL,NULL,NULL,NULL,NULL,NULL),
(86,110,NULL,NULL,NULL,NULL,NULL,NULL),
(87,109,NULL,NULL,NULL,NULL,NULL,NULL),
(88,112,NULL,NULL,NULL,NULL,NULL,NULL),
(89,111,NULL,NULL,NULL,NULL,NULL,NULL),
(90,113,NULL,NULL,NULL,NULL,NULL,NULL),
(91,114,NULL,NULL,NULL,NULL,NULL,NULL),
(92,115,NULL,NULL,NULL,NULL,NULL,NULL),
(93,116,NULL,NULL,NULL,NULL,NULL,NULL),
(94,117,NULL,NULL,NULL,NULL,NULL,NULL),
(95,118,NULL,NULL,NULL,NULL,NULL,NULL),
(96,119,NULL,NULL,NULL,NULL,NULL,NULL),
(97,120,NULL,NULL,NULL,NULL,NULL,NULL),
(98,122,NULL,NULL,NULL,NULL,NULL,NULL),
(99,121,NULL,NULL,NULL,NULL,NULL,NULL),
(100,123,NULL,NULL,NULL,NULL,NULL,NULL),
(101,124,NULL,NULL,NULL,NULL,NULL,NULL),
(102,125,NULL,NULL,NULL,NULL,NULL,NULL),
(103,126,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_rewards`
--

DROP TABLE IF EXISTS `user_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_rewards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `reward_config_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `status` enum('pending','credited','failed') DEFAULT 'pending',
  `credited_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_reward_config_id` (`reward_config_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `user_rewards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_rewards_ibfk_2` FOREIGN KEY (`reward_config_id`) REFERENCES `reward_configs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_rewards`
--

LOCK TABLES `user_rewards` WRITE;
/*!40000 ALTER TABLE `user_rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_rewards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_wallets`
--

DROP TABLE IF EXISTS `user_wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_wallets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `frozen_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_deposited` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_withdrawn` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_rewarded` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_balance` (`balance`),
  CONSTRAINT `user_wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_balance` CHECK (`balance` >= 0),
  CONSTRAINT `check_frozen_balance` CHECK (`frozen_balance` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_wallets`
--

LOCK TABLES `user_wallets` WRITE;
/*!40000 ALTER TABLE `user_wallets` DISABLE KEYS */;
INSERT INTO `user_wallets` VALUES
(1,22,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(2,27,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(3,8,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(4,19,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(5,31,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(6,32,0.10,0.00,0.00,0.00,0.10,'2025-08-13 23:00:59','2025-08-18 08:28:40'),
(7,21,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(8,30,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(9,15,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(10,17,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(11,16,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(12,29,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(13,12,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(14,2,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(15,33,9930.12,100.00,0.00,0.00,1.10,'2025-08-13 23:00:59','2025-09-03 10:31:30'),
(16,13,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(17,28,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(18,18,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(19,14,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(20,20,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(21,26,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(22,25,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(23,1,250.00,0.00,110.00,0.00,0.00,'2025-08-13 23:00:59','2025-09-04 03:32:47'),
(24,23,0.01,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-21 07:07:54'),
(25,5,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(26,24,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(27,7,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(28,37,512.10,0.00,10.00,0.00,0.10,'2025-08-16 11:39:10','2025-08-28 09:27:12'),
(30,36,20.00,0.00,20.00,0.00,0.00,'2025-08-17 09:20:07','2025-08-17 09:20:53'),
(31,48,30.00,0.00,0.00,0.00,0.00,'2025-08-20 09:15:50','2025-08-20 12:42:31'),
(32,49,0.00,0.00,0.00,0.00,0.00,'2025-08-21 04:08:36','2025-08-21 04:08:36'),
(33,50,0.00,0.00,0.00,0.00,0.00,'2025-08-21 04:17:15','2025-08-21 04:17:15'),
(34,51,0.00,0.00,0.00,0.00,0.00,'2025-08-21 05:27:54','2025-08-21 05:27:54'),
(35,52,0.00,0.00,0.00,0.00,0.00,'2025-08-21 07:07:54','2025-08-21 07:07:54'),
(36,53,0.00,0.00,0.00,0.00,0.00,'2025-08-21 07:49:00','2025-08-21 07:49:00'),
(37,54,0.00,0.00,0.00,0.00,0.00,'2025-08-21 08:01:41','2025-08-21 08:01:41'),
(38,55,0.00,0.00,0.00,0.00,0.00,'2025-08-21 09:10:26','2025-08-21 09:10:26'),
(39,56,10.00,0.00,0.00,0.00,0.00,'2025-08-21 09:13:13','2025-08-21 11:29:14'),
(40,58,0.10,0.00,0.00,0.00,0.10,'2025-08-27 11:48:59','2025-08-27 12:34:18'),
(41,71,0.00,0.00,0.00,0.00,0.00,'2025-08-29 06:26:59','2025-08-29 06:26:59'),
(42,72,0.00,0.00,0.00,0.00,0.00,'2025-08-29 09:21:37','2025-08-29 09:21:37'),
(43,73,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:40','2025-08-29 12:27:40'),
(44,74,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:40','2025-08-29 12:27:40'),
(45,75,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(46,76,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(47,77,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(48,78,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(49,79,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(50,80,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(51,81,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(52,82,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(53,83,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:47','2025-08-29 12:27:47'),
(54,84,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(55,86,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(56,87,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(57,85,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(58,88,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(59,89,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(60,90,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(61,91,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(62,92,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(63,93,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(64,96,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(65,94,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(66,95,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(67,97,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(68,98,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(69,99,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(70,101,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(71,100,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(72,102,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(73,103,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(74,106,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(75,104,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(76,105,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(77,107,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(78,108,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(79,110,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(80,109,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(81,111,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(82,112,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(83,113,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(84,114,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(85,115,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(86,116,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(87,117,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(88,118,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(89,119,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(90,120,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(91,125,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(92,121,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(93,124,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(94,123,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(95,122,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(96,126,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:28:29','2025-08-29 12:28:29'),
(97,129,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:05:04','2025-09-01 13:05:09'),
(98,132,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(99,133,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(100,134,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(101,146,34.00,0.00,0.00,0.00,0.00,'2025-09-03 10:34:51','2025-09-07 03:24:02'),
(102,145,10.00,0.00,0.00,0.00,0.00,'2025-09-03 11:00:54','2025-09-03 11:00:54');
/*!40000 ALTER TABLE `user_wallets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_wallets_backup`
--

DROP TABLE IF EXISTS `user_wallets_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_wallets_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `frozen_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_deposited` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_withdrawn` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_rewarded` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_wallets_backup`
--

LOCK TABLES `user_wallets_backup` WRITE;
/*!40000 ALTER TABLE `user_wallets_backup` DISABLE KEYS */;
INSERT INTO `user_wallets_backup` VALUES
(1,22,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(2,27,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(3,8,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(4,19,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(5,31,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(6,32,0.10,0.00,0.00,0.00,0.10,'2025-08-13 23:00:59','2025-08-18 08:28:40'),
(7,21,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(8,30,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(9,15,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(10,17,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(11,16,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(12,29,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(13,12,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(14,2,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(15,33,9930.12,100.00,0.00,0.00,1.10,'2025-08-13 23:00:59','2025-09-03 10:31:30'),
(16,13,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(17,28,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(18,18,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(19,14,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(20,20,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(21,26,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(22,25,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(23,1,200.00,0.00,110.00,0.00,0.00,'2025-08-13 23:00:59','2025-09-03 15:20:46'),
(24,23,0.01,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-21 07:07:54'),
(25,5,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(26,24,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(27,7,0.00,0.00,0.00,0.00,0.00,'2025-08-13 23:00:59','2025-08-13 23:00:59'),
(28,37,512.10,0.00,10.00,0.00,0.10,'2025-08-16 11:39:10','2025-08-28 09:27:12'),
(30,36,20.00,0.00,20.00,0.00,0.00,'2025-08-17 09:20:07','2025-08-17 09:20:53'),
(31,48,30.00,0.00,0.00,0.00,0.00,'2025-08-20 09:15:50','2025-08-20 12:42:31'),
(32,49,0.00,0.00,0.00,0.00,0.00,'2025-08-21 04:08:36','2025-08-21 04:08:36'),
(33,50,0.00,0.00,0.00,0.00,0.00,'2025-08-21 04:17:15','2025-08-21 04:17:15'),
(34,51,0.00,0.00,0.00,0.00,0.00,'2025-08-21 05:27:54','2025-08-21 05:27:54'),
(35,52,0.00,0.00,0.00,0.00,0.00,'2025-08-21 07:07:54','2025-08-21 07:07:54'),
(36,53,0.00,0.00,0.00,0.00,0.00,'2025-08-21 07:49:00','2025-08-21 07:49:00'),
(37,54,0.00,0.00,0.00,0.00,0.00,'2025-08-21 08:01:41','2025-08-21 08:01:41'),
(38,55,0.00,0.00,0.00,0.00,0.00,'2025-08-21 09:10:26','2025-08-21 09:10:26'),
(39,56,10.00,0.00,0.00,0.00,0.00,'2025-08-21 09:13:13','2025-08-21 11:29:14'),
(40,58,0.10,0.00,0.00,0.00,0.10,'2025-08-27 11:48:59','2025-08-27 12:34:18'),
(41,71,0.00,0.00,0.00,0.00,0.00,'2025-08-29 06:26:59','2025-08-29 06:26:59'),
(42,72,0.00,0.00,0.00,0.00,0.00,'2025-08-29 09:21:37','2025-08-29 09:21:37'),
(43,73,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:40','2025-08-29 12:27:40'),
(44,74,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:40','2025-08-29 12:27:40'),
(45,75,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(46,76,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(47,77,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(48,78,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(49,79,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(50,80,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(51,81,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(52,82,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:46','2025-08-29 12:27:46'),
(53,83,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:47','2025-08-29 12:27:47'),
(54,84,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(55,86,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(56,87,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(57,85,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:54','2025-08-29 12:27:54'),
(58,88,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(59,89,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(60,90,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(61,91,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(62,92,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(63,93,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(64,96,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(65,94,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(66,95,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(67,97,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(68,98,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(69,99,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(70,101,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(71,100,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(72,102,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:55','2025-08-29 12:27:55'),
(73,103,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(74,106,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(75,104,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(76,105,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(77,107,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(78,108,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(79,110,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(80,109,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(81,111,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(82,112,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(83,113,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(84,114,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(85,115,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(86,116,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(87,117,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(88,118,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(89,119,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(90,120,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(91,125,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(92,121,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(93,124,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(94,123,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(95,122,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:27:57','2025-08-29 12:27:57'),
(96,126,0.00,0.00,0.00,0.00,0.00,'2025-08-29 12:28:29','2025-08-29 12:28:29'),
(97,129,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:05:04','2025-09-01 13:05:09'),
(98,132,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:07:09','2025-09-01 13:07:09'),
(99,133,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:18:53','2025-09-01 13:18:53'),
(100,134,0.10,0.00,0.00,0.00,0.10,'2025-09-01 13:20:47','2025-09-01 13:20:47'),
(101,146,30.00,0.00,0.00,0.00,0.00,'2025-09-03 10:34:51','2025-09-03 11:27:22'),
(102,145,10.00,0.00,0.00,0.00,0.00,'2025-09-03 11:00:54','2025-09-03 11:00:54');
/*!40000 ALTER TABLE `user_wallets_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `trc20_wallet` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `pk_enabled` tinyint(1) DEFAULT 1,
  `telegram_id` bigint(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telegram_id` (`telegram_id`),
  UNIQUE KEY `email_2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'newuser2025@example.com',NULL,NULL,'$2a$10$UrkQm1St5nP838jq3EZw0OiAQV1S6fPlVkkKbHlmb.szsRHXgyIDm',NULL,'2025-08-12 17:05:51','2025-08-12 17:05:51',NULL,1,1,NULL,NULL,NULL),
(2,'159863@qq.com',NULL,NULL,'/KeWQm5uU1DZQFRWy8gSl3vHVycjh85iFllYTji',NULL,'2025-08-12 17:17:47','2025-08-23 14:07:05',NULL,1,1,NULL,NULL,NULL),
(5,'tes1t@example.com',NULL,NULL,'$2a$10$8.RI9V7EL7Z3Sh2siqm/E.jTyozUg8WK.yzdKsMjh0ZxOEXct8h5q',NULL,'2025-08-12 18:15:43','2025-08-29 06:16:05','2025-08-29 06:16:05',1,1,NULL,NULL,NULL),
(7,'9test@example.com',NULL,NULL,'$2a$10$lcwruXLBoIlglkldMn0R7ugyeo1uftwK4IWDGEwbNrmwanrcUCKdm',NULL,'2025-08-12 18:19:01','2025-08-12 18:19:01',NULL,1,1,NULL,NULL,NULL),
(8,'12346@example.com',NULL,NULL,'$2a$10$ZXVIo1TIvt6VGsPz8pJwqOumz.KVNhaCsZK.NyM/FLtqKDdYe.NGW',NULL,'2025-08-12 18:25:58','2025-08-12 18:25:58',NULL,1,1,NULL,NULL,NULL),
(12,'159369@qq.com',NULL,NULL,'$2a$10$p1OqJeLB3qliB952BrzmK.wbMRl3W5ZtH9eULtmbaD2oy.j2OqsxW',NULL,'2025-08-13 01:00:57','2025-08-13 01:01:04','2025-08-13 01:01:04',1,1,NULL,NULL,NULL),
(13,'169853@qq.com',NULL,NULL,'$2a$10$anxdwZ4pA8LM8ar8y/80u.PSz50qMq1KaaVoPv9WpsLudyVOrpnQi',NULL,'2025-08-13 01:04:00','2025-08-13 01:04:00',NULL,1,1,NULL,NULL,NULL),
(14,'852963@qq.com',NULL,NULL,'$2a$10$aqT79h5YltTqBEfx.K/sTuM8rD6KtTFENBTC5sggQDZdo73IQG2gm',NULL,'2025-08-13 01:07:08','2025-08-13 01:07:08',NULL,1,1,NULL,NULL,NULL),
(15,'1472593@qq.com',NULL,NULL,'$2a$10$dm801kXgmW/SER28IEIR/OSMM.srY0uE/qvveBoCJ1tgnFHn.dVoW',NULL,'2025-08-13 01:11:38','2025-08-13 01:11:38',NULL,1,1,NULL,NULL,NULL),
(16,'156982@qq.com',NULL,NULL,'$2a$10$zoPe0zvQlglE6l4f5Anw9.VbNUGlEKS2XmL.TAVCh0WiQ7oAcAgXC',NULL,'2025-08-13 01:13:51','2025-08-13 01:13:51',NULL,1,1,NULL,NULL,NULL),
(17,'14963@qq.com',NULL,NULL,'$2a$10$wDjnpF5x1v0DGDwf5.NqPOApih0A232PhkpSA11rHQG1YIm87OQW2',NULL,'2025-08-13 01:16:53','2025-08-13 01:16:53',NULL,1,1,NULL,NULL,NULL),
(18,'369852@qq.com',NULL,NULL,'$2a$10$cRLXBCkxEe5O/38lCoY6jO2chp1tDdnac0jcfM/7kk3JtPiP/um9C',NULL,'2025-08-13 01:19:59','2025-08-13 01:19:59',NULL,1,1,NULL,NULL,NULL),
(19,'123659@qq.com',NULL,NULL,'$2a$10$Q0l7aEJN95jQ3.FawnHx9OpkGeUYSCuqv2KBAeOElRjlga9rzbC.W',NULL,'2025-08-13 01:23:38','2025-08-13 01:23:38',NULL,1,1,NULL,NULL,NULL),
(20,'985631@qq.com',NULL,NULL,'$2a$10$yWH7RD1IVVPWiJ6mGhFxWu3aSeNVCXnL53H1PGCEPE5mJpNo4Zk.2',NULL,'2025-08-13 01:26:33','2025-08-13 01:26:33',NULL,1,1,NULL,NULL,NULL),
(21,'1471111@qq.com',NULL,NULL,'$2a$10$.z25auGLUAGEb2T7XXiEzOD4gSsEapy7SGLRYIbiinwFMQS7KQGcq',NULL,'2025-08-13 01:34:41','2025-08-13 01:34:41',NULL,1,1,NULL,NULL,NULL),
(22,'11111@qq.com',NULL,NULL,'$2a$10$IN557rRhMyTggsAt.1.F3eq9tQZnnA551IMzwtPAQVPqp9BRhnKTi',NULL,'2025-08-13 01:37:37','2025-08-13 01:37:37',NULL,1,1,NULL,NULL,NULL),
(23,'test@example.com',NULL,NULL,'$2a$10$d4fyPgM.Hv7K69iGOPDTo.z4EUN5MrHNu0sAi7qesdu62mbJf1yTq','TTest1755767497113Example','2025-08-13 02:08:28','2025-08-25 09:27:16','2025-08-25 09:27:16',1,1,NULL,NULL,NULL),
(24,'test1755050911320@example.com',NULL,NULL,'$2a$10$.mhTu/uO3/9DsX1drzg9t.9kjEXmz4TppE1F2ezzSj3GDSTjSl9yW',NULL,'2025-08-13 02:08:31','2025-08-13 02:08:31',NULL,1,1,NULL,NULL,NULL),
(25,'9999@qq.com',NULL,NULL,'$2a$10$dpDCQJDuadyEXpX91koRQ.jqB0DQ866aB7bvjhnT.w3mBOgvxWRmK',NULL,'2025-08-13 02:09:29','2025-08-13 02:10:19','2025-08-13 02:10:19',1,1,NULL,NULL,NULL),
(26,'989898@qq.com',NULL,NULL,'$2a$10$nuowf/gG77NfOjW4CbImkOdmmgfEas9VIDjG509ZUrjUR5uZfm3aO',NULL,'2025-08-13 02:16:22','2025-08-13 02:17:02','2025-08-13 02:17:02',1,1,NULL,NULL,NULL),
(27,'123123@qq.com',NULL,NULL,'$2a$10$EHMrbpDRnWEKWy8weLl9quFPqPnVV3BKP7..y/OT9NhuN6.bXZkXy',NULL,'2025-08-13 02:20:02','2025-08-13 02:20:24','2025-08-13 02:20:24',1,1,NULL,NULL,NULL),
(28,'3693699@qq.com',NULL,NULL,'$2a$10$nN.WaiqmpoLq6Oeuk9DzNe07.SNCP.xsPTMOUZW4GXUgz/yUekaES',NULL,'2025-08-13 02:27:39','2025-08-13 02:28:02','2025-08-13 02:28:02',1,1,NULL,NULL,NULL),
(29,'1591596@qq.com',NULL,NULL,'$2a$10$9so/6EMGVNdIse6x7OSHXOUXx7.xzF5jV/F25lR.ktc8BwKED7KIm',NULL,'2025-08-13 02:34:05','2025-08-13 02:34:24','2025-08-13 02:34:24',1,1,NULL,NULL,NULL),
(30,'14723@qq.com',NULL,NULL,'$2a$10$pUi0kop2meoNmKNCmErGZ.y.94oVsSAhbVwJ/jubhFBx8AkNq3.bi',NULL,'2025-08-13 02:36:22','2025-08-13 02:36:45','2025-08-13 02:36:45',1,1,NULL,NULL,NULL),
(31,'131313@qq.com',NULL,NULL,'$2a$10$0iqczFm6MzgDPIia2zxLtulzO8LaIMX4/a6wZBYErusBIzA6Queh2',NULL,'2025-08-13 02:38:56','2025-08-13 02:39:15','2025-08-13 02:39:15',1,1,NULL,NULL,NULL),
(32,'141414@qq.com',NULL,NULL,'$2a$10$ausqjuBF05auhV0I1kHHWu3A8sqp9A27fMfSbcQH2lk/O8fpMZFr2',NULL,'2025-08-13 02:47:07','2025-08-18 08:28:35','2025-08-18 08:28:35',1,1,NULL,NULL,NULL),
(33,'161616@qq.com',NULL,NULL,'$2a$10$iIUj..I3.qmJVy9SXSp61uYYwFJJuGp2dz5Q2KZhDU72G6eOYfuH2','TRX5464SA','2025-08-13 03:05:54','2025-09-06 17:34:09','2025-09-06 17:34:09',1,1,NULL,NULL,NULL),
(35,'testuser@example.com',NULL,NULL,'$2a$10$F6Qz.qMhnIrDa2kCifW0b.wgHACWcdPUxd2zT/a9/71umtAq5DxDi',NULL,'2025-08-14 12:08:20','2025-08-14 12:08:20',NULL,1,1,NULL,NULL,NULL),
(36,'testuser2@example.com',NULL,NULL,'$2a$10$66gOTswsguNcFRsXyYYrxOVbIsGIrTPhC.Q9g01qkJD16nUybFbQK',NULL,'2025-08-14 12:15:31','2025-08-14 12:15:31',NULL,1,1,NULL,NULL,NULL),
(37,'191919@qq.com',NULL,NULL,'$2a$10$7ajRJJcc.ODZX0wr7iBwkedkvhqE/csnwH9IMP8apXnfg6khe8dvS',NULL,'2025-08-14 12:18:02','2025-08-18 08:26:38','2025-08-18 08:26:38',1,1,NULL,NULL,NULL),
(38,'test1755507156663@example.com',NULL,NULL,'$2a$10$SnTRb5CJ01trDrlnqxOPPeN28go18uUs.MhUFwnhs7nzZ3UbMBEpy',NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36',NULL,1,1,NULL,NULL,NULL),
(40,'test1@example.com',NULL,NULL,'$2a$10$lZ3RYUEm9NWj3YZpq9v7yOB09N0GMITZ/sqMtKHOqJlRY5RJfcJyO',NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52',NULL,1,1,NULL,NULL,NULL),
(41,'teamtest1@example.com',NULL,NULL,'$2a$10$87qAVUL8DSJHfGw88d52sOpkFSytX2zsUCR3G08WmrH5kVb3FjZrG',NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08',NULL,1,1,NULL,NULL,NULL),
(42,'teamtest1_1755514453504@example.com',NULL,NULL,'$2a$10$ZqnIJwheLWLjxNbLhJHDUuihaTqjPMPUv6tXjCmTZ10Gy9Cgs66qK',NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13',NULL,1,1,NULL,NULL,NULL),
(43,'teamtest2_1755514453504@example.com',NULL,NULL,'$2a$10$yNfT2JjECEB9jhi6IF3V1.z1xJ2A5nFKe9tqFqwclTsail6H/RUcu',NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13',NULL,1,1,NULL,NULL,NULL),
(44,'teamtest3_1755514453504@example.com',NULL,NULL,'$2a$10$vcTn7aP8FAGqNud57GJhIeDrmsXVAy.nWXx18nhj3/MGJ/sh6Yg96',NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13',NULL,1,1,NULL,NULL,NULL),
(45,'121212@qq.com',NULL,NULL,'$2a$10$3bR/tcWRNCiT5Mp3j.EPyuJCZAPe37TejVXCCBecgsqGVGnVg18z6',NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03',NULL,1,1,NULL,NULL,NULL),
(46,'171717@qq.com',NULL,NULL,'$2a$10$yPLD1MjBcAYtZPamGO8F8uzMPA9ZYXzilI13Y44SG1MflEdYlO3KG',NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17',NULL,1,1,NULL,NULL,NULL),
(47,'test_team_1755523827104@example.com',NULL,NULL,'$2a$10$fw0jc.D.O/4Nj6aIvKcKbeDAQdH7e0KP9mCEIfemTAl4Uy/0pjVDi',NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27',NULL,1,1,NULL,NULL,NULL),
(48,'test_team_1755523875539@example.com',NULL,NULL,'$2a$10$73il1u.b/M/D7Dg9DgGJiuyAUZNknyhzgmZChKReMB.pUPc5yZHgu',NULL,'2025-08-18 13:31:15','2025-08-20 10:53:41',NULL,1,1,NULL,NULL,NULL),
(49,'test123@example.com',NULL,NULL,'123456',NULL,'2025-08-21 04:08:36','2025-08-21 04:08:36',NULL,1,1,NULL,NULL,NULL),
(50,'191613@qq.com',NULL,NULL,'123456',NULL,'2025-08-21 04:17:14','2025-08-21 04:17:14',NULL,1,1,NULL,NULL,NULL),
(51,'test1755754074537@example.com',NULL,NULL,'123456',NULL,'2025-08-21 05:27:54','2025-08-21 05:27:54',NULL,1,1,NULL,NULL,NULL),
(52,'test1755760074193@example.com',NULL,NULL,'123456',NULL,'2025-08-21 07:07:54','2025-08-21 07:07:54',NULL,1,1,NULL,NULL,NULL),
(53,'test1755762540315@example.com',NULL,NULL,'123456',NULL,'2025-08-21 07:49:00','2025-08-21 07:49:00',NULL,1,1,NULL,NULL,NULL),
(54,'test1755763301131@example.com',NULL,NULL,'123456',NULL,'2025-08-21 08:01:41','2025-08-21 08:01:41',NULL,1,1,NULL,NULL,NULL),
(55,'test1755767426911@example.com',NULL,NULL,'123456',NULL,'2025-08-21 09:10:26','2025-08-21 09:10:26',NULL,1,1,NULL,NULL,NULL),
(56,'151516@qq.com',NULL,NULL,'123456',NULL,'2025-08-21 09:13:13','2025-08-21 09:13:13',NULL,1,1,NULL,NULL,NULL),
(57,'newuser@example.com',NULL,NULL,'$2a$10$aQ8t2Kgir/nyUmNgkv6.k.rxiXAr6Nxb8PJ4dcsMjlBIgDGJpajoO',NULL,'2025-08-24 13:17:09','2025-08-24 13:17:09',NULL,1,1,NULL,NULL,NULL),
(58,'1919129@qq.com',NULL,NULL,'$2a$10$kVUBPj3kY3Z2MAmWB/zg0uyHlmOTpuCBbXrfYIOwFnyvUA9UtNaGu',NULL,'2025-08-27 11:48:45','2025-08-27 11:48:45',NULL,1,1,NULL,NULL,NULL),
(59,'test_1756386790171@example.com',NULL,NULL,'$2a$10$pCeyoyuMit5.ifa814pq2.GIfk0/Y3kEN6t4vQy81nG/Gydy9b9H6',NULL,'2025-08-28 13:13:10','2025-08-28 13:13:10',NULL,1,1,NULL,NULL,NULL),
(60,'test_1756386959800@example.com',NULL,NULL,'$2a$10$BfHd6Lk/kJ1xuhMQdklD6ehFxiKSqMaBIRZ07RYe6kwjGPVGfbW6m',NULL,'2025-08-28 13:15:59','2025-08-28 13:15:59',NULL,1,1,NULL,NULL,NULL),
(61,'test_1756387387657@example.com',NULL,NULL,'$2a$10$5UwAvwbs8y13MO/rifmSzOfUtadHxr6pRI2DWw576Gt0zcgtYMthO',NULL,'2025-08-28 13:23:07','2025-08-28 13:23:07',NULL,1,1,NULL,NULL,NULL),
(62,'test_1756389746384@example.com',NULL,NULL,'$2a$10$kw3K06mo1oAuy3FcWYpy6e.UHhullGqGdATpEyhGzniqQ3XvC0kgu',NULL,'2025-08-28 14:02:26','2025-08-28 14:02:26',NULL,1,1,NULL,NULL,NULL),
(63,'test_1756444661972@example.com',NULL,NULL,'$2a$10$TjszaLwbPoQXDDep0hzHyuGyr3pCxE5UmJIe0.rakzkqZMRCkj9ee',NULL,'2025-08-29 05:17:42','2025-08-29 05:17:42',NULL,1,1,NULL,NULL,NULL),
(64,'test_1756444925270@example.com',NULL,NULL,'$2a$10$.mIJtp4F7gPwsYdbzkm36.k.eTILvVsXeig9Uab.Dchq.qd.ZjeCG',NULL,'2025-08-29 05:22:05','2025-08-29 05:22:05',NULL,1,1,NULL,NULL,NULL),
(65,'test_1756447899228@example.com',NULL,NULL,'$2a$10$UjTgPFZm4XipcHPClXOt0OUTCJJHgEBuYDMRJs7Ech9CykOC3oiru',NULL,'2025-08-29 06:11:39','2025-08-29 06:11:39',NULL,1,1,NULL,NULL,NULL),
(66,'test_1756447986088@example.com',NULL,NULL,'$2a$10$dMP1e8O8enV1ajzu0o9ew.WENiRTJYDQsWytpiZJELoPfh/fR6aMi',NULL,'2025-08-29 06:13:06','2025-08-29 06:13:06',NULL,1,1,NULL,NULL,NULL),
(67,'test_1756448039835@example.com',NULL,NULL,'$2a$10$TPWRZaavWrQTVP1LqfiEu.99z0IcHi8yZiyjHF7QzX/5n1PXIkFvG',NULL,'2025-08-29 06:13:59','2025-08-29 06:13:59',NULL,1,1,NULL,NULL,NULL),
(68,'test_1756448092698@example.com',NULL,NULL,'$2a$10$BhWSUar1fSkwesvvBtbRe.z1uWTm0HODLQDi8YhILVFObmxopbITu',NULL,'2025-08-29 06:14:52','2025-08-29 06:14:52',NULL,1,1,NULL,NULL,NULL),
(69,'test_1756448165460@example.com',NULL,NULL,'$2a$10$cEDTnWNWJizOIFtt1GgDceKZEiVJkP2RnQ5/4eN6BsyQmPp4iwxWO',NULL,'2025-08-29 06:16:05','2025-08-29 06:16:05',NULL,1,1,NULL,NULL,NULL),
(71,'telegram_123456789@fit challenge.com',NULL,NULL,'6IdDBFgTtUnw',NULL,'2025-08-29 06:26:59','2025-08-29 06:50:30','2025-08-29 06:50:30',1,1,123456789,'Test','User'),
(72,'telegram_5201277303@fit challenge.com',NULL,NULL,'okydzGSMW7xx',NULL,'2025-08-29 09:21:37','2025-08-29 09:21:37',NULL,1,1,5201277303,'贝樂',''),
(73,'telegram_1756470460575@fit challenge.com',NULL,NULL,'ZJJxnYcksnqv',NULL,'2025-08-29 12:27:40','2025-08-29 12:27:40','2025-08-29 12:27:40',1,1,1756470460575,'测试用户','新用户'),
(74,'telegram_1756470459617@fit challenge.com',NULL,NULL,'DV5GmLnH2Ezt',NULL,'2025-08-29 12:27:40','2025-08-29 12:27:40','2025-08-29 12:27:40',1,1,1756470459617,'测试用户','现有用户'),
(75,'telegram_1756470466876@fit challenge.com',NULL,NULL,'GVMMMFYwgaMu',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466876,'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA','BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'),
(76,'telegram_1756470466877@fit challenge.com',NULL,NULL,'AWFHPayMQSDP',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466877,'测试用户!@#$%^&*()','特殊字符_+-=[]{}|;:,.<>?'),
(77,'telegram_1756470466878@fit challenge.com',NULL,NULL,'pqjFY5bNDiku',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466878,'测试用户🚀🎉🌟','表情符号用户😊🎯💪'),
(78,'telegram_1756470466908@fit challenge.com',NULL,NULL,'Oytbzhw7zDny',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466908,'并发用户0','测试0'),
(79,'telegram_1756470467909@fit challenge.com',NULL,NULL,'TDwEu4l3yOlf',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470467909,'并发用户1','测试1'),
(80,'telegram_1756470469910@fit challenge.com',NULL,NULL,'GKhc0klMNzpH',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470469910,'并发用户3','测试3'),
(81,'telegram_1756470468909@fit challenge.com',NULL,NULL,'OjTe00Oc7UXj',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470468909,'并发用户2','测试2'),
(82,'telegram_1756470470911@fit challenge.com',NULL,NULL,'lKQ5QOSxzroA',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470470911,'并发用户4','测试4'),
(83,'telegram_1756470477213@fit challenge.com',NULL,NULL,'3yDa2jQcNRGv',NULL,'2025-08-29 12:27:47','2025-08-29 12:27:47','2025-08-29 12:27:47',1,1,1756470477213,'性能测试用户','测试'),
(84,'telegram_1756470476526@fit challenge.com',NULL,NULL,'AFKQb4O2uKtx',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470476526,'压力测试用户266','测试144'),
(85,'telegram_1756470474962@fit challenge.com',NULL,NULL,'elqAF5NutIz4',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470474962,'压力测试用户428','测试828'),
(86,'telegram_1756470475375@fit challenge.com',NULL,NULL,'TjBoGD1NAieL',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470475375,'压力测试用户322','测试880'),
(87,'telegram_1756470483568@fit challenge.com',NULL,NULL,'DQ60HabAuMra',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470483568,'压力测试用户24','测试959'),
(88,'telegram_1756470480388@fit challenge.com',NULL,NULL,'ftTeNghAJOWd',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470480388,'压力测试用户308','测试853'),
(89,'telegram_1756470478179@fit challenge.com',NULL,NULL,'Qy2j7NmJ7Ok2',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470478179,'压力测试用户867','测试6'),
(90,'telegram_1756470475206@fit challenge.com',NULL,NULL,'pLS4bOOaBBMD',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470475206,'压力测试用户513','测试157'),
(91,'telegram_1756470481672@fit challenge.com',NULL,NULL,'lCHdD00GT8Dg',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470481672,'压力测试用户39','测试473'),
(92,'telegram_1756470483044@fit challenge.com',NULL,NULL,'I8mdSOFcWcEE',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470483044,'压力测试用户329','测试661'),
(93,'telegram_1756470484793@fit challenge.com',NULL,NULL,'FmXMHtBx94oB',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470484793,'压力测试用户613','测试543'),
(94,'telegram_1756470480729@fit challenge.com',NULL,NULL,'SH373bYU67ES',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470480729,'压力测试用户927','测试975'),
(95,'telegram_1756470483123@fit challenge.com',NULL,NULL,'1FV8rQabM8Ui',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470483123,'压力测试用户696','测试611'),
(96,'telegram_1756470476497@fit challenge.com',NULL,NULL,'NjdMrgFQ8NBI',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470476497,'压力测试用户495','测试218'),
(97,'telegram_1756470482111@fit challenge.com',NULL,NULL,'UAqifxjzg8gU',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470482111,'压力测试用户614','测试296'),
(98,'telegram_1756470477397@fit challenge.com',NULL,NULL,'1cRJLDognLUO',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470477397,'压力测试用户809','测试370'),
(99,'telegram_1756470480860@fit challenge.com',NULL,NULL,'A4hsWErSi623',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470480860,'压力测试用户268','测试91'),
(100,'telegram_1756470478245@fit challenge.com',NULL,NULL,'ajMTGhfjLXIW',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470478245,'压力测试用户37','测试68'),
(101,'telegram_1756470476656@fit challenge.com',NULL,NULL,'APM0W6EsfWNy',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470476656,'压力测试用户525','测试268'),
(102,'telegram_1756470483831@fit challenge.com',NULL,NULL,'rvZADCrHiI1C',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470483831,'压力测试用户248','测试573'),
(103,'telegram_1756470480896@fit challenge.com',NULL,NULL,'empXjbQGlp8Q',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470480896,'压力测试用户599','测试693'),
(104,'telegram_1756470479655@fit challenge.com',NULL,NULL,'NTmBZm62Dfbz',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470479655,'压力测试用户149','测试665'),
(105,'telegram_1756470481524@fit challenge.com',NULL,NULL,'jdq3ElTGhsn0',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470481524,'压力测试用户693','测试191'),
(106,'telegram_1756470480189@fit challenge.com',NULL,NULL,'TAcAaqcSdNPW',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470480189,'压力测试用户667','测试217'),
(107,'telegram_1756470484037@fit challenge.com',NULL,NULL,'Dd5OMl99Fs6U',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484037,'压力测试用户597','测试896'),
(108,'telegram_1756470482197@fit challenge.com',NULL,NULL,'pcuhbk2Ebj7C',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482197,'压力测试用户988','测试290'),
(109,'telegram_1756470479560@fit challenge.com',NULL,NULL,'Ro6JJxPinQE3',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470479560,'压力测试用户765','测试463'),
(110,'telegram_1756470485464@fit challenge.com',NULL,NULL,'unpqU4LpxknJ',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470485464,'压力测试用户765','测试263'),
(111,'telegram_1756470482384@fit challenge.com',NULL,NULL,'arcwSSnMJCP8',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482384,'压力测试用户165','测试353'),
(112,'telegram_1756470480123@fit challenge.com',NULL,NULL,'h3QSUPqtGJpK',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470480123,'压力测试用户64','测试413'),
(113,'telegram_1756470477307@fit challenge.com',NULL,NULL,'KdNqMpKJqY4p',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470477307,'压力测试用户645','测试616'),
(114,'telegram_1756470484184@fit challenge.com',NULL,NULL,'T9xSLqYAlqQy',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484184,'压力测试用户554','测试255'),
(115,'telegram_1756470484601@fit challenge.com',NULL,NULL,'qbt663evVfbn',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484601,'压力测试用户565','测试142'),
(116,'telegram_1756470484958@fit challenge.com',NULL,NULL,'OXkFLkUY5bhO',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484958,'压力测试用户291','测试928'),
(117,'telegram_1756470481977@fit challenge.com',NULL,NULL,'KfRmQqf1Rte3',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470481977,'压力测试用户764','测试76'),
(118,'telegram_1756470485467@fit challenge.com',NULL,NULL,'j2mXmKaqxeCb',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470485467,'压力测试用户85','测试741'),
(119,'telegram_1756470482682@fit challenge.com',NULL,NULL,'o4jayoQONYJ5',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482682,'压力测试用户521','测试395'),
(120,'telegram_1756470486301@fit challenge.com',NULL,NULL,'FPisz8CB6RxG',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470486301,'压力测试用户798','测试387'),
(121,'telegram_1756470481811@fit challenge.com',NULL,NULL,'w6872sTqKFgo',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470481811,'压力测试用户153','测试276'),
(122,'telegram_1756470482402@fit challenge.com',NULL,NULL,'CqCO2BKle8xX',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482402,'压力测试用户195','测试262'),
(123,'telegram_1756470478436@fit challenge.com',NULL,NULL,'pWU3AWgJOdFC',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470478436,'压力测试用户411','测试485'),
(124,'telegram_1756470483596@fit challenge.com',NULL,NULL,'eyhhBJwUJbhj',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470483596,'压力测试用户155','测试219'),
(125,'telegram_1756470484753@fit challenge.com',NULL,NULL,'GnjYa7G5M0PN',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484753,'压力测试用户918','测试818'),
(126,'telegram_1756470509990@fit challenge.com',NULL,NULL,'2JMd6Prowg36',NULL,'2025-08-29 12:28:29','2025-08-29 12:28:29','2025-08-29 12:28:29',1,1,1756470509990,'<script>alert(\'XSS\')</script>','<img src=x onerror=alert(\'XSS\')>'),
(127,'test@test.com',NULL,NULL,'$2a$10$U6316/iqvrsKb0u5ybIJf.BEHXFrHFWSBPWNldNL36CQSRI1RtZzm',NULL,'2025-08-31 12:37:53','2025-08-31 12:37:53',NULL,1,1,NULL,NULL,NULL),
(128,'testuser2025@example.com',NULL,NULL,'$2a$10$YFc7HlimJ4UFvtbVJH1knef89DlMg8kttTUjHDDmI0bZwUR5cHILe',NULL,'2025-09-01 11:42:05','2025-09-01 11:42:05',NULL,1,1,NULL,NULL,NULL),
(129,'test1756727093284@example.com',NULL,NULL,'$2a$10$kPumZDTigR4ADYxajfFW0.ar6sB7DzFMjFkftHJUxeBHr6t60Y62u',NULL,'2025-09-01 11:44:53','2025-09-01 11:44:53',NULL,1,1,NULL,NULL,NULL),
(130,'test1756727189564@example.com',NULL,NULL,'$2a$10$MmseW3zyUry8f.HE.YqCTeXfAC55JrYnCbqSMS43CRj2yYkCUMg4a',NULL,'2025-09-01 11:46:29','2025-09-01 11:46:29',NULL,1,1,NULL,NULL,NULL),
(131,'test1756731876140@example.com',NULL,NULL,'$2a$10$99A3aHDXBt/jDF5FSkwO1ezChxpNzXgCP7corLc7YuRfqtCd.qiUC',NULL,'2025-09-01 13:04:36','2025-09-01 13:04:36',NULL,1,1,NULL,NULL,NULL),
(132,'test1756732028741@example.com',NULL,NULL,'$2a$10$inVugVfOjpogImCo8.TcsO8B7G4v/M45.D8zGB31hzKGJNhnMV3ZG',NULL,'2025-09-01 13:07:08','2025-09-01 13:07:08',NULL,1,1,NULL,NULL,NULL),
(133,'test1756732733167@example.com',NULL,NULL,'$2a$10$hep/21LloSwqkcX5qhfzgO7FyWxvcSPV.Yy.HAR8KPVcD9lqV0ymS',NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53',NULL,1,1,NULL,NULL,NULL),
(134,'test1756732846772@example.com',NULL,NULL,'$2a$10$Out1Ge5WaIbOBR5wfTJ08eQgNmDBU4GdyX3PtzkNQWy/HbP.Wxxcu',NULL,'2025-09-01 13:20:46','2025-09-01 13:20:46',NULL,1,1,NULL,NULL,NULL),
(135,'test1756858588401@example.com',NULL,NULL,'$2a$10$IXF/vxoecDwbOfa7Ji7j/eonJuZvJ3r8W3aif1xP.SXs5evgT3ZXG',NULL,'2025-09-03 00:16:28','2025-09-03 00:16:28',NULL,1,1,NULL,NULL,NULL),
(136,'test1756858776567@example.com',NULL,NULL,'$2a$10$7KHEBG6PK5gHlh3fmDCvfuz1Ed/Wqz38IzXiZ4z9CYdw.NYuKAFGO',NULL,'2025-09-03 00:19:36','2025-09-03 00:19:36',NULL,1,1,NULL,NULL,NULL),
(137,'test1756858997487@example.com',NULL,NULL,'$2a$10$S5UDmPVorxybjcG5LePz5OkWsPT1hQ8NPFtM67hkh/Qy3OA8f4jo.',NULL,'2025-09-03 00:23:17','2025-09-03 00:23:17','2025-09-03 00:23:17',1,1,NULL,NULL,NULL),
(138,'test1756859197903@example.com',NULL,NULL,'$2a$10$IbJwq3CEnsfMwM6n0UqVNejUDNzIMwggvG4rZtfXMOzcxve3NekSm',NULL,'2025-09-03 00:26:38','2025-09-03 00:26:38','2025-09-03 00:26:38',1,1,NULL,NULL,NULL),
(139,'test20250903082658@example.com',NULL,NULL,'$2a$10$idUxTPdZMOvU3mIu8tOBfewKPsQwbjn6X0.Dw9CSOupxcgQhg1DOi',NULL,'2025-09-03 00:26:58','2025-09-03 00:26:58',NULL,1,1,NULL,NULL,NULL),
(140,'test20250903082848@example.com',NULL,NULL,'$2a$10$mHNs2cugnvCYt8GlKp2wxeZNv7flV0uXMIG01qM7UVX84UKv1C7Ka',NULL,'2025-09-03 00:28:48','2025-09-03 00:28:48','2025-09-03 00:28:48',1,1,NULL,NULL,NULL),
(141,'test20250903082902@example.com',NULL,NULL,'$2a$10$VuIvQ9wlfV17UaKaCaG2nOWHaVmjF50wWzWePHBm1FahXvz5pdoHa',NULL,'2025-09-03 00:29:02','2025-09-03 00:29:02',NULL,1,1,NULL,NULL,NULL),
(142,'test1756859496647@example.com',NULL,NULL,'$2a$10$2qWbpmboft1A1SKJW5JdIu2DnNrHOwBYaUXEUcD.bNQeI0QzuTEW2',NULL,'2025-09-03 00:31:36','2025-09-03 00:31:36','2025-09-03 00:31:36',1,1,NULL,NULL,NULL),
(143,'test1756859631933@example.com',NULL,NULL,'$2a$10$9v7lmvUWLVCJNg2WJmTIFOlcSaocOs.9cPBHNDkFbSMMRJ4rZa8zm',NULL,'2025-09-03 00:33:52','2025-09-03 00:33:52','2025-09-03 00:33:52',1,1,NULL,NULL,NULL),
(144,'test1756859818705@example.com',NULL,NULL,'$2a$10$aYfZk0c4nVJOUuJyUJZpAOJavaR6Jt9TdB/4KD4ZDp3Yz3IH15xH.',NULL,'2025-09-03 00:36:58','2025-09-03 00:36:58',NULL,1,1,NULL,NULL,NULL),
(145,'test1756862863858@example.com',NULL,NULL,'$2a$10$LKHnRKhqqNy5/EEGhQF1EOqSgf6suY5mOT7rHFzTiFzo4hJ70v4.i',NULL,'2025-09-03 01:27:44','2025-09-03 01:27:44',NULL,1,1,NULL,NULL,NULL),
(146,'test1756863261772@example.com',NULL,NULL,'$2a$10$MhTQsyqmrjMbHpsN8AJmFebM57UmX7zazXIYqg364QMpcJdSlxHH.','TRC65464as6dad','2025-09-03 01:34:21','2025-09-03 10:47:31',NULL,1,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_backup_20250903_190539`
--

DROP TABLE IF EXISTS `users_backup_20250903_190539`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_backup_20250903_190539` (
  `id` int(11) NOT NULL DEFAULT 0,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `trc20_wallet` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `pk_enabled` tinyint(1) DEFAULT 1,
  `telegram_id` bigint(20) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_backup_20250903_190539`
--

LOCK TABLES `users_backup_20250903_190539` WRITE;
/*!40000 ALTER TABLE `users_backup_20250903_190539` DISABLE KEYS */;
INSERT INTO `users_backup_20250903_190539` VALUES
(1,'newuser2025','newuser2025@example.com',NULL,NULL,'$2a$10$UrkQm1St5nP838jq3EZw0OiAQV1S6fPlVkkKbHlmb.szsRHXgyIDm',NULL,'2025-08-12 17:05:51','2025-08-12 17:05:51',NULL,1,1,NULL,NULL,NULL),
(2,'159863','159863@qq.com',NULL,NULL,'/KeWQm5uU1DZQFRWy8gSl3vHVycjh85iFllYTji',NULL,'2025-08-12 17:17:47','2025-08-23 14:07:05',NULL,1,1,NULL,NULL,NULL),
(5,'testuser1_updated','tes1t@example.com',NULL,NULL,'$2a$10$8.RI9V7EL7Z3Sh2siqm/E.jTyozUg8WK.yzdKsMjh0ZxOEXct8h5q',NULL,'2025-08-12 18:15:43','2025-08-29 06:16:05','2025-08-29 06:16:05',1,1,NULL,NULL,NULL),
(7,'testuser9','9test@example.com',NULL,NULL,'$2a$10$lcwruXLBoIlglkldMn0R7ugyeo1uftwK4IWDGEwbNrmwanrcUCKdm',NULL,'2025-08-12 18:19:01','2025-08-12 18:19:01',NULL,1,1,NULL,NULL,NULL),
(8,'12346','12346@example.com',NULL,NULL,'$2a$10$ZXVIo1TIvt6VGsPz8pJwqOumz.KVNhaCsZK.NyM/FLtqKDdYe.NGW',NULL,'2025-08-12 18:25:58','2025-08-12 18:25:58',NULL,1,1,NULL,NULL,NULL),
(12,'159369','159369@qq.com',NULL,NULL,'$2a$10$p1OqJeLB3qliB952BrzmK.wbMRl3W5ZtH9eULtmbaD2oy.j2OqsxW',NULL,'2025-08-13 01:00:57','2025-08-13 01:01:04','2025-08-13 01:01:04',1,1,NULL,NULL,NULL),
(13,'169853','169853@qq.com',NULL,NULL,'$2a$10$anxdwZ4pA8LM8ar8y/80u.PSz50qMq1KaaVoPv9WpsLudyVOrpnQi',NULL,'2025-08-13 01:04:00','2025-08-13 01:04:00',NULL,1,1,NULL,NULL,NULL),
(14,'852963','852963@qq.com',NULL,NULL,'$2a$10$aqT79h5YltTqBEfx.K/sTuM8rD6KtTFENBTC5sggQDZdo73IQG2gm',NULL,'2025-08-13 01:07:08','2025-08-13 01:07:08',NULL,1,1,NULL,NULL,NULL),
(15,'1472593','1472593@qq.com',NULL,NULL,'$2a$10$dm801kXgmW/SER28IEIR/OSMM.srY0uE/qvveBoCJ1tgnFHn.dVoW',NULL,'2025-08-13 01:11:38','2025-08-13 01:11:38',NULL,1,1,NULL,NULL,NULL),
(16,'156982','156982@qq.com',NULL,NULL,'$2a$10$zoPe0zvQlglE6l4f5Anw9.VbNUGlEKS2XmL.TAVCh0WiQ7oAcAgXC',NULL,'2025-08-13 01:13:51','2025-08-13 01:13:51',NULL,1,1,NULL,NULL,NULL),
(17,'14963','14963@qq.com',NULL,NULL,'$2a$10$wDjnpF5x1v0DGDwf5.NqPOApih0A232PhkpSA11rHQG1YIm87OQW2',NULL,'2025-08-13 01:16:53','2025-08-13 01:16:53',NULL,1,1,NULL,NULL,NULL),
(18,'369852','369852@qq.com',NULL,NULL,'$2a$10$cRLXBCkxEe5O/38lCoY6jO2chp1tDdnac0jcfM/7kk3JtPiP/um9C',NULL,'2025-08-13 01:19:59','2025-08-13 01:19:59',NULL,1,1,NULL,NULL,NULL),
(19,'123659','123659@qq.com',NULL,NULL,'$2a$10$Q0l7aEJN95jQ3.FawnHx9OpkGeUYSCuqv2KBAeOElRjlga9rzbC.W',NULL,'2025-08-13 01:23:38','2025-08-13 01:23:38',NULL,1,1,NULL,NULL,NULL),
(20,'985631','985631@qq.com',NULL,NULL,'$2a$10$yWH7RD1IVVPWiJ6mGhFxWu3aSeNVCXnL53H1PGCEPE5mJpNo4Zk.2',NULL,'2025-08-13 01:26:33','2025-08-13 01:26:33',NULL,1,1,NULL,NULL,NULL),
(21,'1471111','1471111@qq.com',NULL,NULL,'$2a$10$.z25auGLUAGEb2T7XXiEzOD4gSsEapy7SGLRYIbiinwFMQS7KQGcq',NULL,'2025-08-13 01:34:41','2025-08-13 01:34:41',NULL,1,1,NULL,NULL,NULL),
(22,'11111','11111@qq.com',NULL,NULL,'$2a$10$IN557rRhMyTggsAt.1.F3eq9tQZnnA551IMzwtPAQVPqp9BRhnKTi',NULL,'2025-08-13 01:37:37','2025-08-13 01:37:37',NULL,1,1,NULL,NULL,NULL),
(23,'testuser','test@example.com',NULL,NULL,'$2a$10$d4fyPgM.Hv7K69iGOPDTo.z4EUN5MrHNu0sAi7qesdu62mbJf1yTq','TTest1755767497113Example','2025-08-13 02:08:28','2025-08-25 09:27:16','2025-08-25 09:27:16',1,1,NULL,NULL,NULL),
(24,'testuser1755050911320','test1755050911320@example.com',NULL,NULL,'$2a$10$.mhTu/uO3/9DsX1drzg9t.9kjEXmz4TppE1F2ezzSj3GDSTjSl9yW',NULL,'2025-08-13 02:08:31','2025-08-13 02:08:31',NULL,1,1,NULL,NULL,NULL),
(25,'9999','9999@qq.com',NULL,NULL,'$2a$10$dpDCQJDuadyEXpX91koRQ.jqB0DQ866aB7bvjhnT.w3mBOgvxWRmK',NULL,'2025-08-13 02:09:29','2025-08-13 02:10:19','2025-08-13 02:10:19',1,1,NULL,NULL,NULL),
(26,'989898','989898@qq.com',NULL,NULL,'$2a$10$nuowf/gG77NfOjW4CbImkOdmmgfEas9VIDjG509ZUrjUR5uZfm3aO',NULL,'2025-08-13 02:16:22','2025-08-13 02:17:02','2025-08-13 02:17:02',1,1,NULL,NULL,NULL),
(27,'123123','123123@qq.com',NULL,NULL,'$2a$10$EHMrbpDRnWEKWy8weLl9quFPqPnVV3BKP7..y/OT9NhuN6.bXZkXy',NULL,'2025-08-13 02:20:02','2025-08-13 02:20:24','2025-08-13 02:20:24',1,1,NULL,NULL,NULL),
(28,'3693699','3693699@qq.com',NULL,NULL,'$2a$10$nN.WaiqmpoLq6Oeuk9DzNe07.SNCP.xsPTMOUZW4GXUgz/yUekaES',NULL,'2025-08-13 02:27:39','2025-08-13 02:28:02','2025-08-13 02:28:02',1,1,NULL,NULL,NULL),
(29,'1591596','1591596@qq.com',NULL,NULL,'$2a$10$9so/6EMGVNdIse6x7OSHXOUXx7.xzF5jV/F25lR.ktc8BwKED7KIm',NULL,'2025-08-13 02:34:05','2025-08-13 02:34:24','2025-08-13 02:34:24',1,1,NULL,NULL,NULL),
(30,'14723','14723@qq.com',NULL,NULL,'$2a$10$pUi0kop2meoNmKNCmErGZ.y.94oVsSAhbVwJ/jubhFBx8AkNq3.bi',NULL,'2025-08-13 02:36:22','2025-08-13 02:36:45','2025-08-13 02:36:45',1,1,NULL,NULL,NULL),
(31,'131313','131313@qq.com',NULL,NULL,'$2a$10$0iqczFm6MzgDPIia2zxLtulzO8LaIMX4/a6wZBYErusBIzA6Queh2',NULL,'2025-08-13 02:38:56','2025-08-13 02:39:15','2025-08-13 02:39:15',1,1,NULL,NULL,NULL),
(32,'141414','141414@qq.com',NULL,NULL,'$2a$10$ausqjuBF05auhV0I1kHHWu3A8sqp9A27fMfSbcQH2lk/O8fpMZFr2',NULL,'2025-08-13 02:47:07','2025-08-18 08:28:35','2025-08-18 08:28:35',1,1,NULL,NULL,NULL),
(33,'161616','161616@qq.com',NULL,NULL,'$2a$10$iIUj..I3.qmJVy9SXSp61uYYwFJJuGp2dz5Q2KZhDU72G6eOYfuH2','TRX5464SA','2025-08-13 03:05:54','2025-09-02 17:22:14','2025-09-02 17:22:14',1,1,NULL,NULL,NULL),
(35,'testuser8306','testuser@example.com',NULL,NULL,'$2a$10$F6Qz.qMhnIrDa2kCifW0b.wgHACWcdPUxd2zT/a9/71umtAq5DxDi',NULL,'2025-08-14 12:08:20','2025-08-14 12:08:20',NULL,1,1,NULL,NULL,NULL),
(36,'testuser23623','testuser2@example.com',NULL,NULL,'$2a$10$66gOTswsguNcFRsXyYYrxOVbIsGIrTPhC.Q9g01qkJD16nUybFbQK',NULL,'2025-08-14 12:15:31','2025-08-14 12:15:31',NULL,1,1,NULL,NULL,NULL),
(37,'1919199402','191919@qq.com',NULL,NULL,'$2a$10$7ajRJJcc.ODZX0wr7iBwkedkvhqE/csnwH9IMP8apXnfg6khe8dvS',NULL,'2025-08-14 12:18:02','2025-08-18 08:26:38','2025-08-18 08:26:38',1,1,NULL,NULL,NULL),
(38,'testuser1755507156663','test1755507156663@example.com',NULL,NULL,'$2a$10$SnTRb5CJ01trDrlnqxOPPeN28go18uUs.MhUFwnhs7nzZ3UbMBEpy',NULL,'2025-08-18 08:52:36','2025-08-18 08:52:36',NULL,1,1,NULL,NULL,NULL),
(40,'test17460','test1@example.com',NULL,NULL,'$2a$10$lZ3RYUEm9NWj3YZpq9v7yOB09N0GMITZ/sqMtKHOqJlRY5RJfcJyO',NULL,'2025-08-18 10:49:52','2025-08-18 10:49:52',NULL,1,1,NULL,NULL,NULL),
(41,'teamtest19544','teamtest1@example.com',NULL,NULL,'$2a$10$87qAVUL8DSJHfGw88d52sOpkFSytX2zsUCR3G08WmrH5kVb3FjZrG',NULL,'2025-08-18 10:52:08','2025-08-18 10:52:08',NULL,1,1,NULL,NULL,NULL),
(42,'teamtest1_17555144535044230','teamtest1_1755514453504@example.com',NULL,NULL,'$2a$10$ZqnIJwheLWLjxNbLhJHDUuihaTqjPMPUv6tXjCmTZ10Gy9Cgs66qK',NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13',NULL,1,1,NULL,NULL,NULL),
(43,'teamtest2_17555144535043983','teamtest2_1755514453504@example.com',NULL,NULL,'$2a$10$yNfT2JjECEB9jhi6IF3V1.z1xJ2A5nFKe9tqFqwclTsail6H/RUcu',NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13',NULL,1,1,NULL,NULL,NULL),
(44,'teamtest3_1755514453504133','teamtest3_1755514453504@example.com',NULL,NULL,'$2a$10$vcTn7aP8FAGqNud57GJhIeDrmsXVAy.nWXx18nhj3/MGJ/sh6Yg96',NULL,'2025-08-18 10:54:13','2025-08-18 10:54:13',NULL,1,1,NULL,NULL,NULL),
(45,'121212574','121212@qq.com',NULL,NULL,'$2a$10$3bR/tcWRNCiT5Mp3j.EPyuJCZAPe37TejVXCCBecgsqGVGnVg18z6',NULL,'2025-08-18 12:54:03','2025-08-18 12:54:03',NULL,1,1,NULL,NULL,NULL),
(46,'1717171722','171717@qq.com',NULL,NULL,'$2a$10$yPLD1MjBcAYtZPamGO8F8uzMPA9ZYXzilI13Y44SG1MflEdYlO3KG',NULL,'2025-08-18 13:25:17','2025-08-18 13:25:17',NULL,1,1,NULL,NULL,NULL),
(47,'test_team_17555238271044877','test_team_1755523827104@example.com',NULL,NULL,'$2a$10$fw0jc.D.O/4Nj6aIvKcKbeDAQdH7e0KP9mCEIfemTAl4Uy/0pjVDi',NULL,'2025-08-18 13:30:27','2025-08-18 13:30:27',NULL,1,1,NULL,NULL,NULL),
(48,'test_team_17555238755397452','test_team_1755523875539@example.com',NULL,NULL,'$2a$10$73il1u.b/M/D7Dg9DgGJiuyAUZNknyhzgmZChKReMB.pUPc5yZHgu',NULL,'2025-08-18 13:31:15','2025-08-20 10:53:41',NULL,1,1,NULL,NULL,NULL),
(49,'test123','test123@example.com',NULL,NULL,'123456',NULL,'2025-08-21 04:08:36','2025-08-21 04:08:36',NULL,1,1,NULL,NULL,NULL),
(50,'191613','191613@qq.com',NULL,NULL,'123456',NULL,'2025-08-21 04:17:14','2025-08-21 04:17:14',NULL,1,1,NULL,NULL,NULL),
(51,'test1755754074537','test1755754074537@example.com',NULL,NULL,'123456',NULL,'2025-08-21 05:27:54','2025-08-21 05:27:54',NULL,1,1,NULL,NULL,NULL),
(52,'test1755760074193','test1755760074193@example.com',NULL,NULL,'123456',NULL,'2025-08-21 07:07:54','2025-08-21 07:07:54',NULL,1,1,NULL,NULL,NULL),
(53,'test1755762540315','test1755762540315@example.com',NULL,NULL,'123456',NULL,'2025-08-21 07:49:00','2025-08-21 07:49:00',NULL,1,1,NULL,NULL,NULL),
(54,'test1755763301131','test1755763301131@example.com',NULL,NULL,'123456',NULL,'2025-08-21 08:01:41','2025-08-21 08:01:41',NULL,1,1,NULL,NULL,NULL),
(55,'test1755767426911','test1755767426911@example.com',NULL,NULL,'123456',NULL,'2025-08-21 09:10:26','2025-08-21 09:10:26',NULL,1,1,NULL,NULL,NULL),
(56,'151516','151516@qq.com',NULL,NULL,'123456',NULL,'2025-08-21 09:13:13','2025-08-21 09:13:13',NULL,1,1,NULL,NULL,NULL),
(57,'newuser5521','newuser@example.com',NULL,NULL,'$2a$10$aQ8t2Kgir/nyUmNgkv6.k.rxiXAr6Nxb8PJ4dcsMjlBIgDGJpajoO',NULL,'2025-08-24 13:17:09','2025-08-24 13:17:09',NULL,1,1,NULL,NULL,NULL),
(58,'1919129397','1919129@qq.com',NULL,NULL,'$2a$10$kVUBPj3kY3Z2MAmWB/zg0uyHlmOTpuCBbXrfYIOwFnyvUA9UtNaGu',NULL,'2025-08-27 11:48:45','2025-08-27 11:48:45',NULL,1,1,NULL,NULL,NULL),
(59,'test_17563867901715445','test_1756386790171@example.com',NULL,NULL,'$2a$10$pCeyoyuMit5.ifa814pq2.GIfk0/Y3kEN6t4vQy81nG/Gydy9b9H6',NULL,'2025-08-28 13:13:10','2025-08-28 13:13:10',NULL,1,1,NULL,NULL,NULL),
(60,'test_17563869598003448','test_1756386959800@example.com',NULL,NULL,'$2a$10$BfHd6Lk/kJ1xuhMQdklD6ehFxiKSqMaBIRZ07RYe6kwjGPVGfbW6m',NULL,'2025-08-28 13:15:59','2025-08-28 13:15:59',NULL,1,1,NULL,NULL,NULL),
(61,'test_17563873876578092','test_1756387387657@example.com',NULL,NULL,'$2a$10$5UwAvwbs8y13MO/rifmSzOfUtadHxr6pRI2DWw576Gt0zcgtYMthO',NULL,'2025-08-28 13:23:07','2025-08-28 13:23:07',NULL,1,1,NULL,NULL,NULL),
(62,'test_17563897463845950','test_1756389746384@example.com',NULL,NULL,'$2a$10$kw3K06mo1oAuy3FcWYpy6e.UHhullGqGdATpEyhGzniqQ3XvC0kgu',NULL,'2025-08-28 14:02:26','2025-08-28 14:02:26',NULL,1,1,NULL,NULL,NULL),
(63,'test_17564446619724103','test_1756444661972@example.com',NULL,NULL,'$2a$10$TjszaLwbPoQXDDep0hzHyuGyr3pCxE5UmJIe0.rakzkqZMRCkj9ee',NULL,'2025-08-29 05:17:42','2025-08-29 05:17:42',NULL,1,1,NULL,NULL,NULL),
(64,'test_17564449252703966','test_1756444925270@example.com',NULL,NULL,'$2a$10$.mIJtp4F7gPwsYdbzkm36.k.eTILvVsXeig9Uab.Dchq.qd.ZjeCG',NULL,'2025-08-29 05:22:05','2025-08-29 05:22:05',NULL,1,1,NULL,NULL,NULL),
(65,'test_1756447899228246','test_1756447899228@example.com',NULL,NULL,'$2a$10$UjTgPFZm4XipcHPClXOt0OUTCJJHgEBuYDMRJs7Ech9CykOC3oiru',NULL,'2025-08-29 06:11:39','2025-08-29 06:11:39',NULL,1,1,NULL,NULL,NULL),
(66,'test_17564479860885362','test_1756447986088@example.com',NULL,NULL,'$2a$10$dMP1e8O8enV1ajzu0o9ew.WENiRTJYDQsWytpiZJELoPfh/fR6aMi',NULL,'2025-08-29 06:13:06','2025-08-29 06:13:06',NULL,1,1,NULL,NULL,NULL),
(67,'test_17564480398359915','test_1756448039835@example.com',NULL,NULL,'$2a$10$TPWRZaavWrQTVP1LqfiEu.99z0IcHi8yZiyjHF7QzX/5n1PXIkFvG',NULL,'2025-08-29 06:13:59','2025-08-29 06:13:59',NULL,1,1,NULL,NULL,NULL),
(68,'test_17564480926989290','test_1756448092698@example.com',NULL,NULL,'$2a$10$BhWSUar1fSkwesvvBtbRe.z1uWTm0HODLQDi8YhILVFObmxopbITu',NULL,'2025-08-29 06:14:52','2025-08-29 06:14:52',NULL,1,1,NULL,NULL,NULL),
(69,'test_17564481654607687','test_1756448165460@example.com',NULL,NULL,'$2a$10$cEDTnWNWJizOIFtt1GgDceKZEiVJkP2RnQ5/4eN6BsyQmPp4iwxWO',NULL,'2025-08-29 06:16:05','2025-08-29 06:16:05',NULL,1,1,NULL,NULL,NULL),
(71,'testuser_1756448819371','telegram_123456789@fit challenge.com',NULL,NULL,'6IdDBFgTtUnw',NULL,'2025-08-29 06:26:59','2025-08-29 06:50:30','2025-08-29 06:50:30',1,1,123456789,'Test','User'),
(72,'FDC2578','telegram_5201277303@fit challenge.com',NULL,NULL,'okydzGSMW7xx',NULL,'2025-08-29 09:21:37','2025-08-29 09:21:37',NULL,1,1,5201277303,'贝樂',''),
(73,'testuser_1756470460575','telegram_1756470460575@fit challenge.com',NULL,NULL,'ZJJxnYcksnqv',NULL,'2025-08-29 12:27:40','2025-08-29 12:27:40','2025-08-29 12:27:40',1,1,1756470460575,'测试用户','新用户'),
(74,'testuser_1756470459617','telegram_1756470459617@fit challenge.com',NULL,NULL,'DV5GmLnH2Ezt',NULL,'2025-08-29 12:27:40','2025-08-29 12:27:40','2025-08-29 12:27:40',1,1,1756470459617,'测试用户','现有用户'),
(75,'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC','telegram_1756470466876@fit challenge.com',NULL,NULL,'GVMMMFYwgaMu',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466876,'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA','BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'),
(76,'special_chars_123','telegram_1756470466877@fit challenge.com',NULL,NULL,'AWFHPayMQSDP',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466877,'测试用户!@#$%^&*()','特殊字符_+-=[]{}|;:,.<>?'),
(77,'unicode_user_测试','telegram_1756470466878@fit challenge.com',NULL,NULL,'pqjFY5bNDiku',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466878,'测试用户🚀🎉🌟','表情符号用户😊🎯💪'),
(78,'concurrent_user_0_1756470466908','telegram_1756470466908@fit challenge.com',NULL,NULL,'Oytbzhw7zDny',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470466908,'并发用户0','测试0'),
(79,'concurrent_user_1_1756470466909','telegram_1756470467909@fit challenge.com',NULL,NULL,'TDwEu4l3yOlf',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470467909,'并发用户1','测试1'),
(80,'concurrent_user_3_1756470466910','telegram_1756470469910@fit challenge.com',NULL,NULL,'GKhc0klMNzpH',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470469910,'并发用户3','测试3'),
(81,'concurrent_user_2_1756470466909','telegram_1756470468909@fit challenge.com',NULL,NULL,'OjTe00Oc7UXj',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470468909,'并发用户2','测试2'),
(82,'concurrent_user_4_1756470466911','telegram_1756470470911@fit challenge.com',NULL,NULL,'lKQ5QOSxzroA',NULL,'2025-08-29 12:27:46','2025-08-29 12:27:46','2025-08-29 12:27:46',1,1,1756470470911,'并发用户4','测试4'),
(83,'perf_user_1756470467213','telegram_1756470477213@fit challenge.com',NULL,NULL,'3yDa2jQcNRGv',NULL,'2025-08-29 12:27:47','2025-08-29 12:27:47','2025-08-29 12:27:47',1,1,1756470477213,'性能测试用户','测试'),
(84,'stress_user_1756470474033_156','telegram_1756470476526@fit challenge.com',NULL,NULL,'AFKQb4O2uKtx',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470476526,'压力测试用户266','测试144'),
(85,'stress_user_1756470474036_717','telegram_1756470474962@fit challenge.com',NULL,NULL,'elqAF5NutIz4',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470474962,'压力测试用户428','测试828'),
(86,'stress_user_1756470474037_667','telegram_1756470475375@fit challenge.com',NULL,NULL,'TjBoGD1NAieL',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470475375,'压力测试用户322','测试880'),
(87,'stress_user_1756470474039_838','telegram_1756470483568@fit challenge.com',NULL,NULL,'DQ60HabAuMra',NULL,'2025-08-29 12:27:54','2025-08-29 12:27:54','2025-08-29 12:27:54',1,1,1756470483568,'压力测试用户24','测试959'),
(88,'stress_user_1756470475046_566','telegram_1756470480388@fit challenge.com',NULL,NULL,'ftTeNghAJOWd',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470480388,'压力测试用户308','测试853'),
(89,'stress_user_1756470475047_990','telegram_1756470478179@fit challenge.com',NULL,NULL,'Qy2j7NmJ7Ok2',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470478179,'压力测试用户867','测试6'),
(90,'stress_user_1756470475047_715','telegram_1756470475206@fit challenge.com',NULL,NULL,'pLS4bOOaBBMD',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470475206,'压力测试用户513','测试157'),
(91,'stress_user_1756470475048_425','telegram_1756470481672@fit challenge.com',NULL,NULL,'lCHdD00GT8Dg',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470481672,'压力测试用户39','测试473'),
(92,'stress_user_1756470475048_462','telegram_1756470483044@fit challenge.com',NULL,NULL,'I8mdSOFcWcEE',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470483044,'压力测试用户329','测试661'),
(93,'stress_user_1756470475048_21','telegram_1756470484793@fit challenge.com',NULL,NULL,'FmXMHtBx94oB',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470484793,'压力测试用户613','测试543'),
(94,'stress_user_1756470475049_943','telegram_1756470480729@fit challenge.com',NULL,NULL,'SH373bYU67ES',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470480729,'压力测试用户927','测试975'),
(95,'stress_user_1756470475049_940','telegram_1756470483123@fit challenge.com',NULL,NULL,'1FV8rQabM8Ui',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470483123,'压力测试用户696','测试611'),
(96,'stress_user_1756470475049_704','telegram_1756470476497@fit challenge.com',NULL,NULL,'NjdMrgFQ8NBI',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470476497,'压力测试用户495','测试218'),
(97,'stress_user_1756470475050_679','telegram_1756470482111@fit challenge.com',NULL,NULL,'UAqifxjzg8gU',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470482111,'压力测试用户614','测试296'),
(98,'stress_user_1756470475049_163','telegram_1756470477397@fit challenge.com',NULL,NULL,'1cRJLDognLUO',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470477397,'压力测试用户809','测试370'),
(99,'stress_user_1756470475050_361','telegram_1756470480860@fit challenge.com',NULL,NULL,'A4hsWErSi623',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470480860,'压力测试用户268','测试91'),
(100,'stress_user_1756470475052_891','telegram_1756470478245@fit challenge.com',NULL,NULL,'ajMTGhfjLXIW',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470478245,'压力测试用户37','测试68'),
(101,'stress_user_1756470475050_192','telegram_1756470476656@fit challenge.com',NULL,NULL,'APM0W6EsfWNy',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470476656,'压力测试用户525','测试268'),
(102,'stress_user_1756470475050_345','telegram_1756470483831@fit challenge.com',NULL,NULL,'rvZADCrHiI1C',NULL,'2025-08-29 12:27:55','2025-08-29 12:27:55','2025-08-29 12:27:55',1,1,1756470483831,'压力测试用户248','测试573'),
(103,'stress_user_1756470477263_459','telegram_1756470480896@fit challenge.com',NULL,NULL,'empXjbQGlp8Q',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470480896,'压力测试用户599','测试693'),
(104,'stress_user_1756470477263_468','telegram_1756470479655@fit challenge.com',NULL,NULL,'NTmBZm62Dfbz',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470479655,'压力测试用户149','测试665'),
(105,'stress_user_1756470477263_889','telegram_1756470481524@fit challenge.com',NULL,NULL,'jdq3ElTGhsn0',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470481524,'压力测试用户693','测试191'),
(106,'stress_user_1756470477263_925','telegram_1756470480189@fit challenge.com',NULL,NULL,'TAcAaqcSdNPW',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470480189,'压力测试用户667','测试217'),
(107,'stress_user_1756470477263_906','telegram_1756470484037@fit challenge.com',NULL,NULL,'Dd5OMl99Fs6U',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484037,'压力测试用户597','测试896'),
(108,'stress_user_1756470477264_686','telegram_1756470482197@fit challenge.com',NULL,NULL,'pcuhbk2Ebj7C',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482197,'压力测试用户988','测试290'),
(109,'stress_user_1756470477264_124','telegram_1756470479560@fit challenge.com',NULL,NULL,'Ro6JJxPinQE3',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470479560,'压力测试用户765','测试463'),
(110,'stress_user_1756470477264_291','telegram_1756470485464@fit challenge.com',NULL,NULL,'unpqU4LpxknJ',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470485464,'压力测试用户765','测试263'),
(111,'stress_user_1756470477265_111','telegram_1756470482384@fit challenge.com',NULL,NULL,'arcwSSnMJCP8',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482384,'压力测试用户165','测试353'),
(112,'stress_user_1756470477265_457','telegram_1756470480123@fit challenge.com',NULL,NULL,'h3QSUPqtGJpK',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470480123,'压力测试用户64','测试413'),
(113,'stress_user_1756470477265_162','telegram_1756470477307@fit challenge.com',NULL,NULL,'KdNqMpKJqY4p',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470477307,'压力测试用户645','测试616'),
(114,'stress_user_1756470477265_853','telegram_1756470484184@fit challenge.com',NULL,NULL,'T9xSLqYAlqQy',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484184,'压力测试用户554','测试255'),
(115,'stress_user_1756470477265_183','telegram_1756470484601@fit challenge.com',NULL,NULL,'qbt663evVfbn',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484601,'压力测试用户565','测试142'),
(116,'stress_user_1756470477266_155','telegram_1756470484958@fit challenge.com',NULL,NULL,'OXkFLkUY5bhO',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484958,'压力测试用户291','测试928'),
(117,'stress_user_1756470477267_550','telegram_1756470481977@fit challenge.com',NULL,NULL,'KfRmQqf1Rte3',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470481977,'压力测试用户764','测试76'),
(118,'stress_user_1756470477271_485','telegram_1756470485467@fit challenge.com',NULL,NULL,'j2mXmKaqxeCb',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470485467,'压力测试用户85','测试741'),
(119,'stress_user_1756470477273_310','telegram_1756470482682@fit challenge.com',NULL,NULL,'o4jayoQONYJ5',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482682,'压力测试用户521','测试395'),
(120,'stress_user_1756470477274_582','telegram_1756470486301@fit challenge.com',NULL,NULL,'FPisz8CB6RxG',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470486301,'压力测试用户798','测试387'),
(121,'stress_user_1756470477266_8','telegram_1756470481811@fit challenge.com',NULL,NULL,'w6872sTqKFgo',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470481811,'压力测试用户153','测试276'),
(122,'stress_user_1756470477267_908','telegram_1756470482402@fit challenge.com',NULL,NULL,'CqCO2BKle8xX',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470482402,'压力测试用户195','测试262'),
(123,'stress_user_1756470477269_145','telegram_1756470478436@fit challenge.com',NULL,NULL,'pWU3AWgJOdFC',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470478436,'压力测试用户411','测试485'),
(124,'stress_user_1756470477271_200','telegram_1756470483596@fit challenge.com',NULL,NULL,'eyhhBJwUJbhj',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470483596,'压力测试用户155','测试219'),
(125,'stress_user_1756470477270_920','telegram_1756470484753@fit challenge.com',NULL,NULL,'GnjYa7G5M0PN',NULL,'2025-08-29 12:27:57','2025-08-29 12:27:57','2025-08-29 12:27:57',1,1,1756470484753,'压力测试用户918','测试818'),
(126,'javascript:alert(\'XSS\')','telegram_1756470509990@fit challenge.com',NULL,NULL,'2JMd6Prowg36',NULL,'2025-08-29 12:28:29','2025-08-29 12:28:29','2025-08-29 12:28:29',1,1,1756470509990,'<script>alert(\'XSS\')</script>','<img src=x onerror=alert(\'XSS\')>'),
(127,'test','test@test.com',NULL,NULL,'$2a$10$U6316/iqvrsKb0u5ybIJf.BEHXFrHFWSBPWNldNL36CQSRI1RtZzm',NULL,'2025-08-31 12:37:53','2025-08-31 12:37:53',NULL,1,1,NULL,NULL,NULL),
(128,'testuser20259567','testuser2025@example.com',NULL,NULL,'$2a$10$YFc7HlimJ4UFvtbVJH1knef89DlMg8kttTUjHDDmI0bZwUR5cHILe',NULL,'2025-09-01 11:42:05','2025-09-01 11:42:05',NULL,1,1,NULL,NULL,NULL),
(129,'testuser1756727093284','test1756727093284@example.com',NULL,NULL,'$2a$10$kPumZDTigR4ADYxajfFW0.ar6sB7DzFMjFkftHJUxeBHr6t60Y62u',NULL,'2025-09-01 11:44:53','2025-09-01 11:44:53',NULL,1,1,NULL,NULL,NULL),
(130,'test17567271895646453','test1756727189564@example.com',NULL,NULL,'$2a$10$MmseW3zyUry8f.HE.YqCTeXfAC55JrYnCbqSMS43CRj2yYkCUMg4a',NULL,'2025-09-01 11:46:29','2025-09-01 11:46:29',NULL,1,1,NULL,NULL,NULL),
(131,'test17567318761401553','test1756731876140@example.com',NULL,NULL,'$2a$10$99A3aHDXBt/jDF5FSkwO1ezChxpNzXgCP7corLc7YuRfqtCd.qiUC',NULL,'2025-09-01 13:04:36','2025-09-01 13:04:36',NULL,1,1,NULL,NULL,NULL),
(132,'test1756732028741282','test1756732028741@example.com',NULL,NULL,'$2a$10$inVugVfOjpogImCo8.TcsO8B7G4v/M45.D8zGB31hzKGJNhnMV3ZG',NULL,'2025-09-01 13:07:08','2025-09-01 13:07:08',NULL,1,1,NULL,NULL,NULL),
(133,'test17567327331671096','test1756732733167@example.com',NULL,NULL,'$2a$10$hep/21LloSwqkcX5qhfzgO7FyWxvcSPV.Yy.HAR8KPVcD9lqV0ymS',NULL,'2025-09-01 13:18:53','2025-09-01 13:18:53',NULL,1,1,NULL,NULL,NULL),
(134,'test17567328467724246','test1756732846772@example.com',NULL,NULL,'$2a$10$Out1Ge5WaIbOBR5wfTJ08eQgNmDBU4GdyX3PtzkNQWy/HbP.Wxxcu',NULL,'2025-09-01 13:20:46','2025-09-01 13:20:46',NULL,1,1,NULL,NULL,NULL),
(135,'test17568585884016870','test1756858588401@example.com',NULL,NULL,'$2a$10$IXF/vxoecDwbOfa7Ji7j/eonJuZvJ3r8W3aif1xP.SXs5evgT3ZXG',NULL,'2025-09-03 00:16:28','2025-09-03 00:16:28',NULL,1,1,NULL,NULL,NULL),
(136,'test17568587765678052','test1756858776567@example.com',NULL,NULL,'$2a$10$7KHEBG6PK5gHlh3fmDCvfuz1Ed/Wqz38IzXiZ4z9CYdw.NYuKAFGO',NULL,'2025-09-03 00:19:36','2025-09-03 00:19:36',NULL,1,1,NULL,NULL,NULL),
(137,'test17568589974875835','test1756858997487@example.com',NULL,NULL,'$2a$10$S5UDmPVorxybjcG5LePz5OkWsPT1hQ8NPFtM67hkh/Qy3OA8f4jo.',NULL,'2025-09-03 00:23:17','2025-09-03 00:23:17','2025-09-03 00:23:17',1,1,NULL,NULL,NULL),
(138,'test17568591979031350','test1756859197903@example.com',NULL,NULL,'$2a$10$IbJwq3CEnsfMwM6n0UqVNejUDNzIMwggvG4rZtfXMOzcxve3NekSm',NULL,'2025-09-03 00:26:38','2025-09-03 00:26:38','2025-09-03 00:26:38',1,1,NULL,NULL,NULL),
(139,'test20250903082658953','test20250903082658@example.com',NULL,NULL,'$2a$10$idUxTPdZMOvU3mIu8tOBfewKPsQwbjn6X0.Dw9CSOupxcgQhg1DOi',NULL,'2025-09-03 00:26:58','2025-09-03 00:26:58',NULL,1,1,NULL,NULL,NULL),
(140,'test202509030828482441','test20250903082848@example.com',NULL,NULL,'$2a$10$mHNs2cugnvCYt8GlKp2wxeZNv7flV0uXMIG01qM7UVX84UKv1C7Ka',NULL,'2025-09-03 00:28:48','2025-09-03 00:28:48','2025-09-03 00:28:48',1,1,NULL,NULL,NULL),
(141,'test202509030829022573','test20250903082902@example.com',NULL,NULL,'$2a$10$VuIvQ9wlfV17UaKaCaG2nOWHaVmjF50wWzWePHBm1FahXvz5pdoHa',NULL,'2025-09-03 00:29:02','2025-09-03 00:29:02',NULL,1,1,NULL,NULL,NULL),
(142,'test17568594966473309','test1756859496647@example.com',NULL,NULL,'$2a$10$2qWbpmboft1A1SKJW5JdIu2DnNrHOwBYaUXEUcD.bNQeI0QzuTEW2',NULL,'2025-09-03 00:31:36','2025-09-03 00:31:36','2025-09-03 00:31:36',1,1,NULL,NULL,NULL),
(143,'test17568596319331875','test1756859631933@example.com',NULL,NULL,'$2a$10$9v7lmvUWLVCJNg2WJmTIFOlcSaocOs.9cPBHNDkFbSMMRJ4rZa8zm',NULL,'2025-09-03 00:33:52','2025-09-03 00:33:52','2025-09-03 00:33:52',1,1,NULL,NULL,NULL),
(144,'test17568598187056001','test1756859818705@example.com',NULL,NULL,'$2a$10$aYfZk0c4nVJOUuJyUJZpAOJavaR6Jt9TdB/4KD4ZDp3Yz3IH15xH.',NULL,'2025-09-03 00:36:58','2025-09-03 00:36:58',NULL,1,1,NULL,NULL,NULL),
(145,'test17568628638586060','test1756862863858@example.com',NULL,NULL,'$2a$10$LKHnRKhqqNy5/EEGhQF1EOqSgf6suY5mOT7rHFzTiFzo4hJ70v4.i',NULL,'2025-09-03 01:27:44','2025-09-03 01:27:44',NULL,1,1,NULL,NULL,NULL),
(146,'test17568632617724835','test1756863261772@example.com',NULL,NULL,'$2a$10$MhTQsyqmrjMbHpsN8AJmFebM57UmX7zazXIYqg364QMpcJdSlxHH.','TRC65464as6dad','2025-09-03 01:34:21','2025-09-03 10:47:31',NULL,1,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users_backup_20250903_190539` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `vip_challenge_details`
--

DROP TABLE IF EXISTS `vip_challenge_details`;
