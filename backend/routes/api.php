<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'HTL Kahoot API',
    ]);
});

Route::prefix('auth')->group(function () {
    Route::get('redirect', [AuthController::class, 'redirect']);
    Route::get('callback', [AuthController::class, 'callback']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [AuthController::class, 'user']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});
