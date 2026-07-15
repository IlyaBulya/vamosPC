const UNSPLASH_PARAMS = '?w=800&q=80&auto=format&fit=crop';

export type SoftwareGroupKey = 'os' | 'office' | 'antivirus';

export type SoftwareOption = {
    id: string;
    name: string;
    description: string;
    price_in_cents: number;
};

export type SoftwareGroup = {
    key: SoftwareGroupKey;
    label: string;
    note: string;
    image: string;
    options: SoftwareOption[];
};

/** group key -> selected option id (null = not installed) */
export type SoftwareSelections = Record<SoftwareGroupKey, string | null>;

export const EMPTY_SOFTWARE_SELECTIONS: SoftwareSelections = {
    os: null,
    office: null,
    antivirus: null,
};

/**
 * Static UI catalog for the optional software step. Purely client-side
 * for now: the picks are not part of the purchase payload yet.
 */
export const SOFTWARE_GROUPS: SoftwareGroup[] = [
    {
        key: 'os',
        label: 'Operating System',
        note: 'Preinstalled and updated before shipping',
        image: `https://images.unsplash.com/photo-1770278856325-e313d121ea16${UNSPLASH_PARAMS}`,
        options: [
            {
                id: 'win11-home',
                name: 'Microsoft Windows 11 Home',
                description: 'OEM license, activated out of the box',
                price_in_cents: 14500,
            },
            {
                id: 'win11-pro',
                name: 'Microsoft Windows 11 Pro',
                description: 'OEM license with BitLocker and Remote Desktop',
                price_in_cents: 19900,
            },
        ],
    },
    {
        key: 'office',
        label: 'Office Suite',
        note: 'Ready to work from the first boot',
        image: `https://images.unsplash.com/photo-1649433391420-542fcd3835ea${UNSPLASH_PARAMS}`,
        options: [
            {
                id: 'm365-personal',
                name: 'Microsoft 365 Personal',
                description: '1-year subscription, Word / Excel / PowerPoint',
                price_in_cents: 6900,
            },
            {
                id: 'office-2024-home',
                name: 'Microsoft Office Home 2024',
                description: 'One-time purchase, no subscription',
                price_in_cents: 14900,
            },
        ],
    },
    {
        key: 'antivirus',
        label: 'Antivirus',
        note: 'Configured with sensible defaults',
        image: `https://images.unsplash.com/photo-1614064641938-3bbee52942c7${UNSPLASH_PARAMS}`,
        options: [
            {
                id: 'eset-nod32',
                name: 'ESET NOD32 Essential',
                description: '1-year license for 1 device',
                price_in_cents: 3500,
            },
            {
                id: 'bitdefender-total',
                name: 'Bitdefender Total Security',
                description: '1-year license for 5 devices',
                price_in_cents: 4500,
            },
        ],
    },
];

export type SelectedSoftwareEntry = {
    group_key: SoftwareGroupKey;
    group_label: string;
    name: string;
    price_in_cents: number;
};

export function selectedSoftwareEntries(
    selections: SoftwareSelections,
): SelectedSoftwareEntry[] {
    return SOFTWARE_GROUPS.flatMap((group) => {
        const option = group.options.find(
            (item) => item.id === selections[group.key],
        );

        return option
            ? [
                  {
                      group_key: group.key,
                      group_label: group.label,
                      name: option.name,
                      price_in_cents: option.price_in_cents,
                  },
              ]
            : [];
    });
}

export function softwareTotalInCents(selections: SoftwareSelections): number {
    return selectedSoftwareEntries(selections).reduce(
        (sum, entry) => sum + entry.price_in_cents,
        0,
    );
}
