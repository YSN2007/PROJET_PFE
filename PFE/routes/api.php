<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\FormateurAbsenceController;
use App\Http\Controllers\FormateurNoteController;
use App\Http\Controllers\FormateurSpaceController;
use App\Http\Controllers\StagiaireController;
use App\Http\Controllers\StagiaireSpaceController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\AbsenceController;
use App\Models\Stagiaire;
use App\Models\Groupe;
use App\Models\Module;
use App\Models\Absence;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    Route::middleware('admin')->group(function () {
        Route::post('/stagiaires/bulk-delete', [StagiaireController::class, 'bulkDelete']);
        Route::post('/stagiaires/bulk-update-groupe', [StagiaireController::class, 'bulkUpdateGroupe']);
        Route::apiResource('stagiaires', StagiaireController::class);
        Route::apiResource('formateurs', FormateurController::class)->only(['index', 'show']);
        Route::apiResource('modules', ModuleController::class);
        Route::get('/groupes/{id}/details', [GroupeController::class, 'details']);
        Route::apiResource('groupes', GroupeController::class);
        Route::get('/notes/stagiaire/{id}/average-procedure', [NoteController::class, 'averageByProcedure']);
        Route::apiResource('notes', NoteController::class);
        Route::apiResource('absences', AbsenceController::class);
        Route::get('/stats', function () {
            return response()->json([
                'stagiaires' => Stagiaire::count(),
                'groupes' => Groupe::count(),
                'modules' => Module::count(),
                'absences' => Absence::count(),
            ]);
        });
    });

    Route::middleware('formateur')->get('/formateur/dashboard', [FormateurSpaceController::class, 'dashboard']);
    Route::middleware('formateur')->get('/formateur/notes', [FormateurNoteController::class, 'index']);
    Route::middleware('formateur')->post('/formateur/notes', [FormateurNoteController::class, 'store']);
    Route::middleware('formateur')->put('/formateur/notes/{id}', [FormateurNoteController::class, 'update']);
    Route::middleware('formateur')->get('/formateur/absences', [FormateurAbsenceController::class, 'index']);
    Route::middleware('formateur')->post('/formateur/absences', [FormateurAbsenceController::class, 'store']);
    Route::middleware('formateur')->put('/formateur/absences/{id}', [FormateurAbsenceController::class, 'update']);

    Route::middleware('stagiaire')->get('/stagiaire/dashboard', [StagiaireSpaceController::class, 'dashboard']);
    Route::middleware('stagiaire')->get('/stagiaire/notes', [StagiaireSpaceController::class, 'notes']);
    Route::middleware('stagiaire')->get('/stagiaire/absences', [StagiaireSpaceController::class, 'absences']);
});

