<?php
// Entry point
require __DIR__ . '/../vendor/autoload.php';
$app = new \Illuminate\Foundation\Application(__DIR__ . '/../');
$app->run();
