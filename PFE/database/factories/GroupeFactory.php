<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Groupe>
 */
class GroupeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom_groupe'=> 'DEV' . $this->faker->numberBetween(101,999),
            'filiere' => $this->faker->randomElement(['DD','ID','GE']),
        ];
    }
}
