<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Module;
use App\Models\Stagiaire;
use Illuminate\Http\Request;

class FormateurAbsenceController extends Controller
{
    public function index(Request $request)
    {
        [$formateur, $modules, $stagiaires, $groupIds] = $this->resolveAccessData($request);

        $absences = $groupIds->isNotEmpty()
            ? Absence::with(['stagiaire.groupe'])
                ->whereHas('stagiaire', fn ($query) => $query->whereIn('groupe_id', $groupIds))
                ->orderByDesc('date_absence')
                ->get()
            : collect();

        return response()->json([
            'formateur' => $formateur,
            'modules' => $modules,
            'stagiaires' => $stagiaires,
            'absences' => $absences,
        ]);
    }

    public function store(Request $request)
    {
        [$formateur, $modules, $stagiaires, $groupIds] = $this->resolveAccessData($request);

        $validated = $request->validate([
            'stagiaire_id' => 'required|exists:stagiaires,id',
            'date_absence' => 'required|date',
            'justifie' => 'required|boolean',
            'raison' => 'nullable|string|max:255',
        ]);

        $stagiaire = $stagiaires->firstWhere('id', (int) $validated['stagiaire_id']);

        if (! $stagiaire) {
            return response()->json(['message' => 'Stagiaire non autorise pour ce formateur.'], 403);
        }

        $absence = Absence::create($validated);
        $absence->load(['stagiaire.groupe']);

        return response()->json($absence, 201);
    }

    public function update(Request $request, $id)
    {
        [$formateur, $modules, $stagiaires, $groupIds] = $this->resolveAccessData($request);

        $absence = Absence::with('stagiaire')->findOrFail($id);

        if (! $groupIds->contains((int) $absence->stagiaire?->groupe_id)) {
            return response()->json(['message' => 'Absence non autorisee pour ce formateur.'], 403);
        }

        $validated = $request->validate([
            'stagiaire_id' => 'required|exists:stagiaires,id',
            'date_absence' => 'required|date',
            'justifie' => 'required|boolean',
            'raison' => 'nullable|string|max:255',
        ]);

        $stagiaire = $stagiaires->firstWhere('id', (int) $validated['stagiaire_id']);

        if (! $stagiaire) {
            return response()->json(['message' => 'Stagiaire non autorise pour ce formateur.'], 403);
        }

        $absence->update($validated);
        $absence->load(['stagiaire.groupe']);

        return response()->json($absence);
    }

    private function resolveAccessData(Request $request): array
    {
        $user = $request->user()->load('formateur.modules');
        $formateur = $user->formateur;

        $modules = $formateur
            ? $formateur->modules()->with('groupe')->orderBy('nom_module')->get()
            : collect();

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
            }
        }

        $groupIds = $modules->pluck('groupe_id')->filter()->unique()->map(fn ($id) => (int) $id)->values();

        $stagiaires = $groupIds->isNotEmpty()
            ? Stagiaire::with('groupe')
                ->whereIn('groupe_id', $groupIds)
                ->orderBy('prenom')
                ->orderBy('nom')
                ->get()
            : collect();

        return [$formateur, $modules, $stagiaires, $groupIds];
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
