<?php

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
