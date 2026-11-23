<?php


// Get the value of $_REQUEST['model']
$model = $_REQUEST['model'];

// Define the AR models and their linked assets
$arModels = [
    'model1' => [
        'name' => 'Model Name',
        'path' => 'path/to/model1.glb',
        'music' => 'path/to/music1.mp3',
    ],
    // Add more models here...
];

print_r($arModels['model']);