<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index()
    {
        $addresses = Address::all();

        return view('welcome', compact('addresses'));
    }


    public function store(Request $request)
    {
//        dd($request);
        $request->validate([
            'house' => 'required|string',
            'street' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Save the address to the database
        $address = new Address();
        $address->house = $request->input('house');
        $address->street = $request->input('street');
        $address->lat = $request->input('latitude');
        $address->lon = $request->input('longitude');
        $address->save();

        // Return a JSON response
//        return response()->json([
//            'success' => true,
//            'house' => $address,
//        ]);
        return back()->with('success', 'Address added successfully.');
    }

}
