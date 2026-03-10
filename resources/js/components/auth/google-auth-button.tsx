type GoogleAuthButtonProps = {
    href?: string;
    label?: string;
};

export default function GoogleAuthButton({
    href = '/auth/google/redirect',
    label = 'Continue with Google',
}: GoogleAuthButtonProps) {
    return (
        <a
            href={href}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-[#00bd7d]/50 hover:bg-[#00bd7d]/10"
        >
            <span className="text-base font-bold text-[#00bd7d]">G</span>
            {label}
        </a>
    );
}
