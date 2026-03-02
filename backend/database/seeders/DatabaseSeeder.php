<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            DevUserSeeder::class,
            QuestionPoolSeeder::class,
            QuestionSeeder::class,
            QuizSeeder::class,
            AnswersSeeder::class,
            FeedbackSeeder::class,
            ConveyanceSeeder::class,
        ]);
    }
}
