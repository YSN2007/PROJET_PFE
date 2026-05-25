<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Formateur;
use App\Models\Note;

class Module extends Model
{
    use HasFactory;
    
    protected $table = 'modules';
    protected $fillable = [
        'nom_module',
        'masse_horaire',
        'groupe_id',
        'formateur_id',
    ];

    public function notes(){
        return $this->hasMany(Note::class);
    }
    public function groupe(){
        return $this->belongsTo(Groupe::class);
    }

    public function formateur()
    {
        return $this->belongsTo(Formateur::class);
    }
    
}
