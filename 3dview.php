<?php
        session_start();

        // Get id from URL
        $id = $_GET['id'] ?? "";

        // If id isn't number, send to home.php
        if (!is_numeric($id)) {
            header('Location: home.php');
            exit();
        }

        // Get userID from SQL
        require_once './scripts/dbConnect.php';
        $query = "SELECT userID FROM `environments` WHERE id = ?;";
        list($stmt, $conn) = executeQuery($query, false, "i", $id);
        $stmt->bind_result($userID);
        $stmt->fetch();
        $stmt->close();
        $conn->close();

        // Verify User token, else send to login, index.php
        require_once './scripts/loginSession.php';
        $isLoggedIn = verifyAccountToken();
        if ($isLoggedIn === false) {
            header("Location: index.php");
            exit();
        }

        // Check environment belongs to user, else send home.php
        if (!(isset($_SESSION['userID']) && $_SESSION['userID'] == $userID)) {
            header("Location: home.php");
            exit();
        }

        // Get JSON data, name from SQL
        $query = "SELECT JSONdata, name FROM `environments` WHERE id = ?;";
        list($stmt, $conn) = executeQuery($query, false, "i", $id);
        $stmt->bind_result($JSONdata, $name);
        $stmt->fetch();
        $stmt->close();
        $conn->close();
?>
<script> // Send data to JS (json_encode escapes quotes, backticks and tags)
    var JSONdata = <?php echo json_encode($JSONdata, JSON_HEX_TAG); ?>;
    var environmentName = <?php echo json_encode($name, JSON_HEX_TAG); ?>;
    var environmentID = <?php echo json_encode($id); ?>;
</script>
<head>
    <title><?php echo htmlspecialchars($name); ?> · 3D Vector Geometry Visualiser & Calculator</title>
    <style>
    * {
        font-family: 'Inter', sans-serif;
    }

    .sidebar {
        width: calc(100% - 25px);
        height: calc(44% - 25px);
        margin-bottom: 10px;
        margin-right: 10px;
        padding: 10px;
        border-radius: 12px;
        background-color: #F2F2F2;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .sidebar > * {
        margin: 0px;
        font-weight: 400;
    }

    canvas {
        aspect-ratio: 1;
        border-radius: 12px;
        max-width: 88%;
        max-height: 100%;
        overflow: hidden;
        box-sizing: border-box;
        position: relative;
        text-align: center;
        margin: auto;
    }

    .zoomBtn {
        position: absolute;
        top: 10;
        right: 13.5%;
        display:block;
        height: 30px;
        width: 30px;
        border-radius: 50%;
        border: 0;
        color: white;
        background-color: #2682F5;
        z-index: 0;
        font-size: 15px;
        font-weight: 400;
    }

    .zoomBtn:hover {
        cursor: pointer;
        background-color: #1c5fb0;
        font-weight: 500;
    }

    .zoomBtn:active {
        background-color: #257ce7;
        font-weight: 400;
    }

    .textBtn {
        margin-top: 5px;
        border: rgba(1,1,1,0);
        color: #2682F5;
        z-index: 2;
        font-size: 15px;
        background-color: #ffffff00;
        font-weight: 400;
    }

    .textBtn:hover {
        color: #2682F5;
        font-weight: 500;
        cursor: pointer;
    }

    .textBtn:active {
        color: #257ce7;
        font-weight: 400;
    }

    .textBtn.red {
        color: #FF0000;
    }

    .textBtn.red:hover {
        color: #FF0000;
    }

    .textBtn.red:active {
        color: #e60000;
    }

    .closeBtn {
        border-radius: 15px;
        color: #2682F5;
        background-color: #F2F2F2;
        border: 0;
        position: absolute;
        right: 10;
        top: 10;
    }

    .closeBtn:hover {
        cursor: pointer;
        background-color: #f8f8f8;
    }

    .closeBtn:active {
        background-color: #e0e0e0;
    }

    .popupHolder {
        text-align: center;
        height: 100vh; 
        width: 100vw; 
        background-color: rgba(0, 0, 0, 0.5); 
        opacity: 1; 
        display: none; 
        position: absolute; 
        top: 0; 
        left: 0;
    }

    .popup {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 50%;
        height: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 10px;
        border-radius: 15px;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    
    .popup > p, h4 {
        width: 100%;
        margin-bottom: 5px;
    }

    .popup > h4 {
        margin-top: 3;
    }

    .popup > p {
        text-align: left;
        margin-left: 5%;
    }

    .expressionBtn {
        width: 90%;
        height: fit-content;
        background-color: #dee3ff;
        border: 0;
        margin-bottom: 5px;
        font-size: 15px;
        padding: 5px;
        border-radius: 10px;
    }

    .expressionBtn:hover {
        cursor: pointer;
        background-color: #eceefc;
    }

    .expressionBtn:active {
        background-color: #c0c8fa;
    }

    .expression {
        width: 100%;
        height: fit-content;
        background-color: #FFFFFF;
        position: relative;
        overflow: hidden;
        margin-bottom: 5px;
    }
    
    .expression > * {
        margin: 5px;
        margin-left: 12px;
        padding-top: 1px;
        font-size: 15px;
    }

    .colourBar {
        height: 100%;
        width: 5px;
        position: absolute;
        left: 0;
        top: 0;
        margin: 0 !important;
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
        background-color: rgba(38, 130, 245, 0.15);
    }

    #delete-environment {
        border-color: rgba(255, 0, 0, 1);
        color: rgba(255, 0, 0, 1);
        background-color: rgba(255, 0, 0, 0.15);
    }

    .divider {
        width: 1px;
        height: 10px;
        background-color: black;
        border-radius: 2px;
        display: inline-block;
    }

    .centerHorizontal {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 15px;
        width: 80%;
    }
    
    .centerHorizontal > p{
        margin: 5px;
    }

    .centerVertical > p {
        margin: 0px;
        padding: 0px;
    }

    .popup > p {
        width: 80%;
    }
    </style>
