-- Tables used by /login, /register and the admin pages (same as src/models/auth/*.sql).
-- Schema only: it creates NO user. Register an account at /register, then promote it
-- (see README, "Login and admin"). Safe to run more than once.

CREATE TABLE IF NOT EXISTS `users` (
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','moderator','admin') DEFAULT 'user',
  `status` int(11) DEFAULT 0,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `logs` (
  `loginID` varchar(32) NOT NULL,
  `email` varchar(255) NOT NULL,
  `loggedinat` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip` varchar(255) NOT NULL,
  `os` varchar(255) NOT NULL,
  `browser` varchar(255) NOT NULL,
  `loggedout` int(11) DEFAULT 0,
  `loggedoutat` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`loginID`),
  KEY `email` (`email`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
