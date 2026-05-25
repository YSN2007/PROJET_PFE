@extends('layouts.app')

@section('title', 'EduManager - Page Blade Demo')

@section('page_title', 'Page Blade de démonstration')

@section('page_subtitle', 'Exemple simple d’utilisation des directives @section et @yield')

@section('content')
    <span class="blade-meta">Laravel Blade Layout</span>

    <div class="blade-section">
        <h2>Objectif</h2>
        <p>
            Cette page a été ajoutée afin de démontrer l’utilisation des directives Blade
            <strong>@section</strong> et <strong>@yield</strong> dans le projet, sans modifier
            la logique principale de l’application React.
        </p>
    </div>

    <div class="blade-section">
        <h2>Intégration</h2>
        <p>
            Le layout principal est défini dans <strong>resources/views/layouts/app.blade.php</strong>,
            tandis que cette page enfant hérite de ce layout à travers <strong>@extends</strong>
            et remplit les zones dynamiques avec <strong>@section</strong>.
        </p>
    </div>
@endsection
