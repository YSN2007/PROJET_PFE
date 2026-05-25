<?php

namespace App\Http\Controllers;

use App\Models\Stagiaire;
use Illuminate\Http\Request;

class StagiaireController extends Controller
{
    public function index(Request $request)
    {
        if ($request->groupe) {
            return Stagiaire::where('groupe_id', $request->groupe)->get();
        }

        return Stagiaire::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required',
            'prenom' => 'required',
            'email' => 'required|email|unique:stagiaires',
            'groupe_id' => 'required'
        ]);

        $stagiaire = Stagiaire::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'groupe_id' => $request->groupe_id,
        ]);

        return response()->json($stagiaire, 201);
    }

    public function show($id)
    {
        $stagiaire = Stagiaire::with(['groupe', 'notes.module'])->find($id);

        if (! $stagiaire) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json([
            'stagiaire' => $stagiaire,
            'groupe' => $stagiaire->groupe,
            'notes' => $stagiaire->notes,
            'absences' => $stagiaire->absences()->count(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $stagiaire = Stagiaire::find($id);

        if (! $stagiaire) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $request->validate([
            'nom' => 'required',
            'prenom' => 'required',
            'email' => 'required|email|unique:stagiaires,email,' . $id,
            'groupe_id' => 'required'
        ]);

        $stagiaire->update([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'groupe_id' => $request->groupe_id,
        ]);

        return response()->json($stagiaire);
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:stagiaires,id',
        ]);

        Stagiaire::whereIn('id', $validated['ids'])->delete();

        return response()->json([
            'message' => 'Bulk delete successful',
        ]);
    }

    public function bulkUpdateGroupe(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:stagiaires,id',
            'groupe_id' => 'required|integer|exists:groupes,id',
        ]);

        Stagiaire::whereIn('id', $validated['ids'])
            ->update(['groupe_id' => $validated['groupe_id']]);

        return response()->json([
            'message' => 'Bulk group update successful',
        ]);
    }

    public function destroy($id)
    {
        $stagiaire = Stagiaire::find($id);

        if (! $stagiaire) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $stagiaire->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}
