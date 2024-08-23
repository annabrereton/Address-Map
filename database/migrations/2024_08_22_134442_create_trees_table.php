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
        Schema::create('trees', function (Blueprint $table) {
            $table->id();
            $table->decimal('lat', 10, 6); // Latitude
            $table->decimal('lon', 10, 6); // Longitude
            $table->integer('scale');
            $table->string('leaf_colour')->nullable();
            $table->string('trunk_colour')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('trees');
    }
};
