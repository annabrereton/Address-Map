<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TreeController;
use Illuminate\Support\Facades\Route;


Route::get('/', [HomeController::class, 'home'])->name('home');

Route::post('/address', [AddressController::class, 'store'])->name('address.store');
Route::put('/address/{address}', [AddressController::class, 'update'])->name('address.update');
Route::delete('/address/{address}', [AddressController::class, 'destroy'])->name('address.destroy');

Route::post('/tree', [TreeController::class, 'store'])->name('tree.store');

