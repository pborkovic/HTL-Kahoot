<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UploadQuestionMediaRequest;
use App\Http\Resources\Api\V1\QuestionMediaResource;
use App\Models\Question;
use App\Models\QuestionMedia;
use App\Services\Contracts\MediaServiceContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use OpenApi\Attributes\Delete;
use OpenApi\Attributes\JsonContent;
use OpenApi\Attributes\MediaType;
use OpenApi\Attributes\Parameter;
use OpenApi\Attributes\Post;
use OpenApi\Attributes\Property;
use OpenApi\Attributes\RequestBody;
use OpenApi\Attributes\Response;
use OpenApi\Attributes\Schema;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaServiceContract $mediaService,
    ) {}

    #[Post(
        path: '/api/v1/questions/{questionId}/media',
        description: 'Uploads an image or video file and attaches it to the question.',
        summary: 'Upload media for a question',
        security: [['sanctum' => []]],
        requestBody: new RequestBody(
            required: true,
            content: new MediaType(
                mediaType: 'multipart/form-data',
                schema: new Schema(
                    required: ['file', 'type'],
                    properties: [
                        new Property(property: 'file', type: 'string', format: 'binary'),
                        new Property(property: 'type', type: 'string', enum: ['image', 'video', 'code_snippet']),
                        new Property(property: 'alt_text', type: 'string', nullable: true),
                        new Property(property: 'sort_order', type: 'integer', nullable: true),
                    ]
                )
            )
        ),
        tags: ['Question Media'],
        parameters: [
            new Parameter(name: 'questionId', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 201, description: 'Media uploaded', content: new JsonContent(properties: [new Property(property: 'data', ref: '#/components/schemas/QuestionMedia')])),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
            new Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(UploadQuestionMediaRequest $request, Question $question): JsonResponse
    {
        $this->authorize(ability: 'update', arguments: $question);

        $file = $request->file(key: 'file');
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid().'.'.$extension;
        $path = "questions/{$question->id}/{$filename}";

        $this->mediaService->storeFileContents(
            path: $path,
            contents: $file->getContent(),
        );

        $media = $question->media()->create(attributes: [
            'type' => $request->validated(key: 'type'),
            'url' => $path,
            'alt_text' => $request->validated(key: 'alt_text'),
            'sort_order' => $request->validated(key: 'sort_order', default: 0),
            'created_at' => now(),
        ]);

        return response()->json(data: new QuestionMediaResource(resource: $media), status: 201);
    }

    #[Delete(
        path: '/api/v1/questions/{questionId}/media/{mediaId}',
        description: 'Deletes a media file from the question and from storage.',
        summary: 'Delete question media',
        security: [['sanctum' => []]],
        tags: ['Question Media'],
        parameters: [
            new Parameter(name: 'questionId', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
            new Parameter(name: 'mediaId', in: 'path', required: true, schema: new Schema(type: 'string', format: 'uuid')),
        ],
        responses: [
            new Response(response: 204, description: 'Deleted'),
            new Response(response: 401, description: 'Unauthenticated'),
            new Response(response: 403, description: 'Forbidden'),
            new Response(response: 404, description: 'Not found'),
        ]
    )]
    public function destroy(Question $question, QuestionMedia $questionMedia): JsonResponse
    {
        $this->authorize(ability: 'update', arguments: $question);

        $rawUrl = $questionMedia->getRawOriginal(key: 'url');
        $this->mediaService->delete(path: $rawUrl);

        $questionMedia->delete();

        return response()->json(data: null, status: 204);
    }
}
