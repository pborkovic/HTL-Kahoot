<?php

namespace Database\Seeders;

use App\Models\QuestionPool;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuestionPoolSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('email', 'teacher@gamquiz.test')->firstOrFail();

        $pools = [
            [
                'name'        => 'Informatik',
                'description' => 'Fragen zu Grundlagen der Informatik, Algorithmen und Datenstrukturen',
                'is_shared'   => true,
            ],
            [
                'name'        => 'Mathematik',
                'description' => 'Fragen zu Analysis, Algebra und Geometrie',
                'is_shared'   => true,
            ],
            [
                'name'        => 'Allgemeinwissen',
                'description' => 'Allgemeine Wissensfragen für gemischte Quiz-Runden',
                'is_shared'   => true,
            ],
            [
                'name'        => 'Netzwerktechnik',
                'description' => 'Fragen zu TCP/IP, OSI-Modell und Netzwerkprotokollen',
                'is_shared'   => false,
            ],
        ];

        foreach ($pools as $data) {
            QuestionPool::firstOrCreate(
                ['name' => $data['name']],
                array_merge($data, ['created_by' => $teacher->id])
            );
        }
    }
}
