<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('store/gaming-pc');
    }
}
