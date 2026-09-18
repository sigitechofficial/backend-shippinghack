-- Migration: geography + package-size tables (run once on existing DBs).
-- Fresh databases provisioned via Sequelize sync() already include these.

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unitclasses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '',
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `systemunits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT '',
  `name` varchar(255) DEFAULT '',
  `symbol` varchar(255) DEFAULT '',
  `conversionRate` decimal(10,4) DEFAULT 1.0000,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `unitClassId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `unitClassId` (`unitClassId`),
  CONSTRAINT `systemunits_ibfk_1` FOREIGN KEY (`unitClassId`) REFERENCES `unitClasses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sizes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '',
  `weight` decimal(10,2) DEFAULT 0.00,
  `length` decimal(10,2) DEFAULT 0.00,
  `width` decimal(10,2) DEFAULT 0.00,
  `height` decimal(10,2) DEFAULT 0.00,
  `volume` decimal(12,2) DEFAULT 0.00,
  `image` varchar(255) DEFAULT '',
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `weightUnitId` int(11) DEFAULT NULL,
  `lengthUnitId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `weightUnitId` (`weightUnitId`),
  KEY `lengthUnitId` (`lengthUnitId`),
  CONSTRAINT `sizes_ibfk_1` FOREIGN KEY (`weightUnitId`) REFERENCES `systemUnits` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sizes_ibfk_2` FOREIGN KEY (`lengthUnitId`) REFERENCES `systemUnits` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provinces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '',
  `key` varchar(255) DEFAULT '',
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `districts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '',
  `key` varchar(255) DEFAULT '',
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `provinceId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `provinceId` (`provinceId`),
  CONSTRAINT `districts_ibfk_1` FOREIGN KEY (`provinceId`) REFERENCES `provinces` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `corregimientos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '',
  `key` varchar(255) DEFAULT '',
  `value` varchar(255) DEFAULT '',
  `nomenclature` varchar(255) DEFAULT '',
  `lastCode` varchar(255) DEFAULT '',
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `districtId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `districtId` (`districtId`),
  CONSTRAINT `corregimientos_ibfk_1` FOREIGN KEY (`districtId`) REFERENCES `districts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Seed one unit system so package sizes can be created.
INSERT INTO unitClasses (id,title,status,createdAt,updatedAt) VALUES (1,'Imperial',1,NOW(),NOW()) ON DUPLICATE KEY UPDATE title=VALUES(title);
INSERT INTO systemUnits (type,name,symbol,conversionRate,status,unitClassId,createdAt,updatedAt) SELECT 'weight','Pounds','lbs',1,1,1,NOW(),NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM systemUnits WHERE unitClassId=1 AND type='weight');
INSERT INTO systemUnits (type,name,symbol,conversionRate,status,unitClassId,createdAt,updatedAt) SELECT 'length','Inch','in',1,1,1,NOW(),NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM systemUnits WHERE unitClassId=1 AND type='length');
