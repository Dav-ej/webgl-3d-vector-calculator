<?php
// Start php Session
session_start();
require_once 'dbConnect.php';

// Return to login page if not logged in
if (!isset($_SESSION['userID'])) {
    header("Location: ../index.php");
    exit();
}

// Define default JSON environment data
$defaultJSONdata = "{
    \"objects\":[],
    \"calculations\": []
}";

// Create new environment in SQL
$query = "INSERT INTO `environments` (`userID`, `JSONdata`, `name`) VALUES (?, ?, \"Untitled\")";
list($stmt, $conn) = executeQuery($query, false, "is", $_SESSION['userID'], $defaultJSONdata);
$id = $conn->insert_id;
$stmt->close();
$conn->close();

header("Location: ../3dview.php?id=$id");
exit();