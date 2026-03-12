import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import ProductMediaBlock from '@/components/store/product-media-block';
import { cn } from '@/lib/utils';

type ProductCardProps = {
    href: string;
    name: string;
    description: string;
    image?: string | null;
    price: string;
    note?: string;
    availability: 'In stock' | 'Pre-order';
    color?: string | null;
    action:
        | {
              label: string;
              onClick: () => void;
              kind: 'buy';
          }
        | {
              label: string;
              href: string;
              kind: 'buy';
          };
    className?: string;
};

export default function ProductCard({
    href,
    name,
    description,
    image,
    price,
    note,
    availability,
    color,
    action,
    className,
}: ProductCardProps) {
    const inStock = availability === 'In stock';

    return (
        <article
            className={cn(
                'rounded-2xl border border-white/10 bg-[#111722]/90 p-4 shadow-[0_16px_30px_rgba(0,0,0,0.35)] transition hover:border-[#00bd7d]/35 hover:bg-[#151d2a]',
                className,
            )}
        >
            <div className="flex items-center justify-between">
                <div
                    className={`inline-flex items-center gap-2 text-sm ${
                        inStock ? 'text-[#b9ffd2]' : 'text-amber-300'
                    }`}
                >
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${
                            inStock
                                ? 'bg-[#b6ff37] shadow-[0_0_10px_rgba(182,255,55,0.8)]'
                                : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                        }`}
                    />
                    {availability}
                </div>

                {color ? (
                    <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                        {color}
                    </span>
                ) : null}
            </div>

            <Link href={href} className="group mt-3 block">
                <ProductMediaBlock imageSrc={image} imageAlt={name} />
            </Link>

            <div className="mt-4 space-y-2">
                <Link
                    href={href}
                    className="text-[1.72rem] font-black leading-tight text-white transition hover:text-[#9cf5d8]"
                >
                    {name}
                </Link>

                <p className="text-sm leading-relaxed text-slate-300">{description}</p>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                    <p className="text-3xl font-black text-white">{price}</p>
                    {note ? <p className="mt-1 text-xs text-slate-400">{note}</p> : null}
                </div>

                {'href' in action ? (
                    <Link
                        href={action.href}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_16px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {action.label}
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={action.onClick}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_16px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {action.label}
                    </button>
                )}
            </div>
        </article>
    );
}
