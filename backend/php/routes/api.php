<?php
use App\Controllers\AuthController;
use App\Controllers\SkuController;
use App\Controllers\ValidationController;
use App\Controllers\TierController;
use App\Controllers\ClusterController;
use App\Controllers\AuditController;
use App\Controllers\BriefController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth')->group(function () {
    // SKU Management
    Route::get('/skus', [SkuController::class, 'index']);
    Route::get('/skus/{id}', [SkuController::class, 'show']);
    Route::post('/skus', [SkuController::class, 'store'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    Route::put('/skus/{id}', [SkuController::class, 'update'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    
    // Validation
    Route::post('/skus/{id}/validate', [ValidationController::class, 'validate']);
    
    // Tier Management
    Route::post('/tiers/recalculate', [TierController::class, 'recalculate'])->middleware('rbac:FINANCE,ADMIN');
    
    // Cluster Management
    Route::get('/clusters', [ClusterController::class, 'index']);
    Route::get('/clusters/{id}', [ClusterController::class, 'show']);
    Route::post('/clusters', [ClusterController::class, 'store'])->middleware('rbac:SEO_GOVERNOR,ADMIN');
    Route::put('/clusters/{id}', [ClusterController::class, 'update'])->middleware('rbac:SEO_GOVERNOR,ADMIN');
    
    // Audit Management
    Route::post('/audit/{sku_id}', [AuditController::class, 'runAudit'])->middleware('rbac:AI_OPS,ADMIN');
    Route::get('/audit/{sku_id}/history', [AuditController::class, 'history']);
    Route::get('/audit-result/{auditId}', [AuditController::class, 'getResult']);
    
    // Brief Management
    Route::get('/briefs', [BriefController::class, 'index']);
    Route::post('/briefs', [BriefController::class, 'store'])->middleware('rbac:CONTENT_EDITOR,ADMIN');
    Route::get('/briefs/{id}', [BriefController::class, 'show']);
});
