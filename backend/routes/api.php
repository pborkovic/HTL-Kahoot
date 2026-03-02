<?php

use App\Http\Controllers\Api\V1\QuestionController;
use App\Http\Controllers\Api\V1\QuestionPoolController;
use App\Http\Controllers\Api\V1\QuizController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SessionController;
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

Route::middleware('auth:sanctum')->group(function () {
    Route::post(
        uri: 'sessions',
        action: [SessionController::class, 'store']
    );

    Route::prefix('v1')->group(function () {
        Route::prefix('questions')->group(function () {
            Route::get('/', [QuestionController::class, 'index']);
            Route::post('/', [QuestionController::class, 'store']);
            Route::post('{id}/restore', [QuestionController::class, 'restore']);
            Route::get('{question}/versions', [QuestionController::class, 'versions']);
            Route::patch('{question}/publish', [QuestionController::class, 'publish']);
            Route::get('{question}', [QuestionController::class, 'show']);
            Route::put('{question}', [QuestionController::class, 'update']);
            Route::delete('{question}', [QuestionController::class, 'destroy']);
        });

        Route::prefix('pools')->group(function () {
            Route::get('/', [QuestionPoolController::class, 'index']);
            Route::post('/', [QuestionPoolController::class, 'store']);
            Route::get('{pool}', [QuestionPoolController::class, 'show']);
            Route::put('{pool}', [QuestionPoolController::class, 'update']);
            Route::delete('{pool}', [QuestionPoolController::class, 'destroy']);
            Route::post('{pool}/questions', [QuestionPoolController::class, 'addQuestions']);
            Route::delete('{pool}/questions/{question}', [QuestionPoolController::class, 'removeQuestion']);
        });

        Route::prefix('quizzes')->group(function () {
            Route::get('/', [QuizController::class, 'index']);
            Route::post('/', [QuizController::class, 'store']);
            Route::post('{id}/restore', [QuizController::class, 'restore']);
            Route::patch('{quiz}/publish', [QuizController::class, 'publish']);
            Route::get('{quiz}', [QuizController::class, 'show']);
            Route::put('{quiz}', [QuizController::class, 'update']);
            Route::delete('{quiz}', [QuizController::class, 'destroy']);
            Route::post('{quiz}/questions', [QuizController::class, 'addQuestion']);
            Route::put('{quiz}/questions/{quizQuestion}', [QuizController::class, 'updateQuestion']);
            Route::delete('{quiz}/questions/{quizQuestion}', [QuizController::class, 'removeQuestion']);
        });
    });
});
