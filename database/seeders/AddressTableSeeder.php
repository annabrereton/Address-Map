<?php

namespace Database\Seeders;

use App\Models\Address;
use Illuminate\Database\Seeder;

class AddressTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $addressData = [
            // Use the new house IDs from the HouseTableSeeder
            [ "house_id" => 1, "name" => "1", "street" => "Oak Street" ],
            [ "house_id" => 2, "name" => "2", "street" => "Oak Street" ],
            [ "house_id" => 3, "name" => "3", "street" => "Oak Street" ],
            [ "house_id" => 4, "name" => "4", "street" => "Oak Street" ],
            [ "house_id" => 5, "name" => "5", "street" => "Oak Street" ],
            [ "house_id" => 6, "name" => "6", "street" => "Oak Street" ],
            [ "house_id" => 7, "name" => "7", "street" => "Oak Street" ],
            [ "house_id" => 7, "name" => "7b", "street" => "Oak Street" ],
            [ "house_id" => 8, "name" => "8", "street" => "Oak Street" ],
            [ "house_id" => 9, "name" => "9", "street" => "Oak Street" ],
            [ "house_id" => 10, "name" => "10", "street" => "Oak Street" ],

            [ "house_id" => 11, "name" => "11", "street" => "Pine Street" ],
            [ "house_id" => 12, "name" => "12", "street" => "Pine Street" ],
            [ "house_id" => 13, "name" => "13", "street" => "Pine Street" ],

            [ "house_id" => 14, "name" => "14", "street" => "Maple Street" ],
            [ "house_id" => 15, "name" => "15", "street" => "Maple Street" ],
            [ "house_id" => 16, "name" => "16", "street" => "Maple Street" ],
            [ "house_id" => 17, "name" => "17", "street" => "Maple Street" ],
            [ "house_id" => 18, "name" => "18", "street" => "Maple Street" ],
            [ "house_id" => 19, "name" => "19", "street" => "Maple Street" ],
            [ "house_id" => 20, "name" => "20", "street" => "Maple Street" ],
            [ "house_id" => 21, "name" => "21", "street" => "Maple Street" ],
            [ "house_id" => 22, "name" => "22", "street" => "Maple Street" ],
            [ "house_id" => 23, "name" => "23", "street" => "Maple Street" ],
            [ "house_id" => 24, "name" => "24", "street" => "Maple Street" ],
        ];

        foreach ($addressData as $address) {
            Address::create($address);
        }
    }
}
