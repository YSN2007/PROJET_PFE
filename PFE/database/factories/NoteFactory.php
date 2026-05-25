<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Stagiaire;
use App\Models\Module;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'note' => $this->faker->numberBetween(5,20),
            'stagiaire_id' => Stagiaire::inRandomOrder()->first()->id,
            'module_id' => Module::inRandomOrder()->first()->id,
        ];
    }
}
