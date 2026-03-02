<?php

namespace App\OpenApi;

use OpenApi\Attributes\AdditionalProperties;
use OpenApi\Attributes\Items;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\Schema;

#[Schema(
    schema: 'PaginationMeta',
    type: 'object',
    properties: [
        new Property(property: 'current_page', type: 'integer', example: 1),
        new Property(property: 'last_page', type: 'integer', example: 5),
        new Property(property: 'per_page', type: 'integer', example: 20),
        new Property(property: 'total', type: 'integer', example: 87),
    ]
)]
#[Schema(
    schema: 'AnswerOption',
    type: 'object',
    properties: [
        new Property(property: 'id', type: 'string', format: 'uuid'),
        new Property(property: 'text', type: 'string', example: 'Paris'),
        new Property(property: 'is_correct', type: 'boolean', example: true),
        new Property(property: 'sort_order', type: 'integer', example: 0),
    ]
)]
#[Schema(
    schema: 'QuestionVersion',
    type: 'object',
    properties: [
        new Property(property: 'id', type: 'string', format: 'uuid'),
        new Property(property: 'version', type: 'integer', example: 1),
        new Property(property: 'title', type: 'string', example: 'What is the capital of France?'),
        new Property(property: 'explanation', type: 'string', nullable: true),
        new Property(property: 'difficulty', type: 'integer', nullable: true, example: 2),
        new Property(property: 'default_points', type: 'integer', example: 1000),
        new Property(property: 'default_time_limit', type: 'integer', nullable: true, example: 20),
        new Property(property: 'randomize_options', type: 'boolean', example: true),
        new Property(property: 'config', type: 'object'),
        new Property(property: 'created_at', type: 'string', format: 'date-time'),
        new Property(
            property: 'answer_options',
            type: 'array',
            items: new Items(ref: '#/components/schemas/AnswerOption')
        ),
    ]
)]
#[Schema(
    schema: 'Question',
    type: 'object',
    properties: [
        new Property(property: 'id', type: 'string', format: 'uuid'),
        new Property(property: 'type', type: 'string', example: 'multiple_choice'),
        new Property(property: 'is_published', type: 'boolean', example: false),
        new Property(property: 'created_by', type: 'string', format: 'uuid'),
        new Property(property: 'created_at', type: 'string', format: 'date-time'),
        new Property(property: 'updated_at', type: 'string', format: 'date-time'),
        new Property(property: 'deleted_at', type: 'string', format: 'date-time', nullable: true),
        new Property(property: 'current_version', ref: '#/components/schemas/QuestionVersion', nullable: true),
        new Property(
            property: 'versions',
            type: 'array',
            items: new Items(ref: '#/components/schemas/QuestionVersion')
        ),
    ]
)]
#[Schema(
    schema: 'QuestionList',
    type: 'object',
    properties: [
        new Property(
            property: 'data',
            type: 'array',
            items: new Items(ref: '#/components/schemas/Question')
        ),
        new Property(property: 'meta', ref: '#/components/schemas/PaginationMeta'),
    ]
)]
#[Schema(
    schema: 'QuizQuestion',
    type: 'object',
    properties: [
        new Property(property: 'id', type: 'string', format: 'uuid'),
        new Property(property: 'sort_order', type: 'integer', example: 0),
        new Property(property: 'points_override', type: 'integer', nullable: true),
        new Property(property: 'time_limit_override', type: 'integer', nullable: true),
        new Property(property: 'weight', type: 'number', format: 'float', example: 1.0),
        new Property(property: 'question_version', ref: '#/components/schemas/QuestionVersion', nullable: true),
    ]
)]
#[Schema(
    schema: 'Quiz',
    type: 'object',
    properties: [
        new Property(property: 'id', type: 'string', format: 'uuid'),
        new Property(property: 'title', type: 'string', example: 'French Geography Quiz'),
        new Property(property: 'description', type: 'string', nullable: true),
        new Property(property: 'created_by', type: 'string', format: 'uuid'),
        new Property(property: 'pool_id', type: 'string', format: 'uuid', nullable: true),
        new Property(property: 'time_mode', type: 'string', enum: ['per_question', 'total'], example: 'per_question'),
        new Property(property: 'total_time_limit', type: 'integer', nullable: true),
        new Property(property: 'speed_scoring', type: 'boolean', example: true),
        new Property(property: 'speed_factor_min', type: 'number', format: 'float', example: 0.8),
        new Property(property: 'speed_factor_max', type: 'number', format: 'float', example: 1.0),
        new Property(property: 'gamble_uses', type: 'integer', example: 0),
        new Property(property: 'randomize_questions', type: 'boolean', example: false),
        new Property(property: 'random_mode', type: 'string', nullable: true),
        new Property(property: 'random_count', type: 'integer', nullable: true),
        new Property(property: 'is_published', type: 'boolean', example: false),
        new Property(property: 'created_at', type: 'string', format: 'date-time'),
        new Property(property: 'updated_at', type: 'string', format: 'date-time'),
        new Property(property: 'deleted_at', type: 'string', format: 'date-time', nullable: true),
        new Property(property: 'pool', ref: '#/components/schemas/QuestionPool', nullable: true),
        new Property(
            property: 'quiz_questions',
            type: 'array',
            items: new Items(ref: '#/components/schemas/QuizQuestion')
        ),
    ]
)]
#[Schema(
    schema: 'QuizList',
    type: 'object',
    properties: [
        new Property(
            property: 'data',
            type: 'array',
            items: new Items(ref: '#/components/schemas/Quiz')
        ),
        new Property(property: 'meta', ref: '#/components/schemas/PaginationMeta'),
    ]
)]
#[Schema(
    schema: 'QuestionPool',
    type: 'object',
    properties: [
        new Property(property: 'id', type: 'string', format: 'uuid'),
        new Property(property: 'name', type: 'string', example: 'Geography Questions'),
        new Property(property: 'description', type: 'string', nullable: true),
        new Property(property: 'is_shared', type: 'boolean', example: false),
        new Property(property: 'created_by', type: 'string', format: 'uuid'),
        new Property(property: 'question_count', type: 'integer', example: 12),
        new Property(property: 'created_at', type: 'string', format: 'date-time'),
        new Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
#[Schema(
    schema: 'QuestionPoolList',
    type: 'object',
    properties: [
        new Property(
            property: 'data',
            type: 'array',
            items: new Items(ref: '#/components/schemas/QuestionPool')
        ),
        new Property(property: 'meta', ref: '#/components/schemas/PaginationMeta'),
    ]
)]
#[Schema(
    schema: 'User',
    type: 'object',
    properties: [
        new Property(property: 'id', type: 'string', format: 'uuid'),
        new Property(property: 'email', type: 'string', format: 'email'),
        new Property(property: 'username', type: 'string', nullable: true),
        new Property(property: 'display_name', type: 'string', nullable: true),
        new Property(property: 'class_name', type: 'string', nullable: true),
        new Property(property: 'auth_provider', type: 'string', enum: ['local', 'entra_id']),
        new Property(property: 'is_active', type: 'boolean'),
        new Property(property: 'totp_enabled', type: 'boolean'),
        new Property(property: 'last_login_at', type: 'string', format: 'date-time', nullable: true),
        new Property(property: 'created_at', type: 'string', format: 'date-time'),
        new Property(property: 'updated_at', type: 'string', format: 'date-time'),
        new Property(property: 'deleted_at', type: 'string', format: 'date-time', nullable: true),
        new Property(property: 'roles', type: 'array', items: new Items(type: 'string'), example: ['student']),
    ]
)]
#[Schema(
    schema: 'UserList',
    type: 'object',
    properties: [
        new Property(property: 'data', type: 'array', items: new Items(ref: '#/components/schemas/User')),
        new Property(property: 'meta', ref: '#/components/schemas/PaginationMeta'),
    ]
)]
#[Schema(
    schema: 'ClassEntry',
    type: 'object',
    properties: [
        new Property(property: 'class_name', type: 'string', example: '3a'),
        new Property(property: 'student_count', type: 'integer', example: 24),
    ]
)]
#[Schema(
    schema: 'UserStats',
    type: 'object',
    properties: [
        new Property(property: 'total_users', type: 'integer'),
        new Property(property: 'active_users', type: 'integer'),
        new Property(property: 'by_role', type: 'object', additionalProperties: new AdditionalProperties(type: 'integer')),
        new Property(property: 'by_auth_provider', type: 'object', additionalProperties: new AdditionalProperties(type: 'integer')),
        new Property(property: 'recent_signups_30d', type: 'integer'),
    ]
)]
#[Schema(
    schema: 'BulkResult',
    type: 'object',
    properties: [
        new Property(property: 'created', type: 'integer'),
        new Property(property: 'skipped', type: 'integer'),
        new Property(
            property: 'errors',
            type: 'array',
            items: new Items(
                properties: [
                    new Property(property: 'row', type: 'integer'),
                    new Property(property: 'email', type: 'string', nullable: true),
                    new Property(property: 'errors', type: 'array', items: new Items(type: 'string')),
                ],
                type: 'object'
            )
        ),
    ]
)]
abstract class Schemas {}
