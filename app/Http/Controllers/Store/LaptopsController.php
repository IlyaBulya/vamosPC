<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LaptopsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('store/laptops');
    }
}