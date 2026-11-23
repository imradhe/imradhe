<?php
$taskID = $_POST['projectID'];
$taskID = $_POST['taskID'];
$annotator = $_POST['annotator'];
$reviewer = $_POST['reviewer'];
$superchecker = $_POST['superchecker'];
$flag = $_POST['flag'];

require("controllers/api/FlagController.php");
$flag = new Flag();
echo $flag->flag($_POST['projectID'], $_POST['taskID'], $annotator, $reviewer, $superchecker, $_POST['flag'], $_POST['segment'], $_POST['role']);