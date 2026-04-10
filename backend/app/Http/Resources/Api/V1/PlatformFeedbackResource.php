<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\PlatformFeedback;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API resource for {@see PlatformFeedback}.
 *
 * Includes the resolved status, the AI moderation verdict, and a compact
 * author/resolver block so the admin UI can render everything in one shot.
 */
class PlatformFeedbackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var PlatformFeedback $this */
        return [
            'id' => $this->id,
            'message' => $this->message,
            'is_constructive' => (bool) $this->is_constructive,
            'moderation_status' => $this->moderation_status ?? 'pending',
            'moderation_reason' => $this->moderation_reason,
            'is_resolved' => $this->resolved_at !== null,
            'resolved_at' => $this->resolved_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'author' => $this->whenLoaded(relationship: 'author', value: fn () => [
                'id' => $this->author?->id,
                'display_name' => $this->author?->display_name,
                'email' => $this->author?->email,
                'class_name' => $this->author?->class_name,
            ]),
            'resolver' => $this->whenLoaded(relationship: 'resolver', value: fn () => $this->resolver ? [
                'id' => $this->resolver->id,
                'display_name' => $this->resolver->display_name,
                'email' => $this->resolver->email,
            ] : null),
        ];
    }
}
