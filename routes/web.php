<?php

use App\Http\Controllers\AddressController;
use Illuminate\Support\Facades\Route;

//Route::get('/', function () {
//    return view('welcome');
//});

Route::get('/', [AddressController::class, 'index']);
