<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StagiaireSpaceController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user()->load([
            'role',
            'stagiaire.groupe',
            'stagiaire.notes.module.groupe',
            'stagiaire.absences',
        ]);

        $stagiaire = $user->stagiaire;

        if (! $stagiaire) {
            return response()->json([
                'user' => $user,
                'stagiaire' => null,
                'stats' => [
                    'notes' => 0,
                    'absences' => 0,
                    'validated' => 0,
                    'retake' => 0,
                ],
                'notes_preview' => [],
                'absences_preview' => [],
            ]);
        }

        $notes = $stagiaire->notes->sortByDesc('updated_at')->values();
        $absences = $stagiaire->absences->sortByDesc('date_absence')->values();

        return response()->json([
            'user' => $user,
            'stagiaire' => $stagiaire,
            'stats' => [
                'notes' => $notes->count(),
                'absences' => $absences->count(),
                'validated' => $notes->where('note', '>=', 10)->count(),
                'retake' => $notes->where('note', '<', 10)->count(),
            ],
            'notes_preview' => $notes->take(6)->map(function ($note) {
                return [
                    'id' => $note->id,
                    'note' => $note->note,
                    'module' => $note->module?->nom_module,
                    'groupe' => $note->module?->groupe?->nom_groupe,
                ];
            })->values(),
            'absences_preview' => $absences->take(6)->map(function ($absence) {
                return [
                    'id' => $absence->id,
                    'date_absence' => $absence->date_absence,
                    'justifie' => $absence->justifie,
                    'raison' => $absence->raison,
                ];
            })->values(),
        ]);
    }

    public function notes(Request $request)
    {
        $user = $request->user()->load([
            'stagiaire.groupe',
            'stagiaire.notes.module.groupe',
        ]);

        return response()->json([
            'user' => $user,
            'stagiaire' => $user->stagiaire,
            'notes' => $user->stagiaire?->notes?->sortByDesc('updated_at')->values() ?? [],
        ]);
    }

    public function absences(Request $request)
    {
        $user = $request->user()->load([
            'stagiaire.groupe',
            'stagiaire.absences',
        ]);

        return response()->json([
            'user' => $user,
            'stagiaire' => $user->stagiaire,
            'absences' => $user->stagiaire?->absences?->sortByDesc('date_absence')->values() ?? [],
        ]);
    }
}
