<?php

use App\Http\Controllers\Store\GamingPcController;
use App\Http\Controllers\Store\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/gaming-pc', [GamingPcController::class, 'index'])->name('gaming-pc');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
