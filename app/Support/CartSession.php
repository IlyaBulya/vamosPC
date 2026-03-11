<?php

namespace App\Support;

use Illuminate\Http\Request;

class CartSession
{
    public const SESSION_KEY = 'cart.items';

    /**
     * @return array<string, array{type: string, id: int, quantity: int}>
     */
    public static function all(Request $request): array
    {
        /** @var mixed $raw */
        $raw = $request->session()->get(self::SESSION_KEY, []);

        if (! is_array($raw)) {
            return [];
        }

        $items = [];

        foreach ($raw as $key => $value) {
            if (is_array($value)) {
                $type = (string) ($value['type'] ?? '');
                $id = (int) ($value['id'] ?? 0);
                $quantity = (int) ($value['quantity'] ?? 0);

                if (! in_array($type, ['product'], true) || $id <= 0 || $quantity <= 0) {
                    continue;
                }

                $items[self::lineKey($type, $id)] = [
                    'type' => $type,
                    'id' => $id,
                    'quantity' => $quantity,
                ];

                continue;
            }

            $id = (int) $key;
            $quantity = (int) $value;

            if ($id <= 0 || $quantity <= 0) {
                continue;
            }

            $items[self::lineKey('product', $id)] = [
                'type' => 'product',
                'id' => $id,
                'quantity' => $quantity,
            ];
        }

        return $items;
    }

    /**
     * @param  array<string, array{type: string, id: int, quantity: int}>  $items
     */
    public static function put(Request $request, array $items): void
    {
        $request->session()->put(self::SESSION_KEY, $items);
    }

    public static function forget(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }

    public static function count(Request $request): int
    {
        return collect(self::all($request))
            ->sum(fn (array $item): int => max((int) $item['quantity'], 0));
    }

    public static function lineKey(string $type, int $id): string
    {
        return sprintf('%s_%d', $type, $id);
    }

    /**
     * @return array{type: string, id: int}|null
     */
    public static function parseLineKey(string $lineKey): ?array
    {
        if (! preg_match('/^(product)_(\d+)$/', $lineKey, $matches)) {
            return null;
        }

        return [
            'type' => $matches[1],
            'id' => (int) $matches[2],
        ];
    }
}
