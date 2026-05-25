<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Groupe;
use App\Models\Stagiaire;
use App\Models\Module;
use App\Models\Note;
use App\Models\Absence;
use App\Models\Formateur;




class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
         // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call(RoleSeeder::class);

        User::create([
            'name'=>'Admin',
            'email'=>'admin@test.com',
            'password'=>Hash::make('123456'),
            'role_id'=>1
        ]);

        $users = User::factory(10)->create();

        $formateurs = $users
            ->where('role_id', 2)
            ->map(function (User $user) {
                $parts = preg_split('/\s+/', trim($user->name)) ?: [];
                $prenom = $parts[0] ?? $user->name;
                $nom = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : $prenom;

                return Formateur::create([
                    'user_id' => $user->id,
                    'prenom' => $prenom,
                    'nom' => $nom,
                    'specialite' => 'Non renseignee',
                ]);
            });

        Groupe::factory(5)->create();
        Module::factory(10)->create();

        if ($formateurs->isNotEmpty()) {
            Module::query()->get()->each(function (Module $module) use ($formateurs) {
                $module->update([
                    'formateur_id' => $formateurs->random()->id,
                ]);
            });
        }

        $stagiaires = Stagiaire::factory(20)->create();

        $users
            ->where('role_id', 3)
            ->values()
            ->each(function (User $user, int $index) use ($stagiaires) {
                $stagiaire = $stagiaires->get($index);

                if (! $stagiaire) {
                    return;
                }

                $stagiaire->update([
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            });

        Note::factory(50)->create();
        Absence::factory(30)->create();


    }
}
