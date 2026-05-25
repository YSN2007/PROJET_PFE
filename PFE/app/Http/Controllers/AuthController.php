<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeUserMail;
use App\Models\Formateur;
use App\Models\Stagiaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        if ((int) $request->role_id === 1) {
            return response()->json([
                'message' => "La creation d'un compte admin depuis l'inscription publique n'est pas autorisee."
            ], 403);
        }

        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role_id' => 'required|exists:roles,id'
        ]);

        $this->assertRegisterRoleMatchesExistingProfile(
            $request->name,
            $request->email,
            (int) $request->role_id
        );

        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id
            ]);

            if ((int) $request->role_id === 2) {
                $linkedFormateur = $this->findMatchingFormateurByFullName($request->name);

                if ($linkedFormateur && ! $linkedFormateur->user_id) {
                    $linkedFormateur->update([
                        'user_id' => $user->id,
                    ]);
                } else {
                    [$prenom, $nom] = $this->splitName($request->name);

                    Formateur::create([
                        'user_id' => $user->id,
                        'prenom' => $prenom,
                        'nom' => $nom,
                        'specialite' => 'Non renseignee',
                    ]);
                }
            }

            if ((int) $request->role_id === 3) {
                $stagiaire = $this->findMatchingStagiaireByIdentity($request->name, $request->email);

                if ($stagiaire) {
                    $stagiaire->update([
                        'user_id' => $user->id,
                    ]);
                }
            }

            return $user;
        });

        $user->load(['role', 'formateur', 'stagiaire.groupe']);

        try {
            Mail::to($user->email)->send(new WelcomeUserMail($user));
        } catch (\Throwable $exception) {
            Log::warning('Welcome email could not be sent after registration.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    private function splitName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        $prenom = $parts[0] ?? $fullName;
        $nom = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : $prenom;

        return [$prenom, $nom];
    }

    private function assertRegisterRoleMatchesExistingProfile(string $fullName, string $email, int $roleId): void
    {
        $matchingFormateur = $this->findMatchingFormateurByFullName($fullName);
        $matchingStagiaire = $this->findMatchingStagiaireByFullName($fullName, false);

        if ($roleId === 2) {
            if (! $matchingFormateur) {
                if ($matchingStagiaire) {
                    throw ValidationException::withMessages([
                        'name' => "Ce compte n'est pas un formateur.",
                    ]);
                }

                throw ValidationException::withMessages([
                    'name' => "Ce formateur n'existe pas.",
                ]);
            }

            if ($matchingFormateur->user_id) {
                throw ValidationException::withMessages([
                    'name' => 'Ce compte existe deja, veuillez vous connecter.',
                ]);
            }

            return;
        }

        if ($roleId === 3) {
            $matchingStagiaireByIdentity = $this->findMatchingStagiaireByIdentity($fullName, $email, false);
            $matchingStagiaireByEmail = $this->findMatchingStagiaireByEmail($email, false);

            if (! $matchingStagiaireByIdentity) {
                if ($matchingFormateur) {
                    throw ValidationException::withMessages([
                        'name' => "Ce compte n'est pas un stagiaire.",
                    ]);
                }

                if ($matchingStagiaire && ! $matchingStagiaireByEmail) {
                    throw ValidationException::withMessages([
                        'email' => "L'adresse email ne correspond pas a ce stagiaire.",
                    ]);
                }

                if (! $matchingStagiaire && $matchingStagiaireByEmail) {
                    throw ValidationException::withMessages([
                        'name' => "Le nom complet ne correspond pas a cet email stagiaire.",
                    ]);
                }

                if ($matchingStagiaire && $matchingStagiaireByEmail) {
                    throw ValidationException::withMessages([
                        'name' => "Le nom complet et l'adresse email ne correspondent pas au meme stagiaire.",
                    ]);
                }

                throw ValidationException::withMessages([
                    'name' => "Ce stagiaire n'existe pas.",
                ]);
            }

            if ($matchingStagiaireByIdentity->user_id) {
                throw ValidationException::withMessages([
                    'name' => 'Ce compte existe deja, veuillez vous connecter.',
                ]);
            }

            return;
        }

    }

    private function normalizePersonName(?string $value): string
    {
        $value = Str::upper(trim((string) $value));
        $value = preg_replace('/\s+/u', ' ', $value) ?: $value;

        return $value;
    }

    private function findMatchingFormateurByFullName(string $fullName): ?Formateur
    {
        $normalizedFullName = $this->normalizePersonName($fullName);

        return Formateur::query()
            ->orderByRaw('CASE WHEN user_id IS NULL THEN 0 ELSE 1 END')
            ->get()
            ->first(function (Formateur $formateur) use ($normalizedFullName) {
                $combined = trim("{$formateur->prenom} {$formateur->nom}");
                $single = $formateur->prenom ?: $formateur->nom;

                return $this->normalizePersonName($combined) === $normalizedFullName
                    || $this->normalizePersonName($single) === $normalizedFullName;
            });
    }

    private function findMatchingStagiaireByFullName(string $fullName, bool $onlyUnlinked = true): ?Stagiaire
    {
        $normalizedFullName = $this->normalizePersonName($fullName);

        return Stagiaire::query()
            ->when($onlyUnlinked, fn ($query) => $query->whereNull('user_id'))
            ->get()
            ->first(function (Stagiaire $stagiaire) use ($normalizedFullName) {
                $prenomNom = trim("{$stagiaire->prenom} {$stagiaire->nom}");
                $nomPrenom = trim("{$stagiaire->nom} {$stagiaire->prenom}");

                return $this->normalizePersonName($prenomNom) === $normalizedFullName
                    || $this->normalizePersonName($nomPrenom) === $normalizedFullName;
            });
    }

    private function findMatchingStagiaireByEmail(string $email, bool $onlyUnlinked = true): ?Stagiaire
    {
        return Stagiaire::query()
            ->when($onlyUnlinked, fn ($query) => $query->whereNull('user_id'))
            ->whereRaw('LOWER(email) = ?', [Str::lower(trim($email))])
            ->first();
    }

    private function findMatchingStagiaireByIdentity(string $fullName, string $email, bool $onlyUnlinked = true): ?Stagiaire
    {
        $matchingStagiaire = $this->findMatchingStagiaireByFullName($fullName, $onlyUnlinked);

        if (! $matchingStagiaire) {
            return null;
        }

        return Str::lower(trim((string) $matchingStagiaire->email)) === Str::lower(trim($email))
            ? $matchingStagiaire
            : null;
    }


    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user->load(['role', 'formateur', 'stagiaire.groupe']);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }


    public function profile(Request $request)
    {
        return response()->json($request->user()->load(['role', 'formateur', 'stagiaire.groupe']));
    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
