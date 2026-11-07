<?php
// Start PHP Session
session_start();

// Return if not logged in
if (!isset($_SESSION['userID'])) {
    http_response_code(401);
    exit();
}

// Decode and check json parameters are valid
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);
if (!isset($data['name']) || !isset($data['id'])) {
    // exit if not valid as request not from program
    exit();
}

// Return if title contains anything other than letters, numbers and spaces (same rule as 3dview.js)
if (!is_string($data['name']) || !preg_match('/^[a-zA-Z0-9\s]{0,100}$/', $data['name'])) {
    http_response_code(400);
    exit();
}

// Connect to SQL Database
require_once 'dbConnect.php';
$conn = connectToDB();

// Check environment belongs to user
$query = "SELECT `userID` FROM `environments` WHERE `id` = ?";
list($stmt, $conn) = executeQuery($query, $conn, "i", $data['id']);
$stmt->bind_result($environmentUserID);
$stmt->fetch();
$stmt->close();
if ($environmentUserID != $_SESSION['userID']) {
    // exit if not matching as request not from program
    http_response_code(403);
    exit();
}

// Update environment title in SQL database
$query = "UPDATE `environments` SET `name` = ? WHERE `id` = ?";
list($stmt, $conn) = executeQuery($query, false, "si", $data['name'], $data['id']);
$stmt->close();

// Close SQL Database Connection
$conn->close();