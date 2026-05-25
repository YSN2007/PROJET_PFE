<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Models\Formateur;
use App\Models\User;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

if (! function_exists('sync_formateur_split_name')) {
    function sync_formateur_split_name(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        $prenom = $parts[0] ?? $fullName;
        $nom = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : $prenom;

        return [$prenom, $nom];
    }
}

if (! function_exists('sync_formateur_normalize_name')) {
    function sync_formateur_normalize_name(string $value): string
    {
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
        $normalized = $normalized === false ? $value : $normalized;
        $normalized = strtolower(trim(preg_replace('/\s+/', ' ', $normalized) ?? $normalized));

        return $normalized;
    }
}

Artisan::command('formateurs:sync-existing-users {--dry-run : Preview sync without writing data}', function () {
    $dryRun = (bool) $this->option('dry-run');
    $users = User::where('role_id', 2)->with('formateur')->orderBy('id')->get();
    $availableFormateurs = Formateur::whereNull('user_id')->orderBy('id')->get();

    $summary = [
        'created' => 0,
        'linked' => 0,
        'skipped' => 0,
    ];

    $sync = function () use ($users, $availableFormateurs, $dryRun, &$summary) {
        foreach ($users as $user) {
            if ($user->formateur) {
                $summary['skipped']++;
                $this->line("Skip user #{$user->id} {$user->name}: already linked.");
                continue;
            }

            [$prenom, $nom] = sync_formateur_split_name($user->name);
            $normalizedUserName = sync_formateur_normalize_name($user->name);

            $match = $availableFormateurs->first(function (Formateur $formateur) use ($normalizedUserName) {
                $fullName = sync_formateur_normalize_name("{$formateur->prenom} {$formateur->nom}");
                $reverseFullName = sync_formateur_normalize_name("{$formateur->nom} {$formateur->prenom}");

                return $normalizedUserName === $fullName || $normalizedUserName === $reverseFullName;
            });

            if ($match) {
                $summary['linked']++;
                $this->info("Link user #{$user->id} {$user->name} -> formateur #{$match->id} {$match->prenom} {$match->nom}");

                if (! $dryRun) {
                    $match->update(['user_id' => $user->id]);
                }

                $availableFormateurs->forget($availableFormateurs->search(fn (Formateur $item) => $item->id === $match->id));
                continue;
            }

            $summary['created']++;
            $this->info("Create formateur profile for user #{$user->id} {$user->name}");

            if (! $dryRun) {
                Formateur::create([
                    'user_id' => $user->id,
                    'prenom' => $prenom,
                    'nom' => $nom,
                    'specialite' => 'Non renseignee',
                ]);
            }
        }
    };

    if ($dryRun) {
        $this->comment('Dry run mode: no database changes will be written.');
        $sync();
    } else {
        DB::transaction($sync);
    }

    $this->newLine();
    $this->table(
        ['Created profiles', 'Linked existing profiles', 'Skipped already linked'],
        [[
            $summary['created'],
            $summary['linked'],
            $summary['skipped'],
        ]]
    );
})->purpose('Attach existing role_id=2 users to formateur profiles without breaking current data.');

Artisan::command('stagiaires:sync-existing-users {--dry-run : Preview sync without writing data}', function () {
    $dryRun = (bool) $this->option('dry-run');
    $users = User::where('role_id', 3)->with('stagiaire')->orderBy('id')->get();
    $availableStagiaires = \App\Models\Stagiaire::whereNull('user_id')->orderBy('id')->get();

    $summary = [
        'linked' => 0,
        'skipped' => 0,
        'unmatched' => 0,
    ];

    $sync = function () use ($users, $availableStagiaires, $dryRun, &$summary) {
        foreach ($users as $user) {
            if ($user->stagiaire) {
                $summary['skipped']++;
                $this->line("Skip user #{$user->id} {$user->email}: already linked.");
                continue;
            }

            $match = $availableStagiaires->first(function (\App\Models\Stagiaire $stagiaire) use ($user) {
                return $stagiaire->email
                    && strtolower(trim($stagiaire->email)) === strtolower(trim($user->email));
            });

            if ($match) {
                $summary['linked']++;
                $this->info("Link user #{$user->id} {$user->email} -> stagiaire #{$match->id} {$match->prenom} {$match->nom}");

                if (! $dryRun) {
                    $match->update(['user_id' => $user->id]);
                }

                $availableStagiaires->forget($availableStagiaires->search(fn (\App\Models\Stagiaire $item) => $item->id === $match->id));
                continue;
            }

            $summary['unmatched']++;
            $this->warn("No matching stagiaire found for user #{$user->id} {$user->email}");
        }
    };

    if ($dryRun) {
        $this->comment('Dry run mode: no database changes will be written.');
        $sync();
    } else {
        DB::transaction($sync);
    }

    $this->newLine();
    $this->table(
        ['Linked existing stagiaires', 'Skipped already linked', 'Unmatched users'],
        [[
            $summary['linked'],
            $summary['skipped'],
            $summary['unmatched'],
        ]]
    );
})->purpose('Attach existing role_id=3 users to stagiaire profiles by email without breaking current data.');

Artisan::command('stagiaires:link-user {userId : The user id with role_id=3} {stagiaireId : The stagiaire id to link}', function (int $userId, int $stagiaireId) {
    $user = User::where('role_id', 3)->find($userId);

    if (! $user) {
        $this->error("User #{$userId} introuvable ou non stagiaire.");
        return 1;
    }

    $existingLink = $user->stagiaire;
    if ($existingLink) {
        $this->error("User #{$userId} est deja lie au stagiaire #{$existingLink->id}.");
        return 1;
    }

    $stagiaire = \App\Models\Stagiaire::find($stagiaireId);

    if (! $stagiaire) {
        $this->error("Stagiaire #{$stagiaireId} introuvable.");
        return 1;
    }

    if ($stagiaire->user_id) {
        $this->error("Stagiaire #{$stagiaireId} est deja lie au user #{$stagiaire->user_id}.");
        return 1;
    }

    DB::transaction(function () use ($user, $stagiaire) {
        $stagiaire->update([
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    });

    $this->info("User #{$user->id} {$user->email} lie au stagiaire #{$stagiaire->id} {$stagiaire->prenom} {$stagiaire->nom}.");

    return 0;
})->purpose('Manually attach a specific student account to a specific stagiaire safely.');
