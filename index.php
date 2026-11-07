<?php
// Redirect to homepage if logged in
session_start();
require_once './scripts/loginSession.php';
$isLoggedIn = verifyAccountToken();
if ($isLoggedIn === true) {
    header("Location: home.php");
    exit();
}

?>
<head>
    <title>Log In · 3D Vector Geometry Visualiser & Calculator</title>
    <style>
    * {
        font-family: 'Inter', sans-serif;
    }.navBar {
    width: 100%;
    height: 30px;
    text-align: center;
    background-color: transparent;
    justify-content: center;
    display: flex;
    align-items: center;
    gap: 5px;
    padding-bottom: 14px;
}

.navBtn {
    height: 28px; 
    padding-left: 8px;
    padding-right: 8px;
    border-radius: 17.5px;
    text-align: center;
    border: solid;
    border-width: 1px;
    border-color: black;
    background-color: transparent;
    font-size: 13px;
    font-weight: 400;
    text-decoration: none;
    color: black;
    display: inline-block;
    vertical-align: middle;
    line-height: 28px;
}

.navBtn:hover {
    border-width: 1.5px;
    font-weight: 500;
    cursor: pointer;
}

.navBtn:active {
    border-width: 1px;
    font-weight: 400;
    cursor: pointer;
}

.divider {
    width: 1px;
    height: 10px;
    background-color: black;
    border-radius: 2px;
    display: inline-block;
}

input {
    padding: 15px;
    border-radius: 15px;
    border: none;
    background-color: #F2F2F2;
    width: 100%;
    font-size: 12px;
    margin-bottom: 6px;
}

input[type="submit"] {
    background-color: #2682F5;
    color: white;
}

input[type="submit"]:hover {
    background-color: #0D77FD;
    cursor: pointer;
}

input[type="submit"]:active {
    background-color: #2682F5;
    cursor: pointer;
}

h3 {
    font-weight: 400;
    margin-bottom: 10px;
    color: #001D69;
    font-size: 18px;
}

p {
    font-size: 14px;
}
    </style>
</head>
<body>
    <h1 style="text-align: center; font-size: 20px; color: #001D69; font-weight: 500;">3D Vector Geometry Visualiser & Calculator for Edexcel A Level Further Maths</h1>
    <!-- Nav bar -->
    <div class="navbar">
        <a class="navBtn" href="index.php">Home</a>
        <div class="divider"></div>
        <a class="navBtn" style="background-color: rgba(0,0,0,0.075); border-color: rgba(0,0,0,0.075);">Log In or Sign Up to Continue</a>
        <div class="divider"></div>
        <a class="navBtn" href="index.php">3D View</a>
        <div class="divider"></div>
        <a class="navBtn" href="index.php">Account</a>
    </div>
    <div style="width: 400px; margin: auto;">
        <h3>Log In</h3>
        <form action="./scripts/login.php" method="post">
            <input type="text" name="user" placeholder="Username"
                <?php 
                    if (isset($_SESSION['loginUsername'])) {
                        echo "value=\"";
                        echo htmlspecialchars($_SESSION['loginUsername']);
                        echo "\"";
                        unset($_SESSION['loginUsername']);
                    }
                ?>
            ><br>
            <input type="password" name="pass" placeholder="Password"><br>
            <input type="submit">
            <p style="color: red;">
            <?php 
                if (isset($_SESSION['login_error'])) {
                    echo $_SESSION['login_error'];
                    unset($_SESSION['login_error']); // Clear the error message after displaying
                }
            ?>
            </p>
        </form>
        <h3>Sign Up</h3>
        <form action="./scripts/signup.php" method="post">
            <input type="text" name="user" placeholder="Username"
                <?php 
                    if (isset($_SESSION['signupUsername'])) {
                        echo " value=\"";
                        echo htmlspecialchars($_SESSION['signupUsername']);
                        echo "\"";
                        unset($_SESSION['signupUsername']);
                    }
                ?>
            ><br>
            <input type="password" name="pass1" placeholder="Password"><br>
            <input type="password" name="pass2" placeholder="Verify Password"><br>
            <input type="submit">
            <p style="color: red;">
            <?php 
                if (isset($_SESSION['signup_error'])) {
                    echo $_SESSION['signup_error'];
                    unset($_SESSION['signup_error']); // Clear the error message after displaying
                }
            ?>
            </p>
        </form>
        <p>Usernames must be 6-30 characters long, and consist of only letters, numbers & underscores</p>
        <p>Passwords must be 6-30 characters long, and consist of letters, numbers <b>and</b> symbols</p>
    </div>
</body>