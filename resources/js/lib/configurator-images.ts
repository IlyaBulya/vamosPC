import type { ComponentType } from '@/lib/spec-schema';

const UNSPLASH_PARAMS = '?w=800&q=80&auto=format&fit=crop';

/**
 * Stock placeholder photo per component category, hotlinked from the
 * Unsplash CDN. Shown while a product has no photo of its own in
 * object storage.
 */
export const COMPONENT_PLACEHOLDER_IMAGES: Record<ComponentType, string> = {
    gpu: `https://images.unsplash.com/photo-1555618254-84e2cf498b01${UNSPLASH_PARAMS}`,
    cpu: `https://images.unsplash.com/photo-1540829917886-91ab031b1764${UNSPLASH_PARAMS}`,
    motherboard: `https://images.unsplash.com/photo-1712701815718-29f5fe510c0e${UNSPLASH_PARAMS}`,
    cooler: `https://images.unsplash.com/photo-1513366884929-f0b3bedfb653${UNSPLASH_PARAMS}`,
    ram: `https://images.unsplash.com/photo-1541029071515-84cc54f84dc5${UNSPLASH_PARAMS}`,
    storage: `https://images.unsplash.com/photo-1597138804456-e7dca7f59d54${UNSPLASH_PARAMS}`,
    psu: `https://images.unsplash.com/photo-1756576170672-1123237f1d77${UNSPLASH_PARAMS}`,
    case: `https://images.unsplash.com/photo-1755182528946-1dad8a79f44d${UNSPLASH_PARAMS}`,
    case_fan: `https://images.unsplash.com/photo-1587202372775-e229f172b9d7${UNSPLASH_PARAMS}`,
    thermal_paste: `https://images.unsplash.com/photo-1592919346937-c9807c7a3333${UNSPLASH_PARAMS}`,
};

export const GENERIC_COMPONENT_IMAGE = `https://images.unsplash.com/photo-1518770660439-4636190af475${UNSPLASH_PARAMS}`;

export function componentImage(
    productImage: string | null | undefined,
    componentType: ComponentType | null | undefined,
): string {
    if (productImage) {
        return productImage;
    }

    return componentType
        ? COMPONENT_PLACEHOLDER_IMAGES[componentType]
        : GENERIC_COMPONENT_IMAGE;
}
