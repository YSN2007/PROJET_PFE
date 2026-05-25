<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Stagiaire;

class Groupe extends Model
{
    use HasFactory;
    
    protected $table = 'groupes';
    
    protected $fillable = [
        'nom_groupe',
        'filiere',
    ];
    public function stagiaires(){
        return $this->hasMany(Stagiaire::class);
    }
    public function modules(){
        return $this->hasMany(Module::class);
    }
}
