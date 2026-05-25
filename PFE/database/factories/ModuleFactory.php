<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Groupe;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Module>
 */
class ModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom_module' => $this->faker->word(),
            'masse_horaire' => $this->faker->numberBetween(20,120),
            'groupe_id' =>Groupe::inRandomOrder()->first()->id,
        ];
    }
}
