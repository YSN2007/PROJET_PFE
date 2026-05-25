<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Stagiaire;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Absence>
 */
class AbsenceFactory extends Factory
{
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date_absence' => $this->faker->date(),
            'justifie' => $this->faker->boolean(),
            'stagiaire_id' => Stagiaire::inRandomOrder()->first()->id,
        ];
    }
}
