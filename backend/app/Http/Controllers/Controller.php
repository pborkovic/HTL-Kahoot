<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use OpenApi\Attributes\Info;
use OpenApi\Attributes\SecurityScheme;

#[Info(
    version: '1.0.0',
    title: 'HTL Kahoot API',
    description: 'API documentation for the HTL Kahoot application',
)]
#[SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Token',
    description: 'Enter your Sanctum token',
)]
abstract class Controller
{
    use AuthorizesRequests;
}
