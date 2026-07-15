<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

final class ConfiguratorSoftware
{
    /**
     * The server owns software names and prices. The browser submits only
     * group/option ids, so changing a request cannot change the charged price.
     *
     * @var array<string, array<string, mixed>>
     */
    private const GROUPS = [
        'os' => [
            'label' => 'Operating System',
            'note' => 'Preinstalled and updated before shipping',
            'image' => 'https://images.unsplash.com/photo-1770278856325-e313d121ea16?w=800&q=80&auto=format&fit=crop',
            'options' => [
                'win11-home' => [
                    'name' => 'Microsoft Windows 11 Home',
                    'description' => 'OEM license, activated out of the box',
                    'price_in_cents' => 14500,
                ],
                'win11-pro' => [
                    'name' => 'Microsoft Windows 11 Pro',
                    'description' => 'OEM license with BitLocker and Remote Desktop',
                    'price_in_cents' => 19900,
                ],
            ],
        ],
        'office' => [
            'label' => 'Office Suite',
            'note' => 'Ready to work from the first boot',
            'image' => 'https://images.unsplash.com/photo-1649433391420-542fcd3835ea?w=800&q=80&auto=format&fit=crop',
            'options' => [
                'm365-personal' => [
                    'name' => 'Microsoft 365 Personal',
                    'description' => '1-year subscription, Word / Excel / PowerPoint',
                    'price_in_cents' => 6900,
                ],
                'office-2024-home' => [
                    'name' => 'Microsoft Office Home 2024',
                    'description' => 'One-time purchase, no subscription',
                    'price_in_cents' => 14900,
                ],
            ],
        ],
        'antivirus' => [
            'label' => 'Antivirus',
            'note' => 'Configured with sensible defaults',
            'image' => 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80&auto=format&fit=crop',
            'options' => [
                'eset-nod32' => [
                    'name' => 'ESET NOD32 Essential',
                    'description' => '1-year license for 1 device',
                    'price_in_cents' => 3500,
                ],
                'bitdefender-total' => [
                    'name' => 'Bitdefender Total Security',
                    'description' => '1-year license for 5 devices',
                    'price_in_cents' => 4500,
                ],
            ],
        ],
    ];

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function payload(): array
    {
        return collect(self::GROUPS)
            ->map(fn (array $group, string $groupKey): array => [
                'key' => $groupKey,
                'label' => $group['label'],
                'note' => $group['note'],
                'image' => $group['image'],
                'options' => collect($group['options'])
                    ->map(fn (array $option, string $optionId): array => [
                        'id' => $optionId,
                        'name' => $option['name'],
                        'description' => $option['description'],
                        'price_in_cents' => (int) $option['price_in_cents'],
                    ])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * Resolve client-supplied ids into immutable, server-priced snapshots.
     *
     * @param  array<string, mixed>  $selections
     * @return array<int, array<string, mixed>>
     *
     * @throws ValidationException
     */
    public static function resolve(array $selections): array
    {
        $unknownGroups = array_diff(array_keys($selections), array_keys(self::GROUPS));

        if ($unknownGroups !== []) {
            throw ValidationException::withMessages([
                'selected_software' => 'Unknown software group selected.',
            ]);
        }

        $resolved = [];

        foreach (self::GROUPS as $groupKey => $group) {
            $optionId = $selections[$groupKey] ?? null;

            if ($optionId === null || $optionId === '') {
                continue;
            }

            if (! is_string($optionId) || ! isset($group['options'][$optionId])) {
                throw ValidationException::withMessages([
                    "selected_software.{$groupKey}" => 'Invalid software selection.',
                ]);
            }

            $option = $group['options'][$optionId];
            $resolved[] = [
                'group_key' => $groupKey,
                'group_label' => $group['label'],
                'option_id' => $optionId,
                'name' => $option['name'],
                'description' => $option['description'],
                'quantity' => 1,
                'price_in_cents' => (int) $option['price_in_cents'],
            ];
        }

        return $resolved;
    }
}
