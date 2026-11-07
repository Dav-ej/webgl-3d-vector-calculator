<?php
require_once 'loginSession.php';
clearToken();
header("Location: ../index.php");
exit();
