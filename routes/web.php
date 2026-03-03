<?php

use App\Http\Controllers\Store\CatalogController;
use App\Http\Controllers\Store\GamingPcController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\LaptopsController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class , 'index'])->name('home');
Route::get('/catalog', [CatalogController::class , 'index'])->name('catalog');
Route::get('/gaming-pc', [GamingPcController::class , 'index'])->name('gaming-pc');
Route::get('/laptops', [LaptopsController::class , 'index'])->name('laptops');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
