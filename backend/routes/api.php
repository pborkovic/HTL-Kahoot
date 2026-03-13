<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\QuestionController;
use App\Http\Controllers\Api\V1\QuestionPoolController;
use App\Http\Controllers\Api\V1\QuizController;
use App\Http\Controllers\Api\V1\SessionController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PermissionController;
use Illuminate\Support\Facades\Broadcast;
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
    Broadcast::routes();

    Route::prefix('v1')->group(function () {
        Route::prefix('sessions')->group(function () {
            Route::post('/', [SessionController::class, 'store']);
            Route::post('join', [SessionController::class, 'join']);
            Route::get('{gamePin}', [SessionController::class, 'show']);
            Route::get('{gamePin}/participants', [SessionController::class, 'participants']);
            Route::get('{gamePin}/status', [SessionController::class, 'status']);
            Route::get('{gamePin}/current-question', [SessionController::class, 'currentQuestion']);
            Route::get('{gamePin}/question-results', [SessionController::class, 'questionResults']);
            Route::get('{gamePin}/leaderboard', [SessionController::class, 'leaderboard']);
            Route::get('{gamePin}/results', [SessionController::class, 'results']);
            Route::post('{gamePin}/start', [SessionController::class, 'start']);
            Route::post('{gamePin}/next', [SessionController::class, 'next']);
            Route::post('{gamePin}/answer', [SessionController::class, 'answer']);
        });

        Route::prefix('users')->group(function () {
            Route::get('classes', [UserController::class, 'classes']);
            Route::get('stats', [UserController::class, 'stats']);
            Route::post('bulk', [UserController::class, 'bulk']);
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::post('{user}/restore', [UserController::class, 'restore'])->withTrashed();
            Route::get('{user}', [UserController::class, 'show']);
            Route::put('{user}', [UserController::class, 'update']);
            Route::delete('{user}', [UserController::class, 'destroy']);
            Route::patch('{user}/password', [UserController::class, 'changePassword']);
        });

        Route::prefix('questions')->group(function () {
            Route::get('/', [QuestionController::class, 'index']);
            Route::post('/', [QuestionController::class, 'store']);
            Route::post('import', [QuestionController::class, 'import']);
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

        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index']);
            Route::post('/', [RoleController::class, 'store']);
            Route::delete('{role}', [RoleController::class, 'destroy']);
            Route::post('{role}/permissions', [RoleController::class, 'addPermission']);
            Route::delete('{role}/permissions', [RoleController::class, 'removePermission']);
        });

        Route::prefix('permissions')->group(function () {
            Route::get('/', [PermissionController::class, 'index']);
            Route::post('/', [PermissionController::class, 'store']);
            Route::delete('{permission}', [PermissionController::class, 'destroy']);
        });

        Route::post('users/{user}/roles', [RoleController::class, 'assignRole']);
        Route::delete('users/{user}/roles', [RoleController::class, 'removeRole']);

        Route::prefix('quizzes')->group(function () {
            Route::get('/', [QuizController::class, 'index']);
            Route::post('/', [QuizController::class, 'store']);
            Route::post('{id}/restore', [QuizController::class, 'restore']);
            Route::patch('{quiz}/publish', [QuizController::class, 'publish']);
            Route::get('{quiz}/sessions', [QuizController::class, 'sessions']);
            Route::get('{quiz}', [QuizController::class, 'show']);
            Route::put('{quiz}', [QuizController::class, 'update']);
            Route::delete('{quiz}', [QuizController::class, 'destroy']);
            Route::post('{quiz}/questions', [QuizController::class, 'addQuestion']);
            Route::put('{quiz}/questions/{quizQuestion}', [QuizController::class, 'updateQuestion']);
            Route::delete('{quiz}/questions/{quizQuestion}', [QuizController::class, 'removeQuestion']);
        });
    });
});
