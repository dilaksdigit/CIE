<?php
namespace App\Controllers;

use App\Models\Cluster;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;

class ClusterController {
    public function index() {
        return ResponseFormatter::format(Cluster::withCount('skus')->get());
    }

    public function show($id) {
        $cluster = Cluster::with(['skus', 'primaryIntent'])->findOrFail($id);
        return ResponseFormatter::format($cluster);
    }

    public function update(Request $request, $id) {
        $cluster = Cluster::findOrFail($id);
        $cluster->update($request->all());
        return ResponseFormatter::format($cluster);
    }
}
