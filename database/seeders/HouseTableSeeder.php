<?php

namespace Database\Seeders;

use App\Models\House;
use Illuminate\Database\Seeder;

class HouseTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $houseData = [
            [ "lat" => 0.7, "lon" => 0.3, "scale" => 6, "wall_colour" => "#0000ff", "door_colour" => "#ff0000", "window_style" => "rectangular", "door_style" => "fancy", "roof_colour" => "#202020" ],
            [ "lat" => 0.55, "lon" => 0.3, "scale" => 2, "wall_colour" => "#0000ff", "door_colour" => "#00ff00", "window_style" => "circular", "door_style" => "simple", "roof_colour" => "#303030" ],
            [ "lat" => 0.7, "lon" => 0.35, "scale" => 4, "wall_colour" => "##b0b0b0", "door_colour" => "#0000ff", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.35, "scale" => 6, "wall_colour" => "#0000ff", "door_colour" => "#ff9900", "window_style" => "rectangular", "door_style" => "fancy", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.7, "lon" => 0.4, "scale" => 6, "wall_colour" => "#0000ff", "door_colour" => "#ff0000", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.4, "scale" => 3, "wall_colour" => "##b0b0b0", "door_colour" => "#00ff00", "window_style" => "circular", "door_style" => "fancy", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.7, "lon" => 0.45, "scale" => 5, "wall_colour" => "##b0b0b0", "door_colour" => "#0000ff", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#808080" ],
            [ "lat" => 0.55, "lon" => 0.45, "scale" => 3, "wall_colour" => "##d0d0d0", "door_colour" => "#ff9900", "window_style" => "rectangular", "door_style" => "fancy", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.7, "lon" => 0.5, "scale" => 4, "wall_colour" => "##d0d0d0", "door_colour" => "#ff0000", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#a0a0a0" ],
            [ "lat" => 0.55, "lon" => 0.5, "scale" => 3, "wall_colour" => "##d0d0d0", "door_colour" => "#00ff00", "window_style" => "circular", "door_style" => "fancy", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.7, "lon" => 0.55, "scale" => 4, "wall_colour" => "#0000ff", "door_colour" => "#0000ff", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.55, "scale" => 3, "wall_colour" => "#0000ff", "door_colour" => "#ff9900", "window_style" => "rectangular", "door_style" => "fancy", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.7, "lon" => 0.7, "scale" => 3, "wall_colour" => "#0000ff", "door_colour" => "#ff0000", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.6, "scale" => 3, "wall_colour" => "#0000ff", "door_colour" => "#00ff00", "window_style" => "circular", "door_style" => "fancy", "roof_colour" => "#f0f0f0" ],
            [ "lat" => 0.7, "lon" => 0.75, "scale" => 4, "wall_colour" => "#0000ff", "door_colour" => "#0000ff", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.65, "scale" => 4, "wall_colour" => "#0000ff", "door_colour" => "#ff9900", "window_style" => "rectangular", "door_style" => "fancy", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.7, "lon" => 0.8, "scale" => 5, "wall_colour" => "##ff9900", "door_colour" => "#ff0000", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.7, "scale" => 3, "wall_colour" => "#0000ff", "door_colour" => "#00ff00", "window_style" => "circular", "door_style" => "fancy", "roof_colour" => "#d0d0d0" ],
            [ "lat" => 0.7, "lon" => 0.85, "scale" => 5, "wall_colour" => "#0000ff", "door_colour" => "#0000ff", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.75, "scale" => 3, "wall_colour" => "##ff9900", "door_colour" => "#ff9900", "window_style" => "rectangular", "door_style" => "fancy", "roof_colour" => "#f0f0f0" ],
            [ "lat" => 0.3, "lon" => 0.8, "scale" => 3, "wall_colour" => "##ff9900", "door_colour" => "#ff0000", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.8, "scale" => 3, "wall_colour" => "#0000ff", "door_colour" => "#00ff00", "window_style" => "circular", "door_style" => "fancy", "roof_colour" => "#d0d0d0" ],
            [ "lat" => 0.3, "lon" => 0.85, "scale" => 5, "wall_colour" => "#0000ff", "door_colour" => "#0000ff", "window_style" => "rectangular", "door_style" => "simple", "roof_colour" => "#ff0000" ],
            [ "lat" => 0.55, "lon" => 0.85, "scale" => 3, "wall_colour" => "##ff9900", "door_colour" => "#ff9900", "window_style" => "rectangular", "door_style" => "fancy", "roof_colour" => "#f0f0f0" ],
        ];

        foreach ($houseData as $house) {
            House::create($house);
        }
    }
}
