<?php

namespace App\Controllers;

use App\Models\IntentTaxonomy;
use App\Utils\ResponseFormatter;

class IntentsController
{
    public function index()
    {
        // Canonical: serve locked 9-intent taxonomy for UI/API
        return ResponseFormatter::format(
            IntentTaxonomy::orderBy('intent_id')->get()
        );
    }
}
