<?php
use App\Controllers\AuthController;
use App\Controllers\SkuController;
use App\Controllers\ValidationController;
use App\Controllers\TierController;
use App\Controllers\ClusterController;
use App\Controllers\AuditController;
use App\Controllers\BriefController;
use App\Enums\RoleType;
use Illuminate\Support\Facades\Route;
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth')->group(function () {
 Route::get('/skus', [SkuController::class, 'index']);
 Route::get('/skus/{id}', [SkuController::class, 'show']);
 Route::post('/skus', [SkuController::class, 'store'])->middleware('rbac:' . RoleType::CONTENT_EDITOR->value . ',' . RoleType::ADMIN->value);
 Route::put('/skus/{id}', [SkuController::class, 'update'])->middleware('rbac:' . RoleType::CONTENT_EDITOR->value . ',' . RoleType::ADMIN->value);
 Route::post('/skus/{id}/validate', [ValidationController::class, 'validate']);
 Route::post('/tiers/recalculate', [TierController::class, 'recalculate'])->middleware('rbac:FINANCE,ADMIN');
 Route::post('/clusters', [ClusterController::class, 'store'])->middleware('rbac:SEO_GOVERNOR,ADMIN');
 Route::put('/clusters/{id}', [ClusterController::class, 'update'])->middleware('rbac:SEO_GOVERNOR,ADMIN');
 Route::post('/audit/{sku_id}', [AuditController::class, 'runAudit'])->middleware('rbac:AI_OPS,ADMIN');
 Route::get('/briefs', [BriefController::class, 'index']);
 Route::post('/briefs', [BriefController::class, 'store'])->middleware('rbac:CONTENT_LEAD,ADMIN');
});
