<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Module;
use App\Models\Stagiaire;
use Illuminate\Http\Request;

class FormateurNoteController extends Controller
{
    public function index(Request $request)
    {
        [$formateur, $modules, $moduleIds, $stagiaires] = $this->resolveAccessData($request);

        $notes = $moduleIds->isNotEmpty()
            ? Note::with(['stagiaire.groupe', 'module.groupe'])
                ->whereIn('module_id', $moduleIds)
                ->orderByDesc('updated_at')
                ->get()
            : collect();

        return response()->json([
            'formateur' => $formateur,
            'modules' => $modules,
            'stagiaires' => $stagiaires,
            'notes' => $notes,
        ]);
    }

    public function store(Request $request)
    {
        [$formateur, $modules, $moduleIds, $stagiaires] = $this->resolveAccessData($request);

        $validated = $request->validate([
            'stagiaire_id' => 'required|exists:stagiaires,id',
            'module_id' => 'required|exists:modules,id',
            'note' => 'required|numeric|min:0|max:20',
        ]);

        if (! $moduleIds->contains((int) $validated['module_id'])) {
            return response()->json(['message' => 'Module non autorise pour ce formateur.'], 403);
        }

        $stagiaire = $stagiaires->firstWhere('id', (int) $validated['stagiaire_id']);

        if (! $stagiaire) {
            return response()->json(['message' => 'Stagiaire non autorise pour ce formateur.'], 403);
        }

        $module = $modules->firstWhere('id', (int) $validated['module_id']);

        if (! $module || (int) $stagiaire->groupe_id !== (int) $module->groupe_id) {
            return response()->json(['message' => 'Le stagiaire ne correspond pas au groupe de ce module.'], 422);
        }

        $note = Note::updateOrCreate(
            [
                'stagiaire_id' => $validated['stagiaire_id'],
                'module_id' => $validated['module_id'],
            ],
            [
                'note' => $validated['note'],
            ]
        );

        $note->load(['stagiaire.groupe', 'module.groupe']);

        return response()->json($note, 201);
    }

    public function update(Request $request, $id)
    {
        [$formateur, $modules, $moduleIds, $stagiaires] = $this->resolveAccessData($request);

        $note = Note::with(['stagiaire', 'module'])->findOrFail($id);

        if (! $moduleIds->contains((int) $note->module_id)) {
            return response()->json(['message' => 'Note non autorisee pour ce formateur.'], 403);
        }

        $validated = $request->validate([
            'note' => 'required|numeric|min:0|max:20',
        ]);

        $note->update([
            'note' => $validated['note'],
        ]);

        $note->load(['stagiaire.groupe', 'module.groupe']);

        return response()->json($note);
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

        $moduleIds = $modules->pluck('id')->map(fn ($id) => (int) $id)->values();
        $groupIds = $modules->pluck('groupe_id')->filter()->unique()->values();

        $stagiaires = $groupIds->isNotEmpty()
            ? Stagiaire::with('groupe')
                ->whereIn('groupe_id', $groupIds)
                ->orderBy('prenom')
                ->orderBy('nom')
                ->get()
            : collect();

        return [$formateur, $modules, $moduleIds, $stagiaires];
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
