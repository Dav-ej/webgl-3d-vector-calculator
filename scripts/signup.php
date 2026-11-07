<?php 
// Start php Session
session_start();

// Set variables according to form inputs
$user = $_POST['user'] ?? "";
$pass = $_POST['pass1'] ?? "";
$pass2 = $_POST['pass2'] ?? "";

// Set session login username variable (to avoid user re-entering username if error returned)
$_SESSION['signupUsername'] = $user;

// Return if username does not match pattern or is not within 6 and 30 Characters long
$userPattern = '/^[a-zA-Z0-9_]+$/';
if (!(strlen($user) >= 6 && strlen($user) <= 30 && preg_match($userPattern, $user))) {
    $_SESSION['signup_error'] = "Invalid Username";
    header("Location: ../index.php");
    exit();
};

// Return if password does not match pattern or is not within 6 and 30 Characters long
$containsLetter = preg_match('/[a-zA-Z]/', $pass);
$containsNumber = preg_match('/[0-9]/', $pass);
$containsSymbol = preg_match('/[\W]/', $pass);
if (!(strlen($pass) >= 6 && strlen($pass) <= 30 && $containsLetter && $containsNumber && $containsSymbol)) {
    $_SESSION['signup_error'] = "Invalid Password";
    header("Location: ../index.php");
    exit();
};

// Return if passwords don't match
if ($pass != $pass2) {
    $_SESSION['signup_error'] = "Passwords don't match";
    header("Location: ../index.php");
    exit();
}

// Connect to SQL Database
require_once 'dbConnect.php';
$conn = connectToDB();

// Return if username is taken
$query = "SELECT COUNT(*) as count FROM users WHERE username = ?";
list($stmt, $conn) = executeQuery($query, $conn, "s", $user);
$stmt->bind_result($count);
$stmt->fetch();
if ($count > 0) {
    $_SESSION['signup_error'] = "Username is already taken";
    $stmt->close();
    $conn->close();
    header("Location: ../index.php");
    exit();
}
$stmt->close();

// Create new user entry
$_SESSION['username'] = $user;
$query = "INSERT INTO `users` (`userID`, `username`) VALUES (NULL, ?)";
list($stmt, $conn) = executeQuery($query, $conn, "s", $user);
$userID = $conn->insert_id;
$stmt->close();

// Generate salt:
require_once 'loginSession.php';
$passwordSalt = getSalt();

// Hash (Password + Salt):
$hashedPassword = password_hash($pass . $passwordSalt, PASSWORD_BCRYPT);

// Add to SQL
$query = "INSERT INTO `loginInformation` (`userID`, `hashedPassword`, `passwordSalt`, `lastLoginAttempt`) VALUES (?, ?, ?, current_timestamp())";
list($stmt, $conn) = executeQuery($query, $conn, "iss", $userID, $hashedPassword, $passwordSalt);
$stmt->close();

// Close SQL connection
$conn->close();

// Start Login Session
getSaveAccountToken($userID);

// Redirect to home page
header("Location: ../home.php");