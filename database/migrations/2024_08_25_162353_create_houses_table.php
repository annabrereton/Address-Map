<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('houses', function (Blueprint $table) {
            $table->id();
            $table->float('scale')->default(4); // Scaling factor for the house
            $table->string('wall_colour')->default('0xffffff'); // Default white color
            $table->string('door_colour')->default('0xff0000'); // Default red color
            $table->string('window_style')->default('rectangular'); // Default window style
            $table->string('door_style')->default('simple'); // Default door style
            $table->string('roof_colour')->default('0x202020'); // Default roof color
            $table->decimal('lat', 10, 7); // Latitude for positioning
            $table->decimal('lon', 10, 7); // Longitude for positioning
            $table->softDeletes();
            $table->timestamps(); // Created at and updated at timestamps
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('houses');
    }
};
