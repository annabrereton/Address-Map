<?php

use App\Http\Controllers\AddressController;
use Illuminate\Support\Facades\Route;

//Route::get('/', function () {
//    return view('welcome');
//});

Route::get('/', [AddressController::class, 'index']);
Route::post('/add-address', [AddressController::class, 'store'])->name('address.store');
Route::get('/edit-address', [AddressController::class, 'edit'])->name('address.edit');
Route::put('/update-address/{address}', [AddressController::class, 'update'])->name('address.update');
Route::delete('/delete-address/{address}', [AddressController::class, 'destroy'])->name('address.destroy');
