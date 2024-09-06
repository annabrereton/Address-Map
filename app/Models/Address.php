<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'house_id',
        'name',
        'street',
    ];

    public function house()
    {
        return $this->belongsTo(House::class, 'house_id');
    }
}
