<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CompareController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('store/compare');
    }
}
