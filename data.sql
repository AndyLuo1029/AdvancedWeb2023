-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: webpj
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cqb`
--

DROP TABLE IF EXISTS `cqb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cqb` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `hitrate` double NOT NULL,
  `time` int NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cqb_user_username_fk` (`username`),
  CONSTRAINT `cqb_user_username_fk` FOREIGN KEY (`username`) REFERENCES `user` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cqb`
--

LOCK TABLES `cqb` WRITE;
/*!40000 ALTER TABLE `cqb` DISABLE KEYS */;
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (1,'3321',100,123,'2023-05-18 14:58:49');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (2,'3321',60,0,'2023-05-18 14:58:49');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (3,'3321',100,321,'2023-05-18 14:58:49');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (4,'3321',99,11,'2023-05-18 14:58:49');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (5,'3321',90,23,'2023-05-18 14:58:49');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (17,'3321',12,1122,'2023-05-27 13:35:47');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (19,'3321',90.5,12,'2023-05-31 22:55:37');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (20,'3321',90.5,12,'2023-05-31 22:58:57');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (21,'3321',82.73,10,'2023-06-01 23:15:59');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (22,'3321',82.73,10,'2023-06-01 23:17:00');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (23,'3321',82.73,10,'2023-06-01 23:17:00');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (24,'3321',82.73,1,'2023-06-01 23:17:00');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (25,'3321',82.73,30,'2023-06-01 23:17:00');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (26,'3321',82.73,10,'2023-06-01 23:19:42');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (27,'3321',82.73,60,'2023-06-01 23:21:31');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (28,'3321',0,0,'2023-06-04 22:13:47');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (29,'3321',0,0,'2023-06-04 22:14:23');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (30,'3321',0,0,'2023-06-04 22:21:18');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (31,'3321',50,32,'2023-06-04 22:21:48');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (32,'3321',0,0,'2023-06-04 22:22:02');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (33,'3321',0,0,'2023-06-04 22:25:36');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (34,'ljt',85.714,43,'2023-06-04 22:35:37');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (35,'ljt',0,0,'2023-06-04 22:43:58');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (36,'ljt',0,0,'2023-06-04 22:46:57');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (37,'ljt',76,52,'2023-06-04 22:52:51');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (38,'ljt',100,34,'2023-06-04 23:03:49');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (39,'ljt',78.947,40,'2023-06-04 23:06:42');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (40,'yxy',80,43,'2023-06-04 23:36:54');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (41,'3321',82.353,72,'2023-06-05 11:50:55');
INSERT INTO `cqb` (`id`, `username`, `hitrate`, `time`, `date`) VALUES (42,'3321',92.308,79,'2023-06-05 12:13:04');
/*!40000 ALTER TABLE `cqb` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `user_username_uindex` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`userID`, `username`, `password`, `email`) VALUES (13,'3321','$2a$10$kEFEIxolgsXbA07kRak94eKD5OxT4.QUKIT55YwCm1iVIFPjsF6F6','');
INSERT INTO `user` (`userID`, `username`, `password`, `email`) VALUES (16,'a_1','$2a$10$wkVc0MakIpeKfohqLRnDeuHCLO2Tz3tlljdLLxBA8EwjSTepBsqW6','');
INSERT INTO `user` (`userID`, `username`, `password`, `email`) VALUES (18,'ljt','$2a$10$RlK3XDj1/vy13jUDVSnKReZAuGyaEyMspGe78IaaBDWphLu2wRevS','');
INSERT INTO `user` (`userID`, `username`, `password`, `email`) VALUES (19,'yxy','$2a$10$2bLQxJ7Q7RPqety3pK888uF8LXXdwm.XPr1k74jPGF1q6b4xyLx4W','');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-06-06 21:54:11
