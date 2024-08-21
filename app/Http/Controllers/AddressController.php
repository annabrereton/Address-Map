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

    public function edit($id)
    {
        $address = Address::findOrFail($id);

        return view('edit_address', compact('address'));
    }


    public function update(Request $request, $id)
    {
//        dd($request);
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
