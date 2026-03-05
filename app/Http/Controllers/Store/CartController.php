<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('store/cart', [
            'items' => [
                [
                    'id' => 1,
                    'name' => 'VAMOS Vector 17 HX',
                    'subtitle' => 'RTX 5070 Ti 12GB, Core Ultra 275HX, 32GB, 1TB',
                    'availability' => 'In stock',
                    'notes' => [],
                    'unit_price' => 3300,
                    'qty' => 1,
                ],
                [
                    'id' => 2,
                    'name' => 'VAMOS Play 7 Max',
                    'subtitle' => 'Custom gaming desktop build',
                    'availability' => 'Pre-order',
                    'notes' => [
                        'Extended warranty 24 or 36 months',
                        'Priority production option',
                    ],
                    'unit_price' => 2683,
                    'qty' => 1,
                ],
                [
                    'id' => 3,
                    'name' => 'LG UltraGear 24GS65F',
                    'subtitle' => 'Gaming monitor',
                    'availability' => 'In stock',
                    'notes' => [],
                    'unit_price' => 213,
                    'qty' => 1,
                ],
            ],
        ]);
    }
}
