<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Stagiaire;

class Absence extends Model
{
    use HasFactory;

    protected $table = 'absences';
    protected $fillable = [
        'date_absence',
        'justifie',
        'stagiaire_id',
        'raison',
    ];

    public function stagiaire(){
        return $this->belongsTo(Stagiaire::class);
    }
}