</head>
<body style="overflow: hidden;">
    <h1 style="text-align: center; font-size: 20px; color: #001D69; font-weight: 500;">3D Vector Geometry Visualiser & Calculator for Edexcel A Level Further Maths</h1>
    <!-- Nav bar -->
    <div class="navbar">
        <a class="navBtn" href="home.php">Home</a>
        <div class="divider"></div>
        <input type="text" style="cursor: text !important; background-color: rgba(0,0,0,0.075); border-color: rgba(0,0,0,0.075);" value="Untitled" id="title-input" class="navBtn">
        <a class="navBtn" id="save-data">Save - <p style="display: inline-block; padding: 0px; margin: 0px;" id="save-data-text">Changes saved</p></a>
        <a class="navBtn" id="delete-environment">Delete</a>
        <div class="divider"></div>
        <a class="navBtn" href="account.php">Account</a>
    </div>
    <div style="display: inline-flex; width: 100vw; height: 100vh; max-height: 700px; margin: auto; justify-content: center;">
        <div style="width: 30vw;">
            <div class="sidebar" id="expressionSidebar">
                <p>Objects</p>
                <button class="textBtn" id="new-expression">+ New Expression</button>
            </div>
            <div class="sidebar" id="calculationsSidebar">
                <p>Calculations</p>
                <button class="textBtn" id="new-calculation">+ New Calculation</button>
                <button class="textBtn" id="supported-calculations">View Supported Calculations</button>
            </div>
        </div>
        <div style="aspect-ratio: 1; align-items: center; position: relative;">
            <canvas id="#canvas" height="700px" width="700px">
            </canvas>
            <button class="zoomBtn" id="zoom-in">+</button>
            <button class="zoomBtn" style="top: 45;" id="zoom-out">-</button>
        </div>
    </div>

    <div id="expression-popup" class="popupHolder">
        <div class="popup">
            <h4>New Expression</h4>
            <p>Point:</p>
            <button class="expressionBtn" id="point1">Point in form: <br><img style="margin: 6px;" src="./images/pointEquation1.jpg" height="20px" id="point1"></button>
            <p>Straight Line:</p>
            <button class="expressionBtn" id="line1">Line in form: <br><img style="margin: 6px;" src="./images/lineEquation1.jpg" height="15px" id="line1"></button>
            <button class="expressionBtn" id="line2">Line in form: <br><img style="margin: 6px;" src="./images/lineEquation2.jpg" height="38px" id="line2"></button>
            <p>Plane:</p>
            <button class="expressionBtn" id="plane1">Plane in form: <br><img style="margin: 6px;" src="./images/planeEquation1.jpg" height="16px" id="plane1"></button>
            <button class="expressionBtn" id="plane2">Plane in form: <br><img style="margin: 6px;" src="./images/planeEquation2.jpg" height="18px" id="plane2"></button>
            <button class="expressionBtn" id="plane3">Plane in form: <br><img style="margin: 6px;" src="./images/planeEquation3.jpg" height="18px" id="plane3"></button>
            <button class="closeBtn" id="close-new-expression">Close</button>
        </div>
    </div>

    <div id="show-steps-popup" class="popupHolder">
        <div class="popup">

            <button class="closeBtn" id="close-show-steps">Close</button>
        </div>
    </div>

    <div id="supported-calculations-popup" class="popupHolder">
        <div class="popup">
            <h4>Supported Calculations</h4>
            <p>Intersections between:</p>
            <p>- Two Lines</p>
            <p>- A Line and a Plane</p>
            <p></p>
            <p>Distance between:</p>
            <p>- Two Lines</p>
            <p>- A Point and a Line</p>
            <p>- A Point and a Plane</p>
            <p></p>
            <p>Angle between:</p>
            <p>- Two Lines</p>
            <p>- A Line and a Plane</p>
            <p>- Two Planes</p>
            <button class="closeBtn" id="close-supported-calculations">Close</button>
        </div>
    </div>

    <script src='lib/decimal.js' defer></script>
    <script type="text/javascript" src="./scripts/expressions.js?0029" defer></script>
    <script type="text/javascript" src="./scripts/renderData.js?0012" defer></script>
    <script type="text/javascript" src="./scripts/renderer.js?0011" defer></script>
    <script type="text/javascript" src="./scripts/3dview.js?0042" defer></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</body>