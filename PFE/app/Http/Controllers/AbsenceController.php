<?php

namespace App\Http\Controllers;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index()
    {
        return response()->json(
            Absence::with(['stagiaire.groupe'])
                ->orderByDesc('updated_at')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'stagiaire_id' => 'required',
            'date_absence' => 'required|date',
            'justifie' => 'required|boolean',
            'raison' => 'nullable|string|max:255',
        ]);

        $absence = Absence::create($validated);
        $absence->load(['stagiaire.groupe']);

        return response()->json($absence, 201);
    }

    public function show($id)
    {
        return response()->json(
            Absence::with(['stagiaire.groupe'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $absence = Absence::findOrFail($id);

        $validated = $request->validate([
            'stagiaire_id' => 'required',
            'date_absence' => 'required|date',
            'justifie' => 'required|boolean',
            'raison' => 'nullable|string|max:255',
        ]);

        $absence->update($validated);
        $absence->load(['stagiaire.groupe']);

        return response()->json($absence);
    }

    public function destroy($id)
    {
        Absence::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
