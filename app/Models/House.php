<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class House extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'scale',
        'wall_colour',
        'door_colour',
        'window_style',
        'door_style',
        'roof_colour',
        'lat',
        'lon',
    ];

    public function addresses()
    {
        return $this->hasMany(Address::class, 'house_id');
    }
}
