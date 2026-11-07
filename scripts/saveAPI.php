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
if (!isset($data['data']) || !isset($data['id'])) {
    // exit if not valid as request not from program
    exit();
}
$environmentData = json_encode($data['data']);
if ($environmentData == false || $data['id'] == false) {
    // exit if not valid as request not from program
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

// Update environment data in SQL database
$query = "UPDATE `environments` SET `jsonData` = ? WHERE `id` = ?";
list($stmt, $conn) = executeQuery($query, $conn, "si", $environmentData, $data['id']);
$stmt->close();

// Close SQL Database Connection
$conn->close();