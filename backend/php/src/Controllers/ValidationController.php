<?php
namespace App\Controllers;

use App\Services\ValidationService;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;

class ValidationController {
    protected $service;

    public function __construct(ValidationService $service) {
        $this->service = $service;
    }

    public function validate($id) {
        $result = $this->service->validateSku($id);
        return ResponseFormatter::format($result);
    }
}
