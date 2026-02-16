<?php
namespace App\Services;

use App\Models\Sku;
use App\Validators\GateValidator;

class ValidationService
{
    protected $validator;

    public function __construct(GateValidator $validator)
    {
        $this->validator = $validator;
    }

    public function validateSku($id)
    {
        $sku = Sku::findOrFail($id);
        return $this->validator->validateAll($sku);
    }
}
