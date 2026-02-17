<?php

use App\Models\User;
use App\Models\Role;
use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Events\Dispatcher;

require __DIR__ . '/vendor/autoload.php';

// Bootstrap Eloquent
$capsule = new Capsule;

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

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

$capsule->setEventDispatcher(new Dispatcher(new Container));
$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Debug RBAC Script\n";
echo "=================\n";

echo "\nREAD-ONLY VERIFICATION\n";
echo "======================\n";

try {
    $roles = Role::all();
    echo "Roles in Database:\n";
    foreach ($roles as $role) {
        echo "- ID: {$role->id}, Name: {$role->name}\n";
    }
} catch (\Exception $e) {
    echo "Error listing roles: " . $e->getMessage() . "\n";
}

echo "\nUsers:\n";
try {
    // FIX: Correct incorrect role_id 'ADMIN' to actual UUID
    $adminRole = Role::where('name', 'ADMIN')->first();
    if ($adminRole) {
        $users = User::all();
        foreach ($users as $user) {
            // Check if role_id is 'ADMIN' (string) or NULL
            if ($user->role_id === 'ADMIN' || is_null($user->role_id)) {
                echo "Fixing user {$user->email}: Setting role_id to {$adminRole->id}...\n";
                $user->role_id = $adminRole->id;
                $user->save();
                echo "-> Fixed.\n";
            }
        }
    } else {
        echo "CRITICAL: ADMIN role not found in database!\n";
    }

} catch (\Exception $e) {
    echo "Error processing users: " . $e->getMessage() . "\n";
}

echo "\nFINAL VERIFICATION:\n";
try {
    $users = User::with('role')->get();
    foreach ($users as $user) {
         $roleName = $user->role ? $user->role->name : 'NULL';
         echo "- Email: {$user->email}, Role Name: {$roleName}\n";
    }
} catch (\Exception $e) {
     echo "Error listing users: " . $e->getMessage() . "\n";
}
