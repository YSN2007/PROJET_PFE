<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Groupe;
use App\Models\Absence;
use App\Models\Note;
use App\Models\User;


class Stagiaire extends Model
{
    use HasFactory;
    
    protected $table = 'stagiaires';
    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'email',
        'groupe_id',
        
    ];
    public function groupe(){
    return $this->belongsTo(Groupe::class);
    }

    public function absences(){
        return $this->hasMany(Absence::class);
    }

    public function notes(){
        return $this->hasMany(Note::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
