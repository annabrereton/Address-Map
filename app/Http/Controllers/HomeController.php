<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\House;
use App\Models\Tree;

class HomeController extends Controller
{
    public function home()
    {
        return view('welcome');
    }

    public function getHouses()
    {
        // This is the new API endpoint that returns houses data as JSON
        $houses = House::with('addresses')->get();

        // Map the houses with their addresses
        $housesWithAddresses = $houses->map(function ($house) {
            return [
                'id' => $house->id,
                'lat' => $house->lat,
                'lon' => $house->lon,
                'rotation' => $house->rotation,
                'scale' => $house->scale,
                'wallColour' => $house->wall_colour,
                'doorColour' => $house->door_colour,
                'windowStyle' => $house->window_style,
                'doorStyle' => $house->door_style,
                'roofColour' => $house->roof_colour,
                'addresses' => $house->addresses->map(function ($address) {
                    return [
                        'id' => $address->id,
                        'house_id' => $address->house_id,
                        'name' => $address->name,
                        'street' => $address->street,
                    ];
                })->toArray()
            ];
        });

        return response()->json($housesWithAddresses);
    }

    public function getTrees() {

        $trees = Tree::all();

        return response()->json($trees);
    }
}
