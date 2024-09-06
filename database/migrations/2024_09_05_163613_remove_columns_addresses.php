<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            // Dropping the lat and lon columns from the addresses table
            $table->dropColumn(['lat', 'lon']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * Reverse the removal of the lat and lon columns.
     */
    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            // Adding back the lat and lon columns in case of rollback
            $table->decimal('lat', 10, 7);
            $table->decimal('lon', 10, 7);
        });
    }
};
