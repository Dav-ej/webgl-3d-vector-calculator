<?php 
// Start PHP Session (if the including page hasn't already)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'dbConnect.php';

function getSaveAccountToken($userID) {
    // Generate Token and Salt
    $token = getSalt();
    $salt = getSalt();
    $hashedToken = password_hash($token . $salt, PASSWORD_BCRYPT);

    // Create a new tokenInformation entry to SQL database
    date_default_timezone_set('UTC');
    $query = "INSERT INTO `tokenInformation` (`userID`, `hashedToken`, `salt`, `createdAt`) VALUES (?, ?, ?, current_timestamp())";
    $queryResult = executeQuery($query, false, "iss", $userID, $hashedToken, $salt);
    list($stmt, $conn) = $queryResult;
    $stmt->close();
    $conn->close();

    // Set Cookies
    date_default_timezone_set('UTC');
    $cookieOptions = ['expires' => time() + 43200, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax'];
    setcookie("userID", $userID, $cookieOptions);
    setcookie("token", $token, $cookieOptions);

    // Set Sessions (new session ID on login to prevent session fixation)
    session_regenerate_id(true);
    $_SESSION['userID'] = $userID;
}

function verifyAccountToken($deleteToken = null) {
    // Get token and userID from cookies
    $c_Token = $_COOKIE["token"] ?? null;
    $c_userID = $_COOKIE["userID"] ?? null;

    // Return if no token cookie or userID cookie set
    if (!isset($c_Token) || !isset($c_userID)) {
        return false;
    }

    // Get hashedTokens and salts for user in userID cookie
    // And check if saved token matches
    $query = "SELECT hashedToken, salt, createdAt FROM `tokenInformation` WHERE userID = ?;";
    $queryResult = executeQuery($query, false, "i", $_COOKIE["userID"]);
    list($stmt, $conn) = $queryResult;
    $stmt->store_result(); // this is needed for num_rows
    $stmt->bind_result($hashedToken, $salt, $createdAt);
    $matchFound = false;
    for ($x = 0; $x < $stmt->num_rows; $x++) {
        $stmt->fetch();
        if (password_verify($c_Token . $salt, $hashedToken)) {
            date_default_timezone_set('UTC');
            if ((time()-strtotime($createdAt)) <= 43200 && !isset($deleteToken)) { // Check token is not more than 12 hours old and should not be deleted
                $matchFound = true;
            } else {
                // Delete Token from SQL DB
                removeToken($hashedToken, $salt);
            }
        }
    }
    $stmt->close();
    $conn->close();

    if ($matchFound) {
        $_SESSION['userID'] = $_COOKIE["userID"];
    }

    return $matchFound;
}

function removeToken($hashedToken, $salt) {
    $query = "DELETE FROM `tokenInformation` WHERE hashedToken = ? AND salt = ?;";
    list($t_stmt, $t_conn) = executeQuery($query, false, "ss", $hashedToken, $salt);
    $t_stmt->close();
    $t_conn->close();
}

function clearToken() {
    // Delete Token from SQL
    verifyAccountToken(true);

    // Clear Tokens
    date_default_timezone_set('UTC');
    setcookie("userID", "", time() - 3600, "/");
    setcookie("token", "", time() - 3600, "/");
}

function getSalt() {
    $salt = "";
    $char = "";
    $random = 0;
    while (strlen($salt) < 32) {
        // ASCII Values
        // 0-9 is 48-57
        // A-Z is 65-90
        // a-z is 97-122
        $random = random_int(48, 122); // cryptographically secure, unlike rand()
        // Adjust number if invalid character
        if (($random > 57 && $random < 65) || ($random > 90 && $random < 97)) {
            $random += 8;
        }
        $char = chr($random);
        $salt .= $char;
    }
    return $salt;
}