<?php

use App\Http\Controllers\HouseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;


//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');


Route::get('/fetch-houses', [HomeController::class, 'getHouses']);
Route::get('/fetch-trees', [HomeController::class, 'getTrees']);
Route::post('/house/{house}', [HouseController::class, 'updateCoordinates']);
