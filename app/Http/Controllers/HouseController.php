<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\House;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'scale' => 'required|integer',
            'wall_colour' => 'required|string',
            'door_colour' => 'required|string',
            'window_style' => 'required|string',
            'door_style' => 'required|string',
            'roof_colour' => 'required|string',
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
            'rotation' => 'nullable|numeric'
        ]);

        $house = House::create($request->all());

        return redirect('/')->with('success', 'House created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'scale' => 'required|integer',
            'wall_colour' => 'required|string',
            'door_colour' => 'required|string',
            'window_style' => 'required|string',
            'door_style' => 'required|string',
            'roof_colour' => 'required|string',
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
//            'rotation' => 'required|numeric',
        ]);

        // Update the address in the database
        $house = House::findOrFail($id);
        $house->scale = $request->input('scale');
        $house->wall_colour = $request->input('wall_colour');
        $house->door_colour = $request->input('door_colour');
        $house->window_style = $request->input('window_style');
        $house->door_style = $request->input('door_style');
        $house->roof_colour = $request->input('roof_colour');
        $house->lat = $request->input('lat');
        $house->lon = $request->input('lon');
//        $house->rotation = $request->input('rotation');
        $house->save();

        return redirect()->back()->with('success', 'House updated successfully.');
    }

    public function updateCoordinates(Request $request, $id)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
            'rotation' => 'required|numeric',
        ]);
        // dd($request->all());
        $house = House::findOrFail($id);
        $house->lat = $request->input('lat');
        $house->lon = $request->input('lon');
        $house->rotation = $request->input('rotation');
        $house->save();

        return response()->json([
            'message' => 'House coordinates updated successfully.',
            'house' => $house
        ]);
    }

    // public function updateCoordinates(Request $request, $id)
    // {
    //     $request->validate([
    //         'lat' => 'required|numeric',
    //         'lon' => 'required|numeric',
    //         'rotation' => 'required|numeric',
    //     ]);
    
    //     $house = House::findOrFail($id);
    //     $house->lat = $request->input('lat');
    //     $house->lon = $request->input('lon');
    
    //     // Normalize the rotation
    //     $rotation = $request->input('rotation');
    //     $normalizedRotation = $this->normalizeRotation($rotation);
    //     $house->rotation = $normalizedRotation;
    
    //     $house->save();
    
    //     return response()->json([
    //         'message' => 'House coordinates updated successfully.',
    //         'house' => $house
    //     ]);
    // }
    
    // // Helper function to normalize rotation
    // private function normalizeRotation($rotation)
    // {
    //     // Normalize the rotation to be within the range of 0 to 2π
    //     $normalized = fmod($rotation, 2 * M_PI); // fmod gives the remainder of the division
    //     if ($normalized < 0) {
    //         $normalized += 2 * M_PI; // Ensure it's positive
    //     }
    //     return $normalized;
    // }
}
