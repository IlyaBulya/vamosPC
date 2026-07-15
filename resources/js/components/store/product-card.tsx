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
                'flex h-full min-w-0 flex-col rounded-[20px] border border-white/10 bg-[#111722]/90 p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.32)] transition active:border-[#00bd7d]/35 sm:block sm:h-auto sm:rounded-2xl sm:p-4 sm:shadow-[0_16px_30px_rgba(0,0,0,0.35)] sm:hover:border-[#00bd7d]/35 sm:hover:bg-[#151d2a]',
                className,
            )}
        >
            <div className="flex min-w-0 items-center justify-between gap-1.5">
                <div
                    className={`inline-flex min-w-0 items-center gap-1 text-[0.68rem] font-semibold sm:gap-2 sm:text-sm sm:font-normal ${
                        inStock ? 'text-[#b9ffd2]' : 'text-amber-300'
                    }`}
                >
                    <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full sm:h-2.5 sm:w-2.5 ${
                            inStock
                                ? 'bg-[#b6ff37] shadow-[0_0_10px_rgba(182,255,55,0.8)]'
                                : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                        }`}
                    />
                    <span className="truncate sm:overflow-visible sm:whitespace-normal">
                        {availability}
                    </span>
                </div>

                {color ? (
                    <span className="hidden text-xs tracking-[0.12em] text-slate-400 uppercase sm:block">
                        {color}
                    </span>
                ) : null}
            </div>

            <Link href={href} className="group mt-2 block sm:mt-3">
                <ProductMediaBlock
                    imageSrc={image}
                    imageAlt={name}
                    imageLoading="lazy"
                    className="rounded-[14px] p-1.5 sm:rounded-xl sm:p-4"
                    aspectClassName="aspect-square rounded-[10px] sm:aspect-[16/10] sm:rounded-lg"
                />
            </Link>

            <div className="mt-2.5 sm:mt-4">
                <Link
                    href={href}
                    className="line-clamp-2 block min-h-[2.2rem] text-[0.9rem] leading-[1.15] font-extrabold text-white transition active:text-[#9cf5d8] min-[375px]:text-base sm:line-clamp-none sm:min-h-0 sm:text-[1.72rem] sm:leading-tight sm:font-black sm:hover:text-[#9cf5d8]"
                >
                    {name}
                </Link>

                <p className="mt-2 hidden text-sm leading-relaxed text-slate-300 sm:block">
                    {description}
                </p>
            </div>

            <div className="mt-auto pt-3 sm:flex sm:items-end sm:justify-between sm:gap-3 sm:pt-5">
                <div className="min-w-0">
                    <p className="truncate text-[1.05rem] leading-none font-black tracking-tight text-white tabular-nums min-[375px]:text-lg sm:overflow-visible sm:text-3xl sm:leading-normal sm:tracking-normal sm:whitespace-normal">
                        {price}
                    </p>
                    {note ? (
                        <p className="mt-1 truncate text-[0.68rem] text-slate-400 sm:overflow-visible sm:text-xs sm:whitespace-normal">
                            {note}
                        </p>
                    ) : null}
                </div>

                {'href' in action ? (
                    <Link
                        href={action.href}
                        className="mt-2 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-[#00bd7d] px-2 py-2 text-[0.72rem] font-bold text-[#04120d] shadow-[0_0_14px_rgba(0,189,125,0.38)] transition active:bg-[#18d99a] sm:mt-0 sm:min-h-0 sm:w-auto sm:rounded-full sm:px-4 sm:text-sm sm:font-semibold sm:shadow-[0_0_16px_rgba(0,189,125,0.45)] sm:hover:bg-[#18d99a]"
                    >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {action.label}
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={action.onClick}
                        className="mt-2 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-[#00bd7d] px-2 py-2 text-[0.72rem] font-bold text-[#04120d] shadow-[0_0_14px_rgba(0,189,125,0.38)] transition active:bg-[#18d99a] sm:mt-0 sm:min-h-0 sm:w-auto sm:rounded-full sm:px-4 sm:text-sm sm:font-semibold sm:shadow-[0_0_16px_rgba(0,189,125,0.45)] sm:hover:bg-[#18d99a]"
                    >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {action.label}
                    </button>
                )}
            </div>
        </article>
    );
}
