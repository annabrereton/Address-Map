<?php

namespace App\Http\Controllers;

use App\Models\Tree;
use Illuminate\Http\Request;

class TreeController extends Controller
{
    // Store a new tree
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
            'scale' => 'required|integer',
            'leaf_colour' => 'nullable|string',
            'trunk_colour' => 'nullable|string',
        ]);

        $tree = Tree::create([
            'lat' => $validated['lat'],
            'lon' => $validated['lon'],
            'scale' => $validated['scale'],
        ]);

        return back()->with('success', 'Tree added successfully.');
    }
}
