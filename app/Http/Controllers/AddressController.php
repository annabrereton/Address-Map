<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AddressController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'house_id' => 'required|integer',
            'name' => 'required|string',
            'street' => 'required|string',
        ]);

        // Save the address to the database
        $address = new Address();
        $address->house_id = $request->input('house_id');
        $address->name = $request->input('name');
        $address->street = $request->input('street');
        $address->save();

        return back()->with('success', 'Address added successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
            'street' => 'required|string',
        ]);

        // Update the address in the database
        $address = Address::findOrFail($id);
        $address->name = $request->input('name');
        $address->street = $request->input('street');
        $address->save();

        return redirect()->back()->with('success', 'Address updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        Log::info('Deleting address with ID: ' . $id);

        $address = Address::findOrFail($id);
        $address->delete();

        return response()->json(['success' => 'Address deleted successfully.']);
//        return redirect()->back()->with('success', 'Address deleted successfully.');
    }

}
