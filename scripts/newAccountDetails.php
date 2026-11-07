<?php 
session_start();

// Return to login page if not logged in
if (!isset($_SESSION['userID'])) {
    header("Location: ../index.php");
    exit();
}

$pass = $_POST['pass'] ?? "";

$newUser = $_POST['newuser'] ?? "";

$newpass1 = $_POST['newpass1'] ?? "";
$newpass2 = $_POST['newpass2'] ?? "";

$delete = $_POST['delete'] ?? "";

require_once 'dbConnect.php';

/* Non-SQL Checks */
// Check Username is Valid
if ($newUser != "") {
    // Return if username does not match pattern or is not within 6 and 30 Characters long
    $userPattern = '/^[a-zA-Z0-9_]+$/';
    if (!(strlen($newUser) >= 6 && strlen($newUser) <= 30 && preg_match($userPattern, $newUser))) {
        $_SESSION['account_error'] = "Invalid Username";
        header("Location: ../account.php");
        exit();
    }
}

// Check Password is Valid
if ($newpass1 != "") {
    // Return if password does not match pattern or is not within 6 and 30 Characters long
    $containsLetter = preg_match('/[a-zA-Z]/', $newpass1);
    $containsNumber = preg_match('/[0-9]/', $newpass1);
    $containsSymbol = preg_match('/[\W]/', $newpass1);
    if (!(strlen($newpass1) >= 6 && strlen($newpass1) <= 30 && $containsLetter && $containsNumber && $containsSymbol)) {
        $_SESSION['account_error'] = "Invalid Password";
        header("Location: ../account.php");
        exit();
    };

    // Return if passwords don't match
    if ($newpass1 != $newpass2) {
        $_SESSION['account_error'] = "Passwords don't match";
        header("Location: ../account.php");
        exit();
    }
}

/* SQL Checks */
// Connect to SQL database
require_once 'dbConnect.php';
$conn = connectToDB();

// Get Hashed Password and Salt
$query = "SELECT hashedPassword, passwordSalt FROM `loginInformation` WHERE userID = ?;";
list($stmt, $conn) = executeQuery($query, $conn, "i", $_SESSION['userID']);
$stmt->bind_result($hashedPassword, $passwordSalt);
$stmt->fetch();
$stmt->close();

// Return if entered Password doesn't match
if (!password_verify($pass . $passwordSalt, $hashedPassword)) {
    $conn->close();
    $_SESSION['account_error'] = "Password is incorrect";
    header("Location: ../account.php");
    exit();
}


// Return if username is taken
$query = "SELECT COUNT(*) as count FROM users WHERE username = ?;";
list($stmt, $conn) = executeQuery($query, $conn, "s", $newUser);
$stmt->bind_result($count);
$stmt->fetch();
if ($count > 0) {
    $_SESSION['account_error'] = "Username is already taken";
    $stmt->close();
    $conn->close();
    header("Location: ../account.php");
    exit();
}
$stmt->close();

/* SQL Code */
// Update Username
if ($newUser != "") {
    $query = "UPDATE users SET username = ? WHERE userID = ?;";
    list($stmt, $conn) = executeQuery($query, $conn, "si", $newUser, $_SESSION["userID"]);
    $stmt->close();
    $_SESSION['username'] = $newUser;
}

// Update Password
if ($newpass1 != "") {
    // Generate salt:
    require_once 'loginSession.php';
    $passwordSalt = getSalt();
    
    // Hash (Password + Salt):
    $hashedPassword = password_hash($newpass1 . $passwordSalt, PASSWORD_BCRYPT);

    $query = "UPDATE loginInformation SET hashedPassword = ?, passwordSalt = ? WHERE userID = ?;";
    list($stmt, $conn) = executeQuery($query, $conn, "ssi", $hashedPassword, $passwordSalt, $_SESSION["userID"]);
    $stmt->close();
}

// Delete Account (and logout.php)
if ($delete == "delete") {
    // Remove all login tokens of user
    $query = "DELETE FROM tokenInformation WHERE userID = ?;";
    list($stmt, $conn) = executeQuery($query, $conn, "i", $_SESSION["userID"]);
    $stmt->close();

    // Remove from loginInformation
    $query = "DELETE FROM loginInformation WHERE userID = ?;";
    list($stmt, $conn) = executeQuery($query, $conn, "i", $_SESSION["userID"]);
    $stmt->close();

    // Remove from users
    $query = "DELETE FROM users WHERE userID = ?;";
    list($stmt, $conn) = executeQuery($query, $conn, "i", $_SESSION["userID"]);
    $stmt->close();

    // Remove all environments of user
    $query = "DELETE FROM environments WHERE userID = ?;";
    list($stmt, $conn) = executeQuery($query, $conn, "i", $_SESSION["userID"]);
    $stmt->close();
    $conn->close();

    header("Location: logout.php");
    exit();
}

// Close SQL connection
$conn->close();

// Send back to account.php
$_SESSION['account_error'] = "Changes Made";
header("Location: ../account.php");
exit();