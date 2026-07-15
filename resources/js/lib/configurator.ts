import { SPEC_SCHEMA, type ComponentType } from '@/lib/spec-schema';

export type SlotProduct = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    color: string | null;
    category_name: string | null;
    component_type: ComponentType | null;
    specs: Record<string, unknown> | null;
};

export type ComponentSlot = {
    slot_key: string;
    slot_label: string;
    component_type: ComponentType | null;
    category_id: number | null;
    category_name: string;
    default_product_id: number;
    products: SlotProduct[];
};

export type ConfiguratorConfiguration = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    base_components_total_in_cents: number;
    markup_in_cents: number;
};

export type Violation = {
    severity: 'error' | 'warning';
    rule: string;
    message: string;
    component_types: string[];
};

export type OptionAnnotation = {
    product_id: number;
    messages: string[];
};

export type CheckResult = {
    violations: Violation[];
    has_errors: boolean;
    load_watts: number | null;
    selected_total_in_cents: number;
    final_price_in_cents: number;
    option_annotations: Record<string, OptionAnnotation[]>;
};

export type ConflictItem = {
    slot_key: string;
    product_id: number;
    product_name: string;
};

export type ConflictReplacement = {
    slot_key: string;
    from_product_id: number;
    from_name: string;
    to_product_id: number;
    to_name: string;
    to_price_in_cents: number;
};

export type ResolveResult = {
    conflicts: ConflictItem[];
    replacements: ConflictReplacement[];
    resolved: boolean;
    messages: string[];
};

export function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

/**
 * "+€50.00" / "−€30.00" relative price against the current selection.
 */
export function formatDelta(deltaInCents: number) {
    const formatted = formatPrice(Math.abs(deltaInCents));

    return deltaInCents >= 0 ? `+${formatted}` : `−${formatted}`;
}

/**
 * Up to `max` short spec chips ("8 GB", "AM5", "650 W") for an option row,
 * in the field order defined by the spec schema.
 */
export function specChips(product: SlotProduct, max = 3): string[] {
    if (!product.component_type || !product.specs) {
        return [];
    }

    const chips: string[] = [];

    for (const field of SPEC_SCHEMA[product.component_type]) {
        if (chips.length >= max) {
            break;
        }

        const value = product.specs[field.key];

        if (
            value === null ||
            value === undefined ||
            value === '' ||
            typeof value === 'boolean'
        ) {
            continue;
        }

        if (Array.isArray(value)) {
            if (value.length > 0 && value.length <= 3) {
                chips.push(value.join('/'));
            }
            continue;
        }

        chips.push(field.unit ? `${value} ${field.unit}` : String(value));
    }

    return chips;
}

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function postJson<T>(
    url: string,
    body: Record<string, unknown>,
    signal?: AbortSignal,
): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        signal,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Request to ${url} failed: ${response.status}`);
    }

    return response.json();
}

export async function postCheck(
    configurationId: number,
    selections: Record<string, number>,
    signal?: AbortSignal,
): Promise<CheckResult> {
    return postJson<CheckResult>(
        `/gaming-pcs/${configurationId}/check`,
        { selected_components: selections },
        signal,
    );
}
