<?php
use App\Controllers\AuthController;
use App\Controllers\SkuController;
use App\Controllers\ValidationController;
use App\Controllers\TierController;
use App\Controllers\ClusterController;
use App\Controllers\AuditController;
use App\Controllers\BriefController;
use App\Controllers\IntentsController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth')->group(function () {
    // SKU Management
    Route::get('/skus', [SkuController::class, 'index']);
    Route::get('/skus/stats', [SkuController::class, 'stats']);
    Route::get('/skus/{id}', [SkuController::class, 'show']);
    Route::post('/skus', [SkuController::class, 'store'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    Route::put('/skus/{id}', [SkuController::class, 'update'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    Route::post('/skus/{id}/validate', [ValidationController::class, 'validate']);
    Route::get('/skus/{id}/readiness', [SkuController::class, 'readiness']);

    // Tier Management
    Route::post('/tiers/recalculate', [TierController::class, 'recalculate'])->middleware('rbac:FINANCE,ADMIN');

    // Cluster Management
    Route::get('/clusters', [ClusterController::class, 'index']);
    Route::get('/clusters/{id}', [ClusterController::class, 'show']);
    Route::post('/clusters', [ClusterController::class, 'store'])->middleware('rbac:SEO_GOVERNOR,ADMIN');
    Route::put('/clusters/{id}', [ClusterController::class, 'update'])->middleware('rbac:SEO_GOVERNOR,ADMIN');

    // Taxonomy (Unified API 7.1)
    Route::get('/taxonomy/intents', [IntentsController::class, 'index']);

    // Audit Management
    Route::post('/audit/{sku_id}', [AuditController::class, 'runAudit'])->middleware('rbac:AI_OPS,ADMIN');
    Route::post('/audit/run', [AuditController::class, 'runByCategory'])->middleware('rbac:AI_OPS,ADMIN');
    Route::get('/audit/{sku_id}/history', [AuditController::class, 'history']);
    Route::get('/audit-result/{auditId}', [AuditController::class, 'getResult']);
    Route::get('/audit/results/{category}', [AuditController::class, 'resultsByCategory']);

    // Brief Management
    Route::get('/briefs', [BriefController::class, 'index']);
    Route::post('/briefs', [BriefController::class, 'store'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    Route::post('/brief/generate', [BriefController::class, 'generate']);
    Route::get('/briefs/{id}', [BriefController::class, 'show']);

    // ERP Sync (Unified API 7.1)
    Route::post('/erp/sync', [TierController::class, 'erpSync'])->middleware('rbac:FINANCE,ADMIN');
});

// Unified API v1 — same routes under /api/v1 for spec compliance
Route::prefix('v1')->middleware('auth')->group(function () {
    Route::get('/skus', [SkuController::class, 'index']);
    Route::get('/skus/stats', [SkuController::class, 'stats']);
    Route::get('/skus/{id}', [SkuController::class, 'show']);
    Route::get('/skus/{id}/readiness', [SkuController::class, 'readiness']);
    Route::post('/skus', [SkuController::class, 'store'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    Route::put('/skus/{id}', [SkuController::class, 'update'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    Route::post('/skus/{id}/validate', [ValidationController::class, 'validate']);
    Route::post('/tiers/recalculate', [TierController::class, 'recalculate'])->middleware('rbac:FINANCE,ADMIN');
    Route::get('/clusters', [ClusterController::class, 'index']);
    Route::get('/clusters/{id}', [ClusterController::class, 'show']);
    Route::post('/clusters', [ClusterController::class, 'store'])->middleware('rbac:SEO_GOVERNOR,ADMIN');
    Route::put('/clusters/{id}', [ClusterController::class, 'update'])->middleware('rbac:SEO_GOVERNOR,ADMIN');
    Route::get('/taxonomy/intents', [IntentsController::class, 'index']);
    Route::post('/audit/run', [AuditController::class, 'runByCategory'])->middleware('rbac:AI_OPS,ADMIN');
    Route::get('/audit/results/{category}', [AuditController::class, 'resultsByCategory']);
    Route::post('/brief/generate', [BriefController::class, 'generate']);
    Route::post('/erp/sync', [TierController::class, 'erpSync'])->middleware('rbac:FINANCE,ADMIN');
});
