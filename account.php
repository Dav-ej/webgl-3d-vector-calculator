<?php
// Redirect to login/signup page if not logged in
session_start();
require_once './scripts/loginSession.php';
$isLoggedIn = verifyAccountToken();
if ($isLoggedIn === false) {
    header("Location: index.php");
    exit();
}
?>
<head>
    <title>Account · 3D Vector Geometry Visualiser & Calculator</title>
    <style>
        * {
            font-family: 'Inter', sans-serif;
        }

        .navBar {
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

        #save-data {
            border-color: #2682F5;
            color: #2682F5;
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
      <a class="navBtn" href="home.php">Home</a>
      <div class="divider"></div>
      <a class="navBtn" style="background-color: rgba(0,0,0,0.075); border-color: rgba(0,0,0,0.075);">Logged in as <?php echo htmlspecialchars($_SESSION["username"]); ?></a>
      <div class="divider"></div>
      <a class="navBtn" href="./scripts/logout.php" style="color: red !important; border-color: red !important;">Log out</a>
      <a class="navBtn" href="account.php">Account</a>
  </div>
    <div style="width: 400px; margin: auto;">
        <h3>Modify Account Details</h3>
        <form action="./scripts/newAccountDetails.php" method="post">
            <p>Verify Existing Details</p>
            <input type="password" name="pass" placeholder="Current Password"><br>
            <p>New Username (Optional)</p>
            <input type="text" name="newuser" placeholder="New Username"><br>
            <p>New Password (Optional)</p>
            <input type="password" name="newpass1" placeholder="New Password"><br>
            <input type="password" name="newpass2" placeholder="Verify New Password"><br>
            <p style="color: red;">Delete Account (Optional)</p>
            <input type="text" name="delete" placeholder="Enter 'delete' to delete account"><br>
            <input type="submit">
            <p style="color: red;">
            <?php 
                if (isset($_SESSION['account_error'])) {
                    echo $_SESSION['account_error'];
                    unset($_SESSION['account_error']); // Clear the error message after displaying
                }
            ?>
            </p>
        </form>
        <p>Usernames must be 6-30 characters long, and consist of only letters, numbers & underscores</p>
        <p>Passwords must be 6-30 characters long, and consist of letters, numbers <b>and</b> symbols</p>
    </div>
</body>