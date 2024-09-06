<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\House;
use App\Models\Tree;

class HomeController
{
    public function home()
    {
//        $addresses = Address::all();
        $trees = Tree::all();
        $houses = House::with('addresses')->get();

        $housesWithAddresses = $houses->map(function ($house) {
            return [
                'id' => $house->id,
                'lat' => $house->lat,
                'lon' => $house->lon,
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
//dd($housesWithAddresses);
        return view('welcome', ['houses' => $housesWithAddresses, 'trees' => $trees]);
    }
}
