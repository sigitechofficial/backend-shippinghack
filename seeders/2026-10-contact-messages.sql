-- Contact us messages (website form → admin "Contact messages")
CREATE TABLE IF NOT EXISTS `contactMessages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `subject` VARCHAR(120) NOT NULL,
  `message` TEXT NOT NULL,
  `emailedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `contactMessages_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
SHOW TABLES LIKE 'contactMessages';
