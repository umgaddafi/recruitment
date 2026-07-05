<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rank;

class RankSeeder extends Seeder
{
    public function run(): void
    {
        $ranks = [
            ['name' => 'Graduate Assistant', 'category' => 'Academic'],
            ['name' => 'Assistant Lecturer', 'category' => 'Academic'],
            ['name' => 'Lecturer II', 'category' => 'Academic'],
            ['name' => 'Lecturer I', 'category' => 'Academic'],
            ['name' => 'Senior Lecturer', 'category' => 'Academic'],
            ['name' => 'Associate Professor', 'category' => 'Academic'],
            ['name' => 'Professor', 'category' => 'Academic'],
        ];

        foreach ($ranks as $rank) {
            Rank::updateOrCreate(['name' => $rank['name']], $rank);
        }
    }
}
