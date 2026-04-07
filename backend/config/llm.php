<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Ollama Connection
    |--------------------------------------------------------------------------
    |
    | Configuration for the Ollama LLM server running Llama 3.2 3B.
    | The host should point to the Ollama container within Docker,
    | or localhost when running outside of Docker.
    |
    */

    'host' => env('OLLAMA_HOST', 'http://ollama:11434'),

    'model' => env('OLLAMA_MODEL', 'llama3.2:3b'),

    'timeout' => (int) env('OLLAMA_TIMEOUT', 120),

];
