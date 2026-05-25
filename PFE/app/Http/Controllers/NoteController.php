<?php
namespace App\Http\Controllers;

use App\Events\NoteCreated;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NoteController extends Controller
{
    public function index()
    {
        return response()->json(
            Note::with(['stagiaire', 'module'])->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'stagiaire_id' => 'required',
            'module_id' => 'required',
            'note' => 'required|numeric'
        ]);

        $note = DB::transaction(function () use ($request) {
            $note = Note::create($request->all());
            $note->load(['stagiaire', 'module']);

            return $note;
        });

        broadcast(new NoteCreated($note))->toOthers();

        return response()->json($note, 201);
    }

    public function show($id)
    {
        return response()->json(Note::with(['stagiaire', 'module'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $note = DB::transaction(function () use ($request, $id) {
            $note = Note::findOrFail($id);
            $note->update($request->all());
            $note->load(['stagiaire', 'module']);

            return $note;
        });

        return response()->json($note);
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            Note::destroy($id);
        });

        return response()->json(['message' => 'Deleted']);
    }

    public function averageByProcedure($id)
    {
        $result = DB::select('CALL get_stagiaire_average(?)', [$id]);

        if (empty($result)) {
            return response()->json([
                'message' => 'Stagiaire introuvable ou aucune donnee disponible.'
            ], 404);
        }

        return response()->json($result[0]);
    }
}

