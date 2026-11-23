<?php

require("controllers/api/FlagController.php");
$flag = new Flag();
echo $flag->flags();