<?php

use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'HTL Kahoot API',
    ]);
});

Route::prefix('auth')->group(function () {
    Route::get(
        uri: 'redirect',
        action: [AuthController::class, 'redirect']
    );
    Route::match(
        methods: [
            'get',
            'post'
        ],
        uri: 'callback',
        action: [AuthController::class, 'callback']
    );

    Route::middleware('auth:sanctum')->group(function () {
        Route::get(
            uri: 'user',
            action: [AuthController::class, 'user']
        );
        Route::post(
            uri: 'logout',
            action: [AuthController::class, 'logout']
        );
    });
});

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('users/classes', [UserController::class, 'classes']);
    Route::get('users/stats', [UserController::class, 'stats']);
    Route::post('users/bulk', [UserController::class, 'bulk']);

    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::put('users/{user}', [UserController::class, 'update']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);
    Route::post('users/{user}/restore', [UserController::class, 'restore'])->withTrashed();
    Route::patch('users/{user}/password', [UserController::class, 'changePassword']);
});
