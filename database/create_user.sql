-- This is optional
-- Creates a database user for the app that can only access vector_geometry
-- (matches the defaults in config.example.php)
CREATE USER IF NOT EXISTS 'vector_app'@'localhost' IDENTIFIED BY '';
GRANT SELECT, INSERT, UPDATE, DELETE ON vector_geometry.* TO 'vector_app'@'localhost';
FLUSH PRIVILEGES;
