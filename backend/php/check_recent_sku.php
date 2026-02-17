<?php
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\Sku;
use App\Models\ValidationLog;

require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'database'  => $_ENV['DB_DATABASE'] ?? 'cie',
    'username'  => $_ENV['DB_USERNAME'] ?? 'root',
    'password'  => $_ENV['DB_PASSWORD'] ?? '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    $sku = Sku::orderBy('updated_at', 'desc')->first();
    if ($sku) {
        echo "SKU: {$sku->sku_code}\n";
        echo "Status: {$sku->validation_status->value}\n"; // Enum value
        echo "Updated At: {$sku->updated_at}\n";
        
        $log = ValidationLog::where('sku_id', $sku->id)->orderBy('created_at', 'desc')->first();
        if ($log) {
            echo "Last Log Status: {$log->validation_status}\n";
            echo "Log Created At: {$log->created_at}\n";
            echo "Results: " . substr($log->results_json, 0, 100) . "...\n";
        }
    } else {
        echo "No SKUs found.\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
