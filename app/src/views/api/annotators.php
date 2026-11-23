<?php

require("controllers/api/FlagController.php");
$flag = new Flag();
print_r($flag->flags_annotators());