<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Concerns\HandlesPublicImageUploads;
use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\ConfigurationSlot;
use App\Models\UserConfiguration;
use App\Services\ConfiguratorService;
use App\Support\CartOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GamingPcController extends Controller
{
    use HandlesPublicImageUploads;

    public function __construct(
        private readonly ConfiguratorService $configurator,
    ) {}

    public function index(): Response
    {
        $configurations = Configuration::query()
            ->with(['slots.defaultProduct.category:id,name'])
            ->orderByRaw('case when display_order is null then 1 else 0 end')
            ->orderBy('display_order')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn (Configuration $configuration): array => [
                'id' => $configuration->id,
                'route_slug' => $this->configurationRouteSlug($configuration),
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => $configuration->slots->count(),
                'components' => $configuration->slots
                    ->map(fn (ConfigurationSlot $slot): ?array => $slot->defaultProduct !== null
                        ? [
                            'id' => (int) $slot->defaultProduct->id,
                            'name' => $slot->defaultProduct->name,
                            'category_name' => $slot->defaultProduct->category?->name,
                        ]
                        : null)
                    ->filter()
                    ->values()
                    ->all(),
            ])
            ->values();

        return Inertia::render('store/gaming-pcs', [
            'configurations' => $configurations,
        ]);
    }

    public function show(string $configurationSlug): Response|RedirectResponse
    {
        if (ctype_digit($configurationSlug)) {
            $legacyConfiguration = Configuration::query()->find((int) $configurationSlug);
            abort_if($legacyConfiguration === null, 404);

            return redirect("/gaming-pcs/{$this->configurationRouteSlug($legacyConfiguration)}");
        }

        $configuration = Configuration::query()
            ->with(['slots.defaultProduct.category:id,name'])
            ->where('slug', $configurationSlug)
            ->first();

        if ($configuration === null) {
            // Legacy links: name-only slugs or stale name-id slugs.
            $legacyConfiguration = Configuration::query()
                ->get()
                ->first(
                    fn (Configuration $item): bool => $this->legacyConfigurationRouteSlug($item) === $configurationSlug
                        || Str::slug($item->name).'-'.$item->id === $configurationSlug
                );
            abort_if($legacyConfiguration === null, 404);

            return redirect("/gaming-pcs/{$this->configurationRouteSlug($legacyConfiguration)}");
        }

        return Inertia::render('gaming-pcs/show', [
            'configuration' => [
                'id' => (int) $configuration->id,
                'route_slug' => $this->configurationRouteSlug($configuration),
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'components_count' => $configuration->slots->count(),
                'components' => $configuration->slots
                    ->map(fn (ConfigurationSlot $slot): ?array => $slot->defaultProduct !== null
                        ? [
                            'id' => (int) $slot->defaultProduct->id,
                            'name' => $slot->defaultProduct->name,
                            'description' => $slot->defaultProduct->description,
                            'category_name' => $slot->defaultProduct->category?->name,
                            'price_in_cents' => (int) $slot->defaultProduct->price_in_cents,
                        ]
                        : null)
                    ->filter()
                    ->values()
                    ->all(),
            ],
            'navigation' => [
                'back_to_list_href' => '/gaming-pcs',
                'configure_href' => "/gaming-pcs/{$configuration->id}/configure",
            ],
        ]);
    }

    public function configure(Request $request, Configuration $configuration): Response
    {
        $builderData = $this->configurator->builderPayload($configuration);
        $softwareGroups = $this->configurator->softwarePayload();
        $accessories = $this->configurator->accessoriesPayload();
        $draft = $this->requestedDraft($request, $configuration);

        return Inertia::render('store/configure-pc', [
            'configuration' => [
                'id' => (int) $configuration->id,
                'name' => $configuration->name,
                'description' => $configuration->description,
                'image' => $configuration->image,
                'price_in_cents' => (int) $configuration->price,
                'base_components_total_in_cents' => (int) $builderData['base_components_total_in_cents'],
                'markup_in_cents' => (int) $configuration->markup_in_cents,
            ],
            'slots' => $builderData['slots'],
            'software_groups' => $softwareGroups,
            'accessories' => $accessories,
            'initial_selections' => $this->draftSelections($draft, $builderData['slots']),
            'initial_software_selections' => $this->draftSoftwareSelections($draft, $softwareGroups),
            'initial_accessory_ids' => $this->draftAccessoryIds($draft, $accessories),
        ]);
    }

    /**
     * Real-time compatibility + pricing verdict for the configurator UI.
     */
    public function check(Request $request, Configuration $configuration): JsonResponse
    {
        $data = $request->validate($this->selectionValidationRules());

        $resolved = $this->configurator->resolveSelections(
            $configuration,
            is_array($data['selected_components'] ?? null) ? $data['selected_components'] : [],
        );
        $extras = $this->configurator->resolveExtras(
            is_array($data['selected_software'] ?? null) ? $data['selected_software'] : [],
            is_array($data['selected_accessory_ids'] ?? null) ? $data['selected_accessory_ids'] : [],
        );
        $report = $this->configurator->compatibilityReport($resolved['products']);
        $buildPrice = $this->configurator->finalPrice($configuration, (int) $resolved['total_in_cents']);

        return response()->json([
            ...$report,
            'selected_total_in_cents' => (int) $resolved['total_in_cents'],
            'software_total_in_cents' => $extras['software_total_in_cents'],
            'accessories_total_in_cents' => $extras['accessories_total_in_cents'],
            'extras_total_in_cents' => $extras['total_in_cents'],
            'final_price_in_cents' => $buildPrice + $extras['total_in_cents'],
            'option_annotations' => $this->configurator->optionAnnotations(
                $configuration,
                $resolved['products'],
            ),
        ]);
    }

    /**
     * Conflict + auto-replacement proposal for a selection the shopper is
     * about to apply (the payload already contains the change).
     */
    public function resolve(Request $request, Configuration $configuration): JsonResponse
    {
        $data = $request->validate([
            'selected_components' => ['nullable', 'array'],
            'changed_slot_key' => ['required', 'string', 'max:64'],
        ]);

        return response()->json($this->configurator->proposeReplacements(
            $configuration,
            is_array($data['selected_components'] ?? null) ? $data['selected_components'] : [],
            (string) $data['changed_slot_key'],
        ));
    }

    public function buy(Request $request, Configuration $configuration): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $data = $request->validate($this->selectionValidationRules());

        $resolved = $this->configurator->resolveSelections(
            $configuration,
            is_array($data['selected_components'] ?? null) ? $data['selected_components'] : [],
        );
        $extras = $this->configurator->resolveExtras(
            is_array($data['selected_software'] ?? null) ? $data['selected_software'] : [],
            is_array($data['selected_accessory_ids'] ?? null) ? $data['selected_accessory_ids'] : [],
        );

        $this->configurator->ensurePurchasable($resolved['products']);

        $report = $this->configurator->compatibilityReport($resolved['products']);

        if ($report['has_errors']) {
            throw ValidationException::withMessages([
                'compatibility' => array_values(array_map(
                    fn (array $violation): string => $violation['message'],
                    array_filter(
                        $report['violations'],
                        fn (array $violation): bool => $violation['severity'] === 'error',
                    ),
                )),
            ]);
        }

        $selectedComponentsTotal = (int) $resolved['total_in_cents'];
        $baseComponentsTotal = $this->configurator->baseComponentsTotal($configuration);
        $markupInCents = (int) $configuration->price - $baseComponentsTotal;
        $buildPrice = $this->configurator->finalPrice($configuration, $selectedComponentsTotal, $baseComponentsTotal);
        $finalPrice = $buildPrice + $extras['total_in_cents'];

        DB::transaction(function () use (
            $user,
            $configuration,
            $finalPrice,
            $resolved,
            $report,
            $selectedComponentsTotal,
            $baseComponentsTotal,
            $markupInCents,
            $buildPrice,
            $extras,
        ): void {
            $userConfiguration = UserConfiguration::query()->create([
                'user_id' => (int) $user->id,
                'base_configuration_id' => (int) $configuration->id,
                'name' => "{$configuration->name} - Custom",
                'description' => $configuration->description,
                'image' => $this->copyPublicImage(
                    $configuration->image,
                    'user-configurations',
                ),
                'price' => $finalPrice,
                'status' => 'cart',
                'selected_components' => $resolved['selections'],
                'meta' => [
                    'schema_version' => 2,
                    'selected_components_total_in_cents' => $selectedComponentsTotal,
                    'base_components_total_in_cents' => $baseComponentsTotal,
                    'markup_in_cents' => $markupInCents,
                    'build_price_in_cents' => $buildPrice,
                    'selected_software' => $extras['software'],
                    'selected_accessories' => $extras['accessories'],
                    'software_total_in_cents' => $extras['software_total_in_cents'],
                    'accessories_total_in_cents' => $extras['accessories_total_in_cents'],
                    'extras_total_in_cents' => $extras['total_in_cents'],
                    'final_price_in_cents' => $finalPrice,
                    'currency' => 'EUR',
                    'compatibility' => $report,
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
     * Save the current selection as a draft. Compatibility errors do not
     * block drafts; the verdict is stored alongside for later display.
     */
    public function storeDraft(Request $request, Configuration $configuration): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);

        $data = $request->validate([
            ...$this->selectionValidationRules(),
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $resolved = $this->configurator->resolveSelections(
            $configuration,
            is_array($data['selected_components'] ?? null) ? $data['selected_components'] : [],
        );
        $extras = $this->configurator->resolveExtras(
            is_array($data['selected_software'] ?? null) ? $data['selected_software'] : [],
            is_array($data['selected_accessory_ids'] ?? null) ? $data['selected_accessory_ids'] : [],
        );
        $report = $this->configurator->compatibilityReport($resolved['products']);

        $selectedComponentsTotal = (int) $resolved['total_in_cents'];
        $baseComponentsTotal = $this->configurator->baseComponentsTotal($configuration);
        $markupInCents = (int) $configuration->price - $baseComponentsTotal;
        $buildPrice = $this->configurator->finalPrice($configuration, $selectedComponentsTotal, $baseComponentsTotal);
        $finalPrice = $buildPrice + $extras['total_in_cents'];

        UserConfiguration::query()->create([
            'user_id' => (int) $user->id,
            'base_configuration_id' => (int) $configuration->id,
            'name' => filled($data['name'] ?? null)
                ? (string) $data['name']
                : "{$configuration->name} - Draft",
            'description' => $configuration->description,
            'image' => $configuration->image,
            'price' => $finalPrice,
            'status' => 'draft',
            'selected_components' => $resolved['selections'],
            'meta' => [
                'schema_version' => 2,
                'selected_components_total_in_cents' => $selectedComponentsTotal,
                'base_components_total_in_cents' => $baseComponentsTotal,
                'markup_in_cents' => $markupInCents,
                'build_price_in_cents' => $buildPrice,
                'selected_software' => $extras['software'],
                'selected_accessories' => $extras['accessories'],
                'software_total_in_cents' => $extras['software_total_in_cents'],
                'accessories_total_in_cents' => $extras['accessories_total_in_cents'],
                'extras_total_in_cents' => $extras['total_in_cents'],
                'final_price_in_cents' => $finalPrice,
                'currency' => 'EUR',
                'compatibility' => $report,
            ],
        ]);

        return back()->with('status', 'Configuration draft saved.');
    }

    public function destroyDraft(Request $request, UserConfiguration $userConfiguration): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 403);
        abort_unless(
            (int) $userConfiguration->user_id === (int) $user->id
                && $userConfiguration->status === 'draft',
            403,
        );

        $userConfiguration->delete();

        return back()->with('status', 'Draft deleted.');
    }

    private function configurationRouteSlug(Configuration $configuration): string
    {
        return $configuration->slug ?? Str::slug($configuration->name).'-'.$configuration->id;
    }

    private function legacyConfigurationRouteSlug(Configuration $configuration): string
    {
        return Str::slug($configuration->name);
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function selectionValidationRules(): array
    {
        return [
            'selected_components' => ['nullable', 'array'],
            'selected_software' => ['nullable', 'array:os,office,antivirus'],
            'selected_software.*' => ['nullable', 'string', 'max:64'],
            'selected_accessory_ids' => ['nullable', 'array', 'max:50'],
            'selected_accessory_ids.*' => ['integer', 'distinct', 'min:1'],
        ];
    }

    private function requestedDraft(Request $request, Configuration $configuration): ?UserConfiguration
    {
        $draftId = (int) $request->query('draft', '0');
        $user = $request->user();

        if ($draftId < 1 || $user === null) {
            return null;
        }

        return UserConfiguration::query()
            ->whereKey($draftId)
            ->where('user_id', (int) $user->id)
            ->where('base_configuration_id', (int) $configuration->id)
            ->where('status', 'draft')
            ->first();
    }

    /**
     * Selections stored on a draft (?draft=id), filtered down to slot keys
     * and product ids that are still valid for the current slot layout.
     *
     * @param  array<int, array<string, mixed>>  $slots
     * @return array<string, int>|null
     */
    private function draftSelections(?UserConfiguration $draft, array $slots): ?array
    {
        if ($draft === null || ! is_array($draft->selected_components)) {
            return null;
        }

        $allowedBySlot = collect($slots)->keyBy('slot_key')->map(
            fn (array $slot): array => array_column($slot['products'], 'id'),
        );

        $selections = [];

        foreach ($draft->selected_components as $slotKey => $selection) {
            $productId = (int) ($selection['product_id'] ?? 0);

            if (in_array($productId, $allowedBySlot->get((string) $slotKey, []), true)) {
                $selections[(string) $slotKey] = $productId;
            }
        }

        return $selections === [] ? null : $selections;
    }

    /**
     * @param  array<int, array<string, mixed>>  $softwareGroups
     * @return array<string, string>|null
     */
    private function draftSoftwareSelections(?UserConfiguration $draft, array $softwareGroups): ?array
    {
        $snapshots = data_get($draft?->meta, 'selected_software', []);

        if (! is_array($snapshots)) {
            return null;
        }

        $allowedByGroup = collect($softwareGroups)->mapWithKeys(
            fn (array $group): array => [
                (string) $group['key'] => array_column($group['options'], 'id'),
            ],
        );
        $selections = [];

        foreach ($snapshots as $snapshot) {
            if (! is_array($snapshot)) {
                continue;
            }

            $groupKey = (string) ($snapshot['group_key'] ?? '');
            $optionId = (string) ($snapshot['option_id'] ?? '');

            if (in_array($optionId, $allowedByGroup->get($groupKey, []), true)) {
                $selections[$groupKey] = $optionId;
            }
        }

        return $selections === [] ? null : $selections;
    }

    /**
     * @param  array<int, array<string, mixed>>  $accessories
     * @return array<int, int>|null
     */
    private function draftAccessoryIds(?UserConfiguration $draft, array $accessories): ?array
    {
        $snapshots = data_get($draft?->meta, 'selected_accessories', []);

        if (! is_array($snapshots)) {
            return null;
        }

        $allowedIds = collect($accessories)
            ->flatMap(fn (array $category): array => array_column($category['products'], 'id'))
            ->map(fn (mixed $productId): int => (int) $productId)
            ->all();
        $selectedIds = collect($snapshots)
            ->filter(fn (mixed $snapshot): bool => is_array($snapshot))
            ->map(fn (array $snapshot): int => (int) ($snapshot['product_id'] ?? 0))
            ->filter(fn (int $productId): bool => in_array($productId, $allowedIds, true))
            ->unique()
            ->values()
            ->all();

        return $selectedIds === [] ? null : $selectedIds;
    }
}
