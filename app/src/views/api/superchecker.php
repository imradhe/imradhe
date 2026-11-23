<?php

require("controllers/api/FlagController.php");
$flag = new Flag();
$email=$_REQUEST['email'];
print_r($flag->flags_superchecker($email));