<?php
// Start php Session
session_start();

// Set variables according to form inputs
$user = $_POST['user'] ?? "";
$pass = $_POST['pass'] ?? "";

// Set session login username variable (to avoid user re-entering username if error returned)
$_SESSION['loginUsername'] = $user;

// Connect to SQL database
require_once 'dbConnect.php';
$conn = connectToDB();

// Get userID from username
$query = "SELECT userID FROM `users` WHERE username = ?;";
list($stmt, $conn) = executeQuery($query, $conn, "s", $user);
$stmt->store_result(); // this is needed for num_rows
$stmt->bind_result($userID);
$stmt->fetch();
// Return with error message if username doesn't exist
if ($stmt->num_rows === 0) {
    $stmt->close();
    $conn->close();
    $_SESSION['login_error'] = "Username not found";
    header("Location: ../index.php");
    exit();
}
$stmt->close();

// Get Hashed Password, Salt and LastLoginAttempt
$query = "SELECT hashedPassword, passwordSalt, lastLoginAttempt FROM `loginInformation` WHERE userID = ?;";
list($stmt, $conn) = executeQuery($query, $conn, "i", $userID);
$stmt->bind_result($hashedPassword, $passwordSalt, $lastLoginAttempt);
$stmt->fetch();
$stmt->close();

// Close SQL connection
$conn->close();

// Return if lastLoginAttempt was within 2 second
date_default_timezone_set('UTC');
if ((time()-strtotime($lastLoginAttempt)) <= 2) {
    $_SESSION['login_error'] = "Please wait a few seconds before attempting to login again";
    header("Location: ../index.php");
    exit();
}

// Update lastLoginAttempt
$query = "UPDATE `loginInformation` SET lastLoginAttempt = current_timestamp() WHERE userID = ?;";
list($stmt, $conn) = executeQuery($query, false, "i", $userID);
$stmt->close();
$conn->close();

// Return if entered Password doesn't match
if (!password_verify($pass . $passwordSalt, $hashedPassword)) {
    $_SESSION['login_error'] = "Password or Username is incorrect";
    header("Location: ../index.php");
    exit();
}

// Set session username
$_SESSION['username'] = $user;

// Start Login Session
require_once 'loginSession.php';
getSaveAccountToken($userID);

// Redirect to home page
header("Location: ../home.php");