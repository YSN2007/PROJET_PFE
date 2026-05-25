<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Module;
use App\Models\User;

class Formateur extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'specialite',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

}
