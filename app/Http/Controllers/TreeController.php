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
            'scale' => 'required|integer|between:1,8',
            'leaf_colour' => 'nullable|string',
            'trunk_colour' => 'nullable|string',
        ]);

        $tree = Tree::create([
            'lat' => $validated['lat'],
            'lon' => $validated['lon'],
            'scale' => $validated['scale'],
            'leaf_colour' => '#00FF00',
            'trunk_colour' => '#8B4513',
        ]);

        return back()->with('success', 'Tree added successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'scale' => 'required|integer|between:1,8',
            'leaf_colour' => 'nullable|string',
            'trunk_colour' => 'nullable|string',
        ]);

        // Update the tree in the database
        $tree = Tree::findOrFail($id);
        $tree->lat = $request->input('latitude');
        $tree->lon = $request->input('longitude');
        $tree->scale = $request->input('scale');
        $tree->leaf_colour = $request->input('leaf_colour');
        $tree->trunk_colour = $request->input('trunk_colour');

        $tree->save();

        return redirect()->back()->with('success', 'Tree updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $tree = Tree::findOrFail($id);
        $tree->delete();

        return redirect()->back()->with('success', 'Tree deleted successfully.');
    }
}
