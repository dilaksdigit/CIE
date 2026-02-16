<?php
namespace App\Controllers;

use App\Models\Intent;
use App\Utils\ResponseFormatter;

class IntentsController {
    public function index() {
        return ResponseFormatter::format(Intent::orderBy('sort_order')->get());
    }
}
