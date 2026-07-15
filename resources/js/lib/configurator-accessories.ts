const UNSPLASH_PARAMS = '?w=800&q=80&auto=format&fit=crop';

export type AccessoryProduct = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
};

export type AccessoryCategory = {
    slug: string;
    products: AccessoryProduct[];
};

export type SelectedAccessoryEntry = AccessoryProduct & {
    category_slug: string;
    category_label: string;
};

/**
 * Stock placeholder photo per accessory category, hotlinked from the
 * Unsplash CDN. Shown while a product has no photo of its own in
 * object storage.
 */
const ACCESSORY_PLACEHOLDER_IMAGES: Record<string, string> = {
    monitor: `https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf${UNSPLASH_PARAMS}`,
    keyboard: `https://images.unsplash.com/photo-1538481199705-c710c4e965fc${UNSPLASH_PARAMS}`,
    mouse: `https://images.unsplash.com/photo-1616296425622-4560a2ad83de${UNSPLASH_PARAMS}`,
    headset: `https://images.unsplash.com/photo-1566055972289-c52022ae23b7${UNSPLASH_PARAMS}`,
    'mouse-pad': `https://images.unsplash.com/photo-1616071359129-9b03697771a8${UNSPLASH_PARAMS}`,
    microphone: `https://images.unsplash.com/photo-1590602847861-f357a9332bbc${UNSPLASH_PARAMS}`,
};

const GENERIC_ACCESSORY_IMAGE = `https://images.unsplash.com/photo-1636036769389-343bb250f013${UNSPLASH_PARAMS}`;

export function accessoryImage(
    productImage: string | null | undefined,
    categorySlug: string,
): string {
    if (productImage) {
        return productImage;
    }

    return (
        ACCESSORY_PLACEHOLDER_IMAGES[categorySlug] ?? GENERIC_ACCESSORY_IMAGE
    );
}

/** "mouse-pad" -> "Mouse Pad" */
export function accessoryCategoryLabel(slug: string): string {
    return slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function selectedAccessoryEntries(
    categories: AccessoryCategory[],
    selectedIds: number[],
): SelectedAccessoryEntry[] {
    return categories.flatMap((category) =>
        category.products
            .filter((product) => selectedIds.includes(product.id))
            .map((product) => ({
                ...product,
                category_slug: category.slug,
                category_label: accessoryCategoryLabel(category.slug),
            })),
    );
}
