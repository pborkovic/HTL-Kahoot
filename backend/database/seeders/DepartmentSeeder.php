<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Informatik', 'slug' => 'informatik'],
            ['name' => 'Netzwerktechnik', 'slug' => 'netzwerktechnik'],
            ['name' => 'Medientechnik', 'slug' => 'medientechnik'],
            ['name' => 'Hochbau', 'slug' => 'hochbau'],
            ['name' => 'Tiefbau', 'slug' => 'tiefbau'],
            ['name' => 'Innenarchitektur', 'slug' => 'innenarchitektur'],
        ];

        foreach ($departments as $index => $data) {
            Department::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'display_order' => $index,
                ]
            );
        }
    }
}
