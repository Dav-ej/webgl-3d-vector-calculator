<?php

// Return errors instead of throwing exceptions (default in PHP 8.1+)
mysqli_report(MYSQLI_REPORT_OFF);

function connectToDB() {
    // Load database connection details from config.php, fallback to example
    $configFile = file_exists(__DIR__ . '/../config.php') ? '/../config.php' : '/../config.example.php';
    $config = require __DIR__ . $configFile;

    // Define database connection details
    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) { // Check if connection has an error (property of the mysqli object)
        // Return if error
        header("Location: /error.html");
        exit();
    }

    $conn->set_charset("utf8mb4");
    // Use UTC for this connection, to match date_default_timezone_set('UTC') in the PHP scripts
    $conn->query("SET time_zone = '+00:00'");
    return $conn;
}

function executeQuery($query, $conn, $types, ...$params) {
    // Create connection if connection parameter is false
    if ($conn == false) {
        $conn = connectToDB();
    }

    // Prepare SQL statement (send to error page if error)
    $stmt = $conn->prepare($query);
    if ($stmt === false) {
        $conn->close();
        header("Location: /error.html");
        exit();
    }

    // Bind parameters to statement
    $stmt->bind_param($types, ...$params);

    // Execute statement
    $result = $stmt->execute();

    // Exit if SQL Error
    if (!$result) {
        $conn->close();
        header("Location: /error.html");
        exit();
    }

    // Return Statement and Connection
    return array($stmt, $conn);
}