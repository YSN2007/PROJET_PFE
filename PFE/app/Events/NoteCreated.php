<?php

namespace App\Events;

use App\Models\Note;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public string $stagiaire_name;
    public string $module_name;
    public float|int $note_value;

    public function __construct(Note $note)
    {
        $this->stagiaire_name = trim(($note->stagiaire->nom ?? '') . ' ' . ($note->stagiaire->prenom ?? ''));
        $this->module_name = $note->module->nom_module ?? '';
        $this->note_value = $note->note;
    }

    public function broadcastOn(): array
    {
        return [new Channel('notes')];
    }

    public function broadcastAs(): string
    {
        return 'NoteCreated';
    }

    public function broadcastWith(): array
    {
        return [
            'stagiaire_name' => $this->stagiaire_name,
            'module_name' => $this->module_name,
            'note_value' => $this->note_value,
        ];
    }
}
