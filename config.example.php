<?php
// Database connection settings.
// Copy to config.php and edit it
// config.php is in .gitignore
return [
    'servername' => getenv('DB_SERVERNAME') ?: 'localhost',
    'username'   => getenv('DB_USERNAME') ?: 'vector_app',
    'password'   => getenv('DB_PASSWORD') ?: '',
    'dbname'     => getenv('DB_NAME') ?: 'vector_geometry',
];
