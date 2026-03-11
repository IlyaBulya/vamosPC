import { Link } from '@inertiajs/react';
import {
    Clock3,
    Mail,
    Music2,
    Phone,
    Send,
    ShieldCheck,
    Truck,
    Wrench,
    Youtube,
} from 'lucide-react';

type StoreFooterProps = {
    className?: string;
};

const quickLinks = [
    { href: '/catalog', label: 'Catalog' },
    { href: '/laptops', label: 'Laptops' },
    { href: '/assistance', label: 'Assistance' },
] as const;

const socialLinks = [
    {
        href: 'https://t.me/vamospc_barcelona',
        label: 'Telegram',
        icon: Send,
    },
    {
        href: 'https://www.tiktok.com/@vamospcbarcelona',
        label: 'TikTok',
        icon: Music2,
    },
    {
        href: 'https://www.youtube.com/@VamosPC',
        label: 'YouTube',
        icon: Youtube,
    },
] as const;

const trustItems = [
    { label: 'Fast Delivery', icon: Truck },
    { label: '2-Year Warranty', icon: ShieldCheck },
    { label: 'Custom Support', icon: Wrench },
] as const;

export default function StoreFooter({ className = '' }: StoreFooterProps) {
    return (
        <footer
            className={`relative z-20 border-t border-white/10 bg-[#050b16] ${className}`.trim()}
        >
            <div className="mx-auto w-full max-w-[1540px] px-4 py-8 sm:px-8 lg:px-12">
                <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr_1fr]">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-0">
                            <span className="text-[2rem] font-black tracking-[-0.015em] text-[#00bd7d]">
                                VAMOS
                            </span>
                            <img
                                src="/images/VamosLogo.png"
                                alt="VamosPC"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                        <p className="max-w-lg text-sm leading-relaxed text-slate-300">
                            Custom high-performance PCs, tuned, assembled and stress-tested
                            in Barcelona.
                        </p>
                        <div className="grid gap-2 text-sm text-slate-300">
                            <a
                                href="tel:+34613372498"
                                className="inline-flex items-center gap-2 transition hover:text-[#00bd7d]"
                            >
                                <Phone className="h-4 w-4 text-[#00bd7d]" />
                                +34 613 37 24 98
                            </a>
                            <a
                                href="mailto:hello@vamospc.store"
                                className="inline-flex items-center gap-2 transition hover:text-[#00bd7d]"
                            >
                                <Mail className="h-4 w-4 text-[#00bd7d]" />
                                hello@vamospc.store
                            </a>
                            <p className="inline-flex items-center gap-2 text-slate-400">
                                <Clock3 className="h-4 w-4 text-[#00bd7d]" />
                                Mon-Sat: 10:00 - 19:00
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#9cf5d8]">
                            Navigation
                        </h3>
                        <nav className="flex flex-col gap-2">
                            {quickLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm text-slate-300 transition hover:text-[#00bd7d]"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#9cf5d8]">
                            Community
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {socialLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm text-slate-300 transition hover:border-[#00bd7d]/60 hover:text-[#00bd7d]"
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </a>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trustItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <span
                                        key={item.label}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/30 bg-[#00bd7d]/10 px-3 py-1.5 text-xs text-[#9cf5d8]"
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {item.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-4 text-sm text-slate-400">
                    © {new Date().getFullYear()} VamosPC. Built in Barcelona. All rights
                    reserved.
                </div>
            </div>
        </footer>
    );
}
