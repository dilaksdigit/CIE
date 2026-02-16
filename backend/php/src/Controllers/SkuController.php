<?php
namespace App\Controllers;

use App\Models\Sku;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;

class SkuController {
    public function index(Request $request) {
        $query = Sku::with(['primaryCluster']);
        
        if ($request->has('tier')) {
            $query->where('tier', $request->query('tier'));
        }
        
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function($q) use ($search) {
                $q->where('sku_code', 'like', "%$search%")
                  ->orWhere('title', 'like', "%$search%");
            });
        }

        return ResponseFormatter::format($query->get());
    }

    public function show($id) {
        $sku = Sku::with(['primaryCluster', 'skuIntents.intent'])->findOrFail($id);
        return ResponseFormatter::format($sku);
    }

    public function update(Request $request, $id) {
        $sku = Sku::findOrFail($id);
        $sku->update($request->all());
        return ResponseFormatter::format($sku->fresh(['primaryCluster', 'skuIntents.intent']));
    }
}
