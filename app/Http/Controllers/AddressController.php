<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function store(Request $request)
    {
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

        return back()->with('success', 'Address added successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'house' => 'required|string',
            'street' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Update the address in the database
        $address = Address::findOrFail($id);
        $address->house = $request->input('house');
        $address->street = $request->input('street');
        $address->lat = $request->input('latitude');
        $address->lon = $request->input('longitude');
        $address->save();

        return redirect()->back()->with('success', 'Address updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $address = Address::findOrFail($id);
        $address->delete();

        return redirect()->back()->with('success', 'Address deleted successfully.');
    }

}
