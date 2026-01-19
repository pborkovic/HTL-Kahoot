<?php

namespace App\Http\Controllers;

use App\Services\Contracts\AuthServiceContract;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthServiceContract $authService
    ) {}

    public function redirect(): JsonResponse
    {
        return response()->json(
            data: [
                'url' => $this->authService->getRedirectUrl()
            ]
        );
    }

    public function callback(Request $request): JsonResponse
    {
        $request->validate(
            rules: [
                'code' => 'required|string'
            ]
        );

        try {
            $socialiteUser = $this->authService->handleCallback(
                code: $request->code
            );

            $user = $this->authService->findOrCreateUser(
                socialiteUser: $socialiteUser
            );

            $token = $this->authService->createToken(
                user: $user
            );

            return response()->json(
                data: [
                    'user' => $user->load(relations: 'roles'),
                    'token' => $token,
                ]
            );
        } catch (Exception $e) {
            return response()->json(
                data: [
                    'error' => 'Authentication failed',
                    'message' => $e->getMessage(),
                ],
                status: 401
            );
        }
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(
            data: [
                'user' => $request->user()->load(relations: 'roles')
            ]
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout(
            user: $request->user()
        );

        return response()->json(
            data: ['message' => 'Logged out successfully']
        );
    }
}
