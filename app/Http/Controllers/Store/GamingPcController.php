<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\Product;
use App\Models\UserConfiguration;
use App\Support\CartOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    public function index(): Response
    {
        $configurations = Configuration::query()
            ->with(['products.category:id,name'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => $configuration->products->count(),
                'components' => $configuration->products
                    ->map(fn (Product $product): array => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'category_name' => $product->category?->name,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values();

        return Inertia::render('store/gaming-pcs', [
            'configurations' => $configurations,
        ]);
    }

    public function configure(Configuration $configuration): Response
    {
        $builderData = $this->buildBuilderData($configuration);
        $slots = $builderData['slots'];
        $baseComponentsTotal = (int) $builderData['base_components_total_in_cents'];

        return Inertia::render('store/configure-pc', [
            'configuration' => [
                'id' => (int) $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'base_components_total_in_cents' => $baseComponentsTotal,
                'markup_in_cents' => (int) $configuration->price - $baseComponentsTotal,
            ],
            'slots' => $slots,
        ]);
    }

    public function buy(Request $request, Configuration $configuration): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $builderData = $this->buildBuilderData($configuration);
        $slots = $builderData['slots'];
        $baseComponentsTotal = (int) $builderData['base_components_total_in_cents'];

        abort_if($slots->isEmpty(), 422, 'This configuration has no components.');

        $data = $request->validate([
            'selected_components' => ['nullable', 'array'],
        ]);

        $selectedPayload = is_array($data['selected_components'] ?? null)
            ? $data['selected_components']
            : [];

        $selectedComponentsTotal = 0;
        $normalizedSelections = [];

        foreach ($slots as $slot) {
            $slotKey = (string) $slot['slot_key'];
            $selectedIdRaw = $selectedPayload[$slotKey] ?? $slot['default_product_id'];
            $selectedId = filter_var(
                $selectedIdRaw,
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 1]],
            );

            if ($selectedId === false) {
                throw ValidationException::withMessages([
                    "selected_components.{$slotKey}" => 'Invalid component selection.',
                ]);
            }

            $selectedProduct = collect($slot['products'])->first(
                fn (array $product): bool => (int) $product['id'] === (int) $selectedId,
            );

            if ($selectedProduct === null) {
                throw ValidationException::withMessages([
                    "selected_components.{$slotKey}" => 'Selected component is not allowed for this slot.',
                ]);
            }

            $selectedPrice = (int) $selectedProduct['price_in_cents'];
            $selectedComponentsTotal += $selectedPrice;

            $normalizedSelections[$slotKey] = [
                'slot_label' => (string) $slot['slot_label'],
                'category_id' => $slot['category_id'] !== null ? (int) $slot['category_id'] : null,
                'category_name' => (string) $slot['category_name'],
                'product_id' => (int) $selectedProduct['id'],
                'product_name' => (string) $selectedProduct['name'],
                'price_in_cents' => $selectedPrice,
            ];
        }

        $markupInCents = (int) $configuration->price - $baseComponentsTotal;
        $finalPrice = max(0, $selectedComponentsTotal + $markupInCents);

        DB::transaction(function () use (
            $user,
            $configuration,
            $finalPrice,
            $normalizedSelections,
            $selectedComponentsTotal,
            $baseComponentsTotal,
            $markupInCents,
        ): void {
            $userConfiguration = UserConfiguration::query()->create([
                'user_id' => (int) $user->id,
                'base_configuration_id' => (int) $configuration->id,
                'name' => "{$configuration->name} - Custom",
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price' => $finalPrice,
                'status' => 'cart',
                'selected_components' => $normalizedSelections,
                'meta' => [
                    'selected_components_total_in_cents' => $selectedComponentsTotal,
                    'base_components_total_in_cents' => $baseComponentsTotal,
                    'markup_in_cents' => $markupInCents,
                ],
            ]);

            $order = CartOrder::ensureForUser($user);
            $order->items()->create([
                'product_id' => null,
                'user_configuration_id' => (int) $userConfiguration->id,
                'qty' => 1,
                'price' => $finalPrice,
            ]);

            CartOrder::syncTotal($order);
        });

        return redirect()
            ->route('cart')
            ->with('status', 'Custom configuration added to cart.');
    }

    /**
     * @return array{
     *     slots: \Illuminate\Support\Collection<int, array{
     *         slot_key: string,
     *         slot_label: string,
     *         category_id: int|null,
     *         category_name: string,
     *         default_product_id: int,
     *         products: array<int, array{
     *             id: int,
     *             name: string,
     *             description: string|null,
     *             price_in_cents: int,
     *             color: string|null,
     *             category_name: string|null
     *         }>
     *     }>,
     *     base_components_total_in_cents: int
     * }
     */
    private function buildBuilderData(Configuration $configuration): array
    {
        $configuration->load(['products.category:id,name']);

        $baseProducts = $configuration->products->values();
        $categoryIds = $baseProducts
            ->pluck('category_id')
            ->filter()
            ->map(fn ($categoryId): int => (int) $categoryId)
            ->unique()
            ->values();

        $optionsByCategoryId = Product::query()
            ->with(['category:id,name'])
            ->where('is_component', true)
            ->whereIn('category_id', $categoryIds)
            ->orderBy('category_id')
            ->orderBy('name')
            ->get(['id', 'category_id', 'name', 'description', 'price_in_cents', 'color'])
            ->groupBy('category_id');

        $slots = $baseProducts
            ->groupBy(fn (Product $product): string => $product->category_id !== null
                ? 'cat-'.$product->category_id
                : 'uncategorized')
            ->flatMap(function ($groupedProducts, string $categoryKey) use ($optionsByCategoryId) {
                /** @var Product|null $firstProduct */
                $firstProduct = $groupedProducts->first();
                $categoryId = $firstProduct?->category_id !== null
                    ? (int) $firstProduct->category_id
                    : null;
                $categoryName = $firstProduct?->category?->name ?? 'Uncategorized';
                $slotCount = $groupedProducts->count();

                $categoryOptions = $categoryId !== null
                    ? ($optionsByCategoryId->get($categoryId) ?? collect())
                    : collect();

                if ($categoryOptions->isEmpty()) {
                    $categoryOptions = $groupedProducts;
                }

                $products = $categoryOptions
                    ->map(fn (Product $product): array => [
                        'id' => (int) $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'price_in_cents' => (int) $product->price_in_cents,
                        'color' => $product->color,
                        'category_name' => $product->category?->name,
                    ])
                    ->values()
                    ->all();

                return $groupedProducts
                    ->values()
                    ->map(fn (Product $baseProduct, int $index): array => [
                        'slot_key' => "{$categoryKey}-{$index}",
                        'slot_label' => $slotCount > 1
                            ? "{$categoryName} #".($index + 1)
                            : $categoryName,
                        'category_id' => $categoryId,
                        'category_name' => $categoryName,
                        'default_product_id' => (int) $baseProduct->id,
                        'products' => $products,
                    ])
                    ->all();
            })
            ->values();

        $baseComponentsTotal = (int) $baseProducts->sum(
            fn (Product $product): int => (int) $product->price_in_cents,
        );

        return [
            'slots' => $slots,
            'base_components_total_in_cents' => $baseComponentsTotal,
        ];
    }
}
