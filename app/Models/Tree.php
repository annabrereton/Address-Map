<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tree extends Model
{
    use SoftDeletes;


    protected $fillable = [
        'lat',
        'lon',
        'scale',
        'leaf_colour',
        'trunk_colour'
    ];

    function integerToScale($integer) {
        $mapping = [
            1 => 0.2,
            2 => 0.4,
            3 => 0.5,
            4 => 0.6,
            5 => 0.7,
            6 => 0.8,
            7 => 0.9,
            8 => 1.0
        ];

        return isset($mapping[$integer]) ? $mapping[$integer] : 0.9; // Default scale if not found
    }
}
