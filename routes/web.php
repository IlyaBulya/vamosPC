<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Store\AssistanceController;
use App\Http\Controllers\Store\AccountController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CartItemController;
use App\Http\Controllers\Store\CatalogController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/assistance', [AssistanceController::class, 'index'])->name('assistance');
Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::post('/cart/items', [CartItemController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{lineKey}', [CartItemController::class, 'update'])
    ->where('lineKey', 'product_[0-9]+')
    ->name('cart.items.update');
Route::delete('/cart/items/{lineKey}', [CartItemController::class, 'destroy'])
    ->where('lineKey', 'product_[0-9]+')
    ->name('cart.items.destroy');
Route::delete('/cart/items', [CartItemController::class, 'clear'])->name('cart.items.clear');
Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog');
Route::get('/products/{product}', [ProductController::class, 'legacy'])
    ->whereNumber('product')
    ->name('products.legacy');
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
    Route::get('/account', [AccountController::class, 'index'])->name('account');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
});

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->as('admin.')
    ->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');

        Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [AdminCategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('categories.edit');
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}', [AdminOrderController::class, 'update'])->name('orders.update');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
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
