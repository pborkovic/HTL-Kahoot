<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\QuestionPool;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('email', 'teacher@gamquiz.test')->firstOrFail();
        $admin   = User::where('email', 'admin@gamquiz.test')->firstOrFail();

        $poolIT   = QuestionPool::where('name', 'Informatik')->first();
        $poolMath = QuestionPool::where('name', 'Mathematik')->first();
        $poolGen  = QuestionPool::where('name', 'Allgemeinwissen')->first();
        $poolNet  = QuestionPool::where('name', 'Netzwerktechnik')->first();

        $questions = [
            // ── Informatik ─────────────────────────────────────────
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolIT,
                'version' => [
                    'title'             => 'Wofür steht das Akronym HTML?',
                    'explanation'       => 'HTML ist die Grundsprache jeder Webseite und beschreibt die Struktur von Inhalten.',
                    'difficulty'        => 1,
                    'default_points'    => 500,
                    'default_time_limit'=> 15,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'HyperText Markup Language', 'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'High Transfer Markup Language', 'is_correct' => false, 'sort_order' => 1],
                    ['text' => 'HyperText Multi Language',   'is_correct' => false, 'sort_order' => 2],
                    ['text' => 'Hyperlink Text Markup Logic','is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolIT,
                'version' => [
                    'title'             => 'Welche Datenstruktur arbeitet nach dem LIFO-Prinzip?',
                    'explanation'       => 'LIFO = Last In, First Out. Ein Stack (Stapel) entnimmt immer das zuletzt eingefügte Element zuerst.',
                    'difficulty'        => 2,
                    'default_points'    => 1000,
                    'default_time_limit'=> 20,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'Stack',  'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'Queue',  'is_correct' => false, 'sort_order' => 1],
                    ['text' => 'Deque',  'is_correct' => false, 'sort_order' => 2],
                    ['text' => 'Heap',   'is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolIT,
                'version' => [
                    'title'             => 'Welcher Sortieralgorithmus hat im Durchschnitt eine Komplexität von O(n log n)?',
                    'explanation'       => 'Merge Sort und Quick Sort erreichen im Durchschnitt O(n log n). Bubble Sort liegt bei O(n²).',
                    'difficulty'        => 3,
                    'default_points'    => 1000,
                    'default_time_limit'=> 25,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'Merge Sort',   'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'Bubble Sort',  'is_correct' => false, 'sort_order' => 1],
                    ['text' => 'Insertion Sort','is_correct' => false,'sort_order' => 2],
                    ['text' => 'Selection Sort','is_correct' => false,'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolIT,
                'version' => [
                    'title'             => 'Was ist der Dezimalwert von der Binärzahl 1010?',
                    'explanation'       => '1010₂ = 1×8 + 0×4 + 1×2 + 0×1 = 10₁₀',
                    'difficulty'        => 2,
                    'default_points'    => 1000,
                    'default_time_limit'=> 20,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => '10', 'is_correct' => true,  'sort_order' => 0],
                    ['text' => '8',  'is_correct' => false, 'sort_order' => 1],
                    ['text' => '12', 'is_correct' => false, 'sort_order' => 2],
                    ['text' => '14', 'is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolIT,
                'version' => [
                    'title'             => 'Welches Schlüsselwort erstellt in Python eine Funktion?',
                    'difficulty'        => 1,
                    'default_points'    => 500,
                    'default_time_limit'=> 15,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'def',      'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'function', 'is_correct' => false, 'sort_order' => 1],
                    ['text' => 'func',     'is_correct' => false, 'sort_order' => 2],
                    ['text' => 'void',     'is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $admin->id,
                'type'         => 'true_false',
                'is_published' => true,
                'pool'         => $poolIT,
                'version' => [
                    'title'             => 'Ein Compiler übersetzt Quellcode direkt in Maschinencode.',
                    'explanation'       => 'Korrekt. Ein Compiler übersetzt den gesamten Quellcode vor der Ausführung in Maschinencode, während ein Interpreter ihn Zeile für Zeile ausführt.',
                    'difficulty'        => 2,
                    'default_points'    => 750,
                    'default_time_limit'=> 15,
                    'randomize_options' => false,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'Wahr',  'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'Falsch','is_correct' => false, 'sort_order' => 1],
                ],
            ],

            // ── Mathematik ─────────────────────────────────────────
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolMath,
                'version' => [
                    'title'             => 'Was ist die Ableitung von f(x) = x²?',
                    'explanation'       => 'Die Potenzregel besagt: d/dx(xⁿ) = n·xⁿ⁻¹. Für n=2 ergibt sich f\'(x) = 2x.',
                    'difficulty'        => 2,
                    'default_points'    => 1000,
                    'default_time_limit'=> 20,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => '2x',  'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'x²',  'is_correct' => false, 'sort_order' => 1],
                    ['text' => '2',   'is_correct' => false, 'sort_order' => 2],
                    ['text' => 'x',   'is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolMath,
                'version' => [
                    'title'             => 'Wie viele Grad hat ein rechter Winkel?',
                    'difficulty'        => 1,
                    'default_points'    => 500,
                    'default_time_limit'=> 10,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => '90°',  'is_correct' => true,  'sort_order' => 0],
                    ['text' => '45°',  'is_correct' => false, 'sort_order' => 1],
                    ['text' => '180°', 'is_correct' => false, 'sort_order' => 2],
                    ['text' => '60°',  'is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolMath,
                'version' => [
                    'title'             => 'Was ist 15 % von 200?',
                    'explanation'       => '15 % von 200 = 200 × 0,15 = 30',
                    'difficulty'        => 1,
                    'default_points'    => 500,
                    'default_time_limit'=> 15,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => '30', 'is_correct' => true,  'sort_order' => 0],
                    ['text' => '15', 'is_correct' => false, 'sort_order' => 1],
                    ['text' => '20', 'is_correct' => false, 'sort_order' => 2],
                    ['text' => '25', 'is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => false,
                'pool'         => $poolMath,
                'version' => [
                    'title'             => 'Was ist der Satz des Pythagoras?',
                    'explanation'       => 'In einem rechtwinkligen Dreieck gilt: a² + b² = c², wobei c die Hypotenuse ist.',
                    'difficulty'        => 2,
                    'default_points'    => 1000,
                    'default_time_limit'=> 20,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'a² + b² = c²', 'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'a + b = c',     'is_correct' => false, 'sort_order' => 1],
                    ['text' => 'a² - b² = c²',  'is_correct' => false, 'sort_order' => 2],
                    ['text' => 'a × b = c²',    'is_correct' => false, 'sort_order' => 3],
                ],
            ],

            // ── Allgemeinwissen ────────────────────────────────────
            [
                'created_by'   => $teacher->id,
                'type'         => 'true_false',
                'is_published' => true,
                'pool'         => $poolGen,
                'version' => [
                    'title'             => 'Wien ist die Hauptstadt von Österreich.',
                    'difficulty'        => 1,
                    'default_points'    => 500,
                    'default_time_limit'=> 10,
                    'randomize_options' => false,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'Wahr',  'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'Falsch','is_correct' => false, 'sort_order' => 1],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'true_false',
                'is_published' => true,
                'pool'         => $poolGen,
                'version' => [
                    'title'             => 'Die Sonne ist ein Planet.',
                    'explanation'       => 'Die Sonne ist ein Stern, kein Planet. Sie ist der Zentralkörper unseres Sonnensystems.',
                    'difficulty'        => 1,
                    'default_points'    => 500,
                    'default_time_limit'=> 10,
                    'randomize_options' => false,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'Wahr',  'is_correct' => false, 'sort_order' => 0],
                    ['text' => 'Falsch','is_correct' => true,  'sort_order' => 1],
                ],
            ],
            [
                'created_by'   => $admin->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolGen,
                'version' => [
                    'title'             => 'In welchem Jahr fand die Mondlandung der Apollo 11 statt?',
                    'explanation'       => 'Am 20. Juli 1969 landeten Neil Armstrong und Buzz Aldrin als erste Menschen auf dem Mond.',
                    'difficulty'        => 2,
                    'default_points'    => 1000,
                    'default_time_limit'=> 20,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => '1969', 'is_correct' => true,  'sort_order' => 0],
                    ['text' => '1972', 'is_correct' => false, 'sort_order' => 1],
                    ['text' => '1965', 'is_correct' => false, 'sort_order' => 2],
                    ['text' => '1975', 'is_correct' => false, 'sort_order' => 3],
                ],
            ],

            // ── Netzwerktechnik ────────────────────────────────────
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolNet,
                'version' => [
                    'title'             => 'Wie viele Schichten hat das OSI-Referenzmodell?',
                    'explanation'       => 'Das OSI-Modell besteht aus 7 Schichten: Physikalisch, Sicherung, Netzwerk, Transport, Sitzung, Darstellung, Anwendung.',
                    'difficulty'        => 2,
                    'default_points'    => 1000,
                    'default_time_limit'=> 20,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => '7', 'is_correct' => true,  'sort_order' => 0],
                    ['text' => '4', 'is_correct' => false, 'sort_order' => 1],
                    ['text' => '5', 'is_correct' => false, 'sort_order' => 2],
                    ['text' => '9', 'is_correct' => false, 'sort_order' => 3],
                ],
            ],
            [
                'created_by'   => $teacher->id,
                'type'         => 'multiple_choice',
                'is_published' => true,
                'pool'         => $poolNet,
                'version' => [
                    'title'             => 'Welches Protokoll wird verwendet, um IP-Adressen automatisch zuzuweisen?',
                    'explanation'       => 'DHCP (Dynamic Host Configuration Protocol) vergibt IP-Adressen, Subnetzmasken, Gateway und DNS automatisch.',
                    'difficulty'        => 2,
                    'default_points'    => 1000,
                    'default_time_limit'=> 20,
                    'randomize_options' => true,
                    'config'            => [],
                ],
                'options' => [
                    ['text' => 'DHCP', 'is_correct' => true,  'sort_order' => 0],
                    ['text' => 'DNS',  'is_correct' => false, 'sort_order' => 1],
                    ['text' => 'ARP',  'is_correct' => false, 'sort_order' => 2],
                    ['text' => 'ICMP', 'is_correct' => false, 'sort_order' => 3],
                ],
            ],
        ];

        foreach ($questions as $data) {
            DB::transaction(function () use ($data, $teacher) {
                $question = Question::create([
                    'created_by'   => $data['created_by'],
                    'type'         => $data['type'],
                    'is_published' => $data['is_published'],
                ]);

                $versionData              = $data['version'];
                $versionData['created_by'] = $data['created_by'];
                $versionData['version']    = 1;

                $version = $question->versions()->create($versionData);

                foreach ($data['options'] as $option) {
                    $version->answerOptions()->create($option);
                }

                $question->update(['current_version_id' => $version->id]);

                if ($data['pool']) {
                    $data['pool']->questions()->syncWithoutDetaching([
                        $question->id => ['added_at' => now()],
                    ]);
                }
            });
        }
    }
}
