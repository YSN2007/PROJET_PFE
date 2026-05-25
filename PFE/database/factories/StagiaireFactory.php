<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Groupe;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stagiaire>
 */
class StagiaireFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom'=>$this->faker->lastName(),
            'prenom'=> $this->faker->firstName(),
            'email' => $this->faker->unique()->safeEmail(),
            'groupe_id' => Groupe::inRandomOrder()->first()?->id,

        ];
    }
}
