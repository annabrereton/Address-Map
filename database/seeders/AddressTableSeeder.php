<?php

namespace Database\Seeders;

use App\Models\Address;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddressTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $addressData = [
            [ "house" => "1", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.3 ],
            [ "house" => "3", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.35 ],
            [ "house" => "5", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.4 ],
            [ "house" => "7", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.45 ],
            [ "house" => "9", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.5 ],
            [ "house" => "11", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.55 ],
            [ "house" => "13", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.7 ],
            [ "house" => "15", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.75 ],
            [ "house" => "17", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.8 ],
            [ "house" => "19", "street" => "Oak Street", "lat" => 0.7, "lon" => 0.85 ],

            [ "house" => "2", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.3 ],
            [ "house" => "4", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.35 ],
            [ "house" => "6", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.4 ],
            [ "house" => "8", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.45 ],
            [ "house" => "10", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.5 ],
            [ "house" => "12", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.55 ],
            [ "house" => "14", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.6 ],
            [ "house" => "16", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.65 ],
            [ "house" => "18", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.7 ],
            [ "house" => "20", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.75 ],
            [ "house" => "22", "street" => "Oak Street", "lat" => 0.55, "lon" => 0.8 ],

            [ "house" => "1", "street" => "Pine Street", "lat" => 0.75, "lon" => 0.55 ],
            [ "house" => "3", "street" => "Pine Street", "lat" => 0.8, "lon" => 0.55 ],
            [ "house" => "5", "street" => "Pine Street", "lat" => 0.85, "lon" => 0.55 ],

            [ "house" => "2", "street" => "Pine Street", "lat" => 0.75, "lon" => 0.7 ],
            [ "house" => "4", "street" => "Pine Street", "lat" => 0.8, "lon" => 0.7 ],
            [ "house" => "6", "street" => "Pine Street", "lat" => 0.85, "lon" => 0.7 ],

            [ "house" => "1", "street" => "Maple Street", "lat" => 0.85, "lon" => 0.3 ],
            [ "house" => "3", "street" => "Maple Street", "lat" => 0.85, "lon" => 0.35 ],
            [ "house" => "5", "street" => "Maple Street", "lat" => 0.85, "lon" => 0.4 ],
            [ "house" => "7", "street" => "Maple Street", "lat" => 0.85, "lon" => 0.45 ],
            [ "house" => "9", "street" => "Maple Street", "lat" => 0.85, "lon" => 0.5 ],
            [ "house" => "11", "street" => "Maple Street", "lat" => 0.85, "lon" => 0.75 ],
            [ "house" => "13", "street" => "Maple Street", "lat" => 0.85, "lon" => 0.8 ],

            [ "house" => "7", "street" => "Cedar Street", "lat" => 0.55, "lon" => 0.85 ],
            [ "house" => "8", "street" => "Cedar Street", "lat" => 0.5, "lon" => 0.85 ],
            [ "house" => "9", "street" => "Cedar Street", "lat" => 0.45, "lon" => 0.85 ],
            [ "house" => "10", "street" => "Cedar Street", "lat" => 0.4, "lon" => 0.85 ],
            [ "house" => "11", "street" => "Cedar Street", "lat" => 0.35, "lon" => 0.85 ],
            [ "house" => "12", "street" => "Cedar Street", "lat" => 0.3, "lon" => 0.85 ],

            [ "house" => "1", "street" => "Elm Street", "lat" => 0.3, "lon" => 0.5 ],
            [ "house" => "3", "street" => "Elm Street", "lat" => 0.35, "lon" => 0.05 ],
            [ "house" => "5", "street" => "Elm Street", "lat" => 0.4, "lon" => 0.05 ],
            [ "house" => "7", "street" => "Elm Street", "lat" => 0.45, "lon" => 0.05 ],
            [ "house" => "9", "street" => "Elm Street", "lat" => 0.5, "lon" => 0.05 ],
            [ "house" => "11", "street" => "Elm Street", "lat" => 0.55, "lon" => 0.05 ],
            [ "house" => "13", "street" => "Elm Street", "lat" => 0.6, "lon" => 0.05 ],
            [ "house" => "15", "street" => "Elm Street", "lat" => 0.65, "lon" => 0.05 ],

            [ "house" => "2", "street" => "Elm Street", "lat" => 0.3, "lon" => 0.25 ],
            [ "house" => "4", "street" => "Elm Street", "lat" => 0.35, "lon" => 0.25 ],
            [ "house" => "6", "street" => "Elm Street", "lat" => 0.4, "lon" => 0.25 ],
            [ "house" => "8", "street" => "Elm Street", "lat" => 0.45, "lon" => 0.25 ],
            [ "house" => "10", "street" => "Elm Street", "lat" => 0.5, "lon" => 0.25 ],
            [ "house" => "12", "street" => "Elm Street", "lat" => 0.55, "lon" => 0.25 ],
            [ "house" => "14", "street" => "Elm Street", "lat" => 0.7, "lon" => 0.25 ],
            [ "house" => "16", "street" => "Elm Street", "lat" => 0.75, "lon" => 0.25 ],
            [ "house" => "18", "street" => "Elm Street", "lat" => 0.8, "lon" => 0.25 ],
            [ "house" => "20", "street" => "Elm Street", "lat" => 0.85, "lon" => 0.25 ],

            [ "house" => "1", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.3 ],
            [ "house" => "3", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.35 ],
            [ "house" => "5", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.4 ],
            [ "house" => "7", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.45 ],
            [ "house" => "9", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.5 ],
            [ "house" => "11", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.55 ],
            [ "house" => "13", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.6 ],
            [ "house" => "15", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.65 ],
            [ "house" => "17", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.7 ],
            [ "house" => "19", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.75 ],
            [ "house" => "21", "street" => "Birch Street", "lat" => 0.3, "lon" => 0.8 ],

            [ "house" => "2", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.3 ],
            [ "house" => "4", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.35 ],
            [ "house" => "6", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.4 ],
            [ "house" => "8", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.45 ],
            [ "house" => "10", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.5 ],
            [ "house" => "12", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.55 ],
            [ "house" => "14", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.6 ],
            [ "house" => "16", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.65 ],
            [ "house" => "18", "street" => "Birch Street", "lat" => 0.15, "lon" => 0.7 ],
        ];

        foreach ($addressData as $address) {
            Address::create($address);
        }
    }
}
