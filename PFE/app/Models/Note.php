<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Stagiaire;
use App\Models\Module;



class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'note',
        'stagiaire_id',
        'module_id',
    ];

    public function stagiaire(){
        return $this->belongsTo(Stagiaire::class);
    }
    
    public function module(){
        return $this->belongsTo(Module::class);
    }
}
