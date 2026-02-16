<?php
namespace App\Controllers;

use App\Models\User;
use App\Utils\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController {
    public function login(Request $request) {
        $user = User::where('email', $request->input('email'))->first();
        
        if (!$user || !Hash::check($request->input('password'), $user->password_hash)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        
        // Custom token generation for this standalone setup
        $token = bin2hex(random_bytes(32));
        
        return ResponseFormatter::format([
            'user' => $user,
            'token' => $token
        ]);
    }
}
