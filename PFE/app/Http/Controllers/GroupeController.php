<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\Groupe;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupeController extends Controller
{
    public function index()
    {
        return Groupe::withCount('stagiaires')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom_groupe' => 'required',
            'filiere' => 'required',
        ]);

        $groupe = Groupe::create([
            'nom_groupe' => $request->nom_groupe,
            'filiere' => $request->filiere,
        ]);

        return response()->json($groupe, 201);
    }

    public function show($id)
    {
        $groupe = Groupe::find($id);

        if (!$groupe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($groupe);
    }
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:groupes,id',
        ]);
        $groupes = Groupe::whereIn('id', $validated['ids'])->get();
        foreach ($groupes as $groupe) {
            $groupe->stagiaires()->delete();
            $groupe->modules()->delete();
            $groupe->delete();
        }
        return response()->json([
            'message' => 'Deleted successfully',
        ]);
    }
    public function details($id)
    {
        $groupe = Groupe::with(['stagiaires', 'modules'])->find($id);

        if (!$groupe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $stagiairesCount = $groupe->stagiaires()->count();
        $modules = $groupe->modules()->pluck('nom_module')->filter()->values();
        $stagiaireIds = $groupe->stagiaires->pluck('id');

        $average = $stagiaireIds->isNotEmpty()
            ? round((float) Note::whereIn('stagiaire_id', $stagiaireIds)->avg('note'), 1)
            : 0;

        $totalAbsences = $stagiaireIds->isNotEmpty()
            ? Absence::whereIn('stagiaire_id', $stagiaireIds)->count()
            : 0;

        $absenceRate = $stagiairesCount > 0
            ? round(($totalAbsences / $stagiairesCount) * 100, 1)
            : 0;

        $top = null;

        if ($stagiaireIds->isNotEmpty()) {
            $top = Note::select('stagiaire_id', DB::raw('AVG(note) as average_note'))
                ->whereIn('stagiaire_id', $stagiaireIds)
                ->groupBy('stagiaire_id')
                ->with('stagiaire')
                ->orderByDesc('average_note')
                ->first();
        }

        return response()->json([
            'groupe' => $groupe,
            'stagiaires_count' => $stagiairesCount,
            'modules' => $modules,
            'moyenne' => $average,
            'absence_rate' => $absenceRate,
            'top_stagiaire' => $top && $top->stagiaire ? [
                'id' => $top->stagiaire->id,
                'nom' => $top->stagiaire->nom,
                'prenom' => $top->stagiaire->prenom,
                'average' => round((float) $top->average_note, 1),
            ] : null,
        ]);
    }

    public function update(Request $request, $id)
    {
        $groupe = Groupe::find($id);

        if (!$groupe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $groupe->update($request->all());

        return response()->json($groupe);
    }

    public function destroy($id)
    {
        try {
            $groupe = Groupe::findOrFail($id);

            $groupe->stagiaires()->delete();
            $groupe->modules()->delete();
            $groupe->delete();

            return response()->json([
                'message' => 'Deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

