<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Module;
use App\Models\Note;
use App\Models\Stagiaire;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class FormateurSpaceController extends Controller
{
    public function dashboard(Request $request)
    {
        [$user, $formateur, $modules, $groupIds, $isFallbackSource] = $this->resolveAccessData($request);

        if (! $formateur && $modules->isEmpty()) {
            return response()->json([
                'user' => $user,
                'formateur' => null,
                'source' => 'empty',
                'stats' => [
                    'modules' => 0,
                    'stagiaires' => 0,
                    'notes' => 0,
                    'absences' => 0,
                ],
                'modules_preview' => [],
                'stagiaires_preview' => [],
            ]);
        }

        $moduleIds = $modules->pluck('id')->filter();

        $stagiairesQuery = Stagiaire::query()
            ->with('groupe')
            ->when($groupIds->isNotEmpty(), fn ($query) => $query->whereIn('groupe_id', $groupIds), fn ($query) => $query->whereRaw('1 = 0'));

        $stagiaires = (clone $stagiairesQuery)
            ->orderBy('prenom')
            ->orderBy('nom')
            ->get();

        $notesCount = $moduleIds->isNotEmpty()
            ? Note::whereIn('module_id', $moduleIds)->count()
            : 0;

        $absencesCount = $groupIds->isNotEmpty()
            ? Absence::whereHas('stagiaire', fn ($query) => $query->whereIn('groupe_id', $groupIds))->count()
            : 0;

        return response()->json([
            'user' => $user,
            'formateur' => $formateur,
            'source' => $isFallbackSource ? 'admin-local' : 'database',
            'stats' => [
                'modules' => $modules->count(),
                'stagiaires' => $stagiaires->count(),
                'notes' => $notesCount,
                'absences' => $absencesCount,
            ],
            'modules_preview' => $modules->take(6)->map(function ($module) {
                return [
                    'id' => $module->id,
                    'nom_module' => $module->nom_module,
                    'masse_horaire' => $module->masse_horaire,
                    'groupe' => $module->groupe?->nom_groupe,
                    'filiere' => $module->groupe?->filiere,
                ];
            })->values(),
            'stagiaires_preview' => $stagiaires->take(6)->map(function ($stagiaire) {
                return [
                    'id' => $stagiaire->id,
                    'nom_complet' => trim("{$stagiaire->prenom} {$stagiaire->nom}"),
                    'email' => $stagiaire->email,
                    'groupe' => $stagiaire->groupe?->nom_groupe,
                ];
            })->values(),
        ]);
    }

    private function resolveAccessData(Request $request): array
    {
        $user = $request->user()->load(['role', 'formateur']);
        $formateur = $user->formateur;

        $modules = $formateur
            ? $formateur->modules()->with('groupe')->orderBy('nom_module')->get()
            : collect();

        $isFallbackSource = false;

        if ($modules->isEmpty()) {
            [$fallbackModuleIds, $fallbackGroupIds] = $this->resolveRequestedIds($request);

            if ($fallbackModuleIds->isNotEmpty() || $fallbackGroupIds->isNotEmpty()) {
                $modules = Module::with('groupe')
                    ->when(
                        $fallbackModuleIds->isNotEmpty(),
                        fn ($query) => $query->whereIn('id', $fallbackModuleIds),
                        fn ($query) => $query->whereIn('groupe_id', $fallbackGroupIds)
                    )
                    ->orderBy('nom_module')
                    ->get();

                $isFallbackSource = $modules->isNotEmpty();
            }
        }

        $groupIds = $modules->pluck('groupe_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        return [$user, $formateur, $modules, $groupIds, $isFallbackSource];
    }

    private function resolveRequestedIds(Request $request): array
    {
        $moduleIds = collect($request->input('module_ids', []))
            ->map(fn ($id) => (int) $id)
            ->filter();

        $groupIds = collect($request->input('group_ids', []))
            ->map(fn ($id) => (int) $id)
            ->filter();

        return [$moduleIds, $groupIds];
    }
}
