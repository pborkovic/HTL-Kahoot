<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Question media upload limits
|--------------------------------------------------------------------------
|
| Maximum allowed upload sizes (in kilobytes) for media attached to
| questions, split by media type so images are bounded tighter than
| videos. These values are the upper bound enforced at the application
| layer; PHP's own upload_max_filesize / post_max_size (set in the
| Dockerfile) must be greater than or equal to these numbers.
|
*/

return [
    'image_max_kb' => (int) env('MEDIA_IMAGE_MAX_KB', 8192),
    'video_max_kb' => (int) env('MEDIA_VIDEO_MAX_KB', 51200),

    'image_mimes' => ['jpeg', 'png', 'gif', 'webp'],
    'video_mimes' => ['mp4', 'webm'],
];
