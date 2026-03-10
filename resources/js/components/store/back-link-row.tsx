import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

type BackLinkRowProps = {
    href: string;
    label: string;
};

export default function BackLinkRow({ href, label }: BackLinkRowProps) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#9cf5d8]"
        >
            <ChevronLeft className="h-4 w-4" />
            {label}
        </Link>
    );
}
