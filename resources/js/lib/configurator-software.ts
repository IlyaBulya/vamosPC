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

export type SelectedSoftwareEntry = {
    group_key: SoftwareGroupKey;
    group_label: string;
    name: string;
    price_in_cents: number;
};

export function selectedSoftwareEntries(
    selections: SoftwareSelections,
    groups: SoftwareGroup[],
): SelectedSoftwareEntry[] {
    return groups.flatMap((group) => {
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

export function softwareTotalInCents(
    selections: SoftwareSelections,
    groups: SoftwareGroup[],
): number {
    return selectedSoftwareEntries(selections, groups).reduce(
        (sum, entry) => sum + entry.price_in_cents,
        0,
    );
}
