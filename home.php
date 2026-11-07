<?php
// Redirect to login/signup page if not logged in
session_start();
require_once './scripts/loginSession.php';
$isLoggedIn = verifyAccountToken();
if ($isLoggedIn === false) {
    header("Location: index.php");
    exit();
}

// Don't let the browser cache this page, so the back button always shows the latest environments
header("Cache-Control: no-store");
?>
<head>
    <title>Home · 3D Vector Geometry Visualiser & Calculator</title>
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

.newEnvironment {
    width: 180px;
    height: 100px;
    background-color: #C0D8F5;
    display: flex;
    border-radius: 17.5px;
    border: solid;
    border-color: #2682F5;
    border-width: 1px;
    text-decoration: none;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
    padding: 5px;
    color: rgb(85, 26, 139);
}

.newEnvironment:hover {
  background-color: #B1D4FF;
}

.environment {
    width: 180px;
    height: 100px;
    background-color: #FF9F9F;
    display: flex;
    border-radius: 17.5px;
    border: solid;
    border-color: #FF0000;
    border-width: 1px;
    text-decoration: none;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
    padding: 5px;
    color: black;
    font-weight: 300;
}

.environment:hover {
  background-color: #FF8484;
}

.environmentsDiv {
  width: 620px;
  margin: auto;
}

.environmentsGrid {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: auto auto auto;
  row-gap: 10px;
}

@media (max-width: 630px) {
  .environmentsDiv {
    width: 100%;
  }

  .environmentsGrid {
    grid-template-columns: auto !important;
  }

  .environment {
    width: 100%;
  }

  .newEnvironment {
    width: 100%;
  }
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
  <div class="environmentsDiv">
    <p>Saved Environments:</p>
    <div class="environmentsGrid" style="display: grid; grid-auto-flow: row; grid-template-columns: auto auto auto; row-gap: 10px;">
      <a class="newEnvironment" href="./scripts/createEnvironment.php">
        + New Environment
        <img style="margin: 6px;" src="./images/3dGridBlue.jpg" height="40px">
      </a>
      <?php
        // Get User Environments
        $userID = $_SESSION['userID'];
        $query = "SELECT id, name FROM `environments` WHERE userID = ? ORDER BY id DESC;";
        list($stmt, $conn) = executeQuery($query, false, "i", $userID);
        $stmt->store_result(); // this is needed for num_rows
        $stmt->bind_result($id, $name);
        for ($x = 0; $x < $stmt->num_rows; $x++) {
            $stmt->fetch();
            echo "<a class=\"environment\" href=\"3dview.php?id=$id\">
              " . htmlspecialchars($name) . "
              <img style=\"margin: 6px;\" src=\"./images/3dGridWhite.jpg\" height=\"40px\">
            </a>";
        }
        $stmt->close();
        $conn->close();
      ?>
    </div>
  </div>
</body>