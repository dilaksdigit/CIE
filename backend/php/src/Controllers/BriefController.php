<?php
namespace App\Controllers;

use Illuminate\Http\Request;
use App\Utils\ResponseFormatter;

class BriefController {
    public function index() {
        return ResponseFormatter::format(['data' => []]);
    }

    public function store(Request $request) {
        return ResponseFormatter::format(['data' => ['id' => uniqid('brief-')]], 'Created', 201);
    }

    public function show($id) {
        return ResponseFormatter::format(['data' => ['id' => $id, 'status' => 'draft']]);
    }

    /**
     * POST /api/v1/brief/generate — auto-generate content brief (Week 3 decay). Unified API 7.1.
     */
    public function generate(Request $request) {
        $request->validate([
            'sku_id' => 'required|string',
            'failing_questions' => 'required|array',
            'failing_questions.*' => 'string',
        ]);
        $briefId = uniqid('brief-');
        return response()->json([
            'data' => [
                'brief_id' => $briefId,
                'deadline' => now()->addDays(14)->toDateString(),
                'assigned_to' => null,
            ]
        ], 201);
    }
}
