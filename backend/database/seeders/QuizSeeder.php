<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('email', 'teacher@gamquiz.test')->firstOrFail();
        $admin   = User::where('email', 'admin@gamquiz.test')->firstOrFail();

        $poolIT   = QuestionPool::where('name', 'Informatik')->first();
        $poolMath = QuestionPool::where('name', 'Mathematik')->first();
        $poolNet  = QuestionPool::where('name', 'Netzwerktechnik')->first();

        $itQuestions   = Question::where('type', '!=', 'true_false')
            ->whereHas('pools', fn($q) => $q->where('question_pools.id', $poolIT->id))
            ->where('is_published', true)
            ->with('currentVersion')
            ->get();

        $mathQuestions = Question::whereHas('pools', fn($q) => $q->where('question_pools.id', $poolMath->id))
            ->where('is_published', true)
            ->with('currentVersion')
            ->get();

        $netQuestions  = Question::whereHas('pools', fn($q) => $q->where('question_pools.id', $poolNet->id))
            ->where('is_published', true)
            ->with('currentVersion')
            ->get();

        $allPublished = Question::where('is_published', true)
            ->with('currentVersion')
            ->get();

        $quizzes = [
            [
                'data' => [
                    'title'               => 'Grundlagen der Informatik',
                    'description'         => 'Ein Quiz zu HTML, Algorithmen, Datenstrukturen und Python-Grundlagen.',
                    'created_by'          => $teacher->id,
                    'pool_id'             => $poolIT->id,
                    'time_mode'           => 'per_question',
                    'speed_scoring'       => true,
                    'speed_factor_min'    => 0.50,
                    'speed_factor_max'    => 1.00,
                    'gamble_uses'         => 1,
                    'randomize_questions' => false,
                    'is_published'        => true,
                ],
                'questions' => $itQuestions,
            ],
            [
                'data' => [
                    'title'               => 'Mathematik Grundlagen',
                    'description'         => 'Ableitungen, Geometrie und Prozentrechnung.',
                    'created_by'          => $teacher->id,
                    'pool_id'             => $poolMath->id,
                    'time_mode'           => 'per_question',
                    'speed_scoring'       => true,
                    'speed_factor_min'    => 0.80,
                    'speed_factor_max'    => 1.00,
                    'gamble_uses'         => 0,
                    'randomize_questions' => false,
                    'is_published'        => true,
                ],
                'questions' => $mathQuestions,
            ],
            [
                'data' => [
                    'title'               => 'Netzwerktechnik Basics',
                    'description'         => 'OSI-Modell und Netzwerkprotokolle.',
                    'created_by'          => $teacher->id,
                    'pool_id'             => $poolNet->id,
                    'time_mode'           => 'per_question',
                    'speed_scoring'       => false,
                    'speed_factor_min'    => 0.80,
                    'speed_factor_max'    => 1.00,
                    'gamble_uses'         => 0,
                    'randomize_questions' => false,
                    'is_published'        => false,
                ],
                'questions' => $netQuestions,
            ],
            [
                'data' => [
                    'title'               => 'Gemischtes Wissensspiel',
                    'description'         => 'Fragen aus allen Themengebieten — ideal für Aufwärmrunden.',
                    'created_by'          => $admin->id,
                    'pool_id'             => null,
                    'time_mode'           => 'per_question',
                    'speed_scoring'       => true,
                    'speed_factor_min'    => 0.60,
                    'speed_factor_max'    => 1.00,
                    'gamble_uses'         => 2,
                    'randomize_questions' => true,
                    'is_published'        => true,
                ],
                'questions' => $allPublished,
            ],
        ];

        foreach ($quizzes as $entry) {
            $quiz = Quiz::firstOrCreate(
                ['title' => $entry['data']['title']],
                $entry['data']
            );

            if ($quiz->quizQuestions()->count() > 0) {
                continue;
            }

            foreach ($entry['questions'] as $sort => $question) {
                if (!$question->currentVersion) {
                    continue;
                }

                $quiz->quizQuestions()->create([
                    'question_version_id' => $question->currentVersion->id,
                    'sort_order'          => $sort,
                    'points_override'     => null,
                    'time_limit_override' => null,
                    'weight'              => 1.00,
                ]);
            }
        }
    }
}
