<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Store\AssistanceController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CartItemController;
use App\Http\Controllers\Store\CatalogController;
use App\Http\Controllers\Store\CompareController;
use App\Http\Controllers\Store\GamingPcController;
use App\Http\Controllers\Store\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/assistance', [AssistanceController::class, 'index'])->name('assistance');
Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::post('/cart/items', [CartItemController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{product}', [CartItemController::class, 'update'])
    ->whereNumber('product')
    ->name('cart.items.update');
Route::delete('/cart/items/{product}', [CartItemController::class, 'destroy'])
    ->whereNumber('product')
    ->name('cart.items.destroy');
Route::delete('/cart/items', [CartItemController::class, 'clear'])->name('cart.items.clear');
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog');
Route::get('/compare', [CompareController::class, 'index'])->name('compare');
Route::get('/products/{product}', [ProductController::class, 'legacy'])
    ->whereNumber('product')
    ->name('products.legacy');
Route::get('/gaming-pc', [GamingPcController::class, 'index'])->name('gaming-pc');
Route::get('/catalog/hardware', [CategoryController::class, 'hardware'])->name('hardware');
Route::redirect('/hardware', '/catalog/hardware', 301);
Route::get('/laptops', [CategoryController::class, 'laptop'])->name('laptops');
Route::get('/laptops/{category}', [CategoryController::class, 'laptopCategory'])
    ->name('laptops.item');
Route::get('/catalog/accessories', [CategoryController::class, 'accessories'])->name('accessories');
Route::redirect('/accessories', '/catalog/accessories', 301);
Route::redirect('/catalog/laptop', '/laptops', 301);
Route::redirect('/catalog/laptop/{category}', '/laptops/{category}', 301);
Route::redirect('/notebook', '/laptops', 301);
Route::redirect('/category/{type}', '/catalog/{type}', 301);
Route::redirect('/category/{type}/{category}', '/catalog/{type}/{category}', 301);

Route::middleware('guest')->group(function () {
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])
        ->name('auth.google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
        ->name('auth.google.callback');
});

Route::group([
    'prefix' => 'catalog',
    'as' => 'category.',
    'controller' => CategoryController::class,
], function () {
    Route::get('/{type}', 'showType')
        ->where('type', 'hardware|accessory')
        ->name('type');
    Route::get('/{type}/{category}', 'showCategory')
        ->where('type', 'hardware|accessory')
        ->name('item');
});

Route::middleware(['auth'])->group(function () {
    Route::inertia('account', 'account/index')->name('account');
});

require __DIR__.'/settings.php';

Route::get('/catalog/{category_slug}/{product_slug}', [ProductController::class, 'showCatalog'])
    ->where([
        'category_slug' => '[a-z0-9-]+',
        'product_slug' => '[a-z0-9-]+',
    ])
    ->name('products.catalog.show');
Route::get('/laptops/{category_slug}/{product_slug}', [ProductController::class, 'showLaptop'])
    ->where([
        'category_slug' => '[a-z0-9-]+',
        'product_slug' => '[a-z0-9-]+',
    ])
    ->name('products.laptops.show');
