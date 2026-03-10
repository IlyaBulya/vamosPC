import { Head, Link } from '@inertiajs/react';
import {
    Clock3,
    LifeBuoy,
    MessageSquareText,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

const supportCards = [
    {
        title: 'Order Support',
        description: 'Track orders, update delivery details, and payment help.',
        icon: MessageSquareText,
    },
    {
        title: 'Technical Support',
        description: 'Troubleshooting, performance checks, and system diagnostics.',
        icon: Wrench,
    },
    {
        title: 'Warranty Service',
        description: 'Fast warranty processing and replacement assistance.',
        icon: ShieldCheck,
    },
];

const faqItems = [
    {
        question: 'How fast do you answer support requests?',
        answer: 'Most requests are answered within 1 business hour during support hours.',
    },
    {
        question: 'Can I request remote diagnostics?',
        answer: 'Yes. We can run remote diagnostics and provide a detailed action plan.',
    },
    {
        question: 'Do you support upgrades after purchase?',
        answer: 'Yes. We help with compatible upgrades and post-purchase optimization.',
    },
];

export default function AssistancePage() {
    return (
        <>
            <Head title="Assistance" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]">
                            <LifeBuoy className="h-3.5 w-3.5" />
                            Assistance
                        </p>
                        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl">
                            Fast support for orders, hardware, and warranty requests.
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                            Our team helps you before and after purchase, from choosing
                            components to resolving technical issues quickly.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                href="/account"
                                className="rounded-full bg-[#00bd7d] px-6 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                            >
                                Open Account
                            </Link>
                            <a
                                href="mailto:hello@vamospc.store"
                                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                            >
                                Email Support
                            </a>
                        </div>
                    </section>

                    <section className="mt-7 grid gap-5 lg:grid-cols-3">
                        {supportCards.map((card) => (
                            <article
                                key={card.title}
                                className="rounded-2xl border border-white/10 bg-[#101722]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                            >
                                <card.icon className="h-5 w-5 text-[#00bd7d]" />
                                <h2 className="mt-3 text-xl font-bold text-white">
                                    {card.title}
                                </h2>
                                <p className="mt-2 text-sm text-slate-300">
                                    {card.description}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                            <h2 className="text-2xl font-black text-white">FAQ</h2>
                            <div className="mt-4 space-y-3">
                                {faqItems.map((item) => (
                                    <details
                                        key={item.question}
                                        className="rounded-2xl border border-white/10 bg-[#0d1623]/90 p-4"
                                    >
                                        <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                                            {item.question}
                                        </summary>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                            {item.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>

                        <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                            <h2 className="text-2xl font-black text-white">Support Hours</h2>

                            <div className="mt-4 space-y-3 text-sm text-slate-300">
                                <p className="flex items-center gap-2">
                                    <Clock3 className="h-4 w-4 text-[#00bd7d]" />
                                    Mon-Sat: 10:00-19:00
                                </p>
                                <p>Phone: +34 613 37 24 98</p>
                                <p>Email: hello@vamospc.store</p>
                            </div>

                            <div className="mt-5 rounded-2xl border border-[#00bd7d]/35 bg-[#00bd7d]/10 p-4 text-sm text-[#9cf5d8]">
                                Average first reply time:
                                <span className="ml-1 font-semibold">
                                    under 60 minutes
                                </span>
                            </div>
                        </aside>
                    </section>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
