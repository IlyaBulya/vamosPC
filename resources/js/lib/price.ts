const euroFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatPrice(priceInCents: number): string {
    return euroFormatter.format(priceInCents / 100);
}
