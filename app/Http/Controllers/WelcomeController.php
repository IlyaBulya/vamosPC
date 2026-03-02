<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }
}