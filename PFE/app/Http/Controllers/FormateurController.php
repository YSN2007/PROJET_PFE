<?php

namespace App\Http\Controllers;

use App\Models\Formateur;

class FormateurController extends Controller
{
    public function index()
    {
        return response()->json(
            Formateur::with('user')
                ->withCount('modules')
                ->orderBy('prenom')
                ->orderBy('nom')
                ->get()
        );
    }

    public function show($id)
    {
        return response()->json(
            Formateur::with(['user', 'modules.groupe'])
                ->findOrFail($id)
        );
    }
}
