<?php
namespace App\Controllers;

use App\Models\Sku;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;

class SkuController {
    public function index() {
        return ResponseFormatter::format(Sku::with('primaryCluster')->get());
    }

    public function show($id) {
        $sku = Sku::with(['primaryCluster', 'skuIntents.intent'])->findOrFail($id);
        return ResponseFormatter::format($sku);
    }

    public function update(Request $request, $id) {
        $sku = Sku::findOrFail($id);
        $sku->update($request->all());
        return ResponseFormatter::format($sku);
    }
}
