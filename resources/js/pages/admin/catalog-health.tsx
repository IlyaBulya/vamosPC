import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    FileWarning,
    XCircle,
    Zap,
} from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';
import { type Violation } from '@/lib/configurator';
import { COMPONENT_TYPE_LABELS, type ComponentType } from '@/lib/spec-schema';

type IncompleteComponent = {
    id: number;
    name: string;
    category_name: string | null;
    component_type: string | null;
    missing: string;
    edit_href: string;
};

type ConfigurationReport = {
    id: number;
    name: string;
    slots_count: number;
    load_watts: number | null;
    errors: Violation[];
    warnings: Violation[];
    edit_href: string;
};

export default function CatalogHealthPage({
    incomplete_components,
    configurations,
}: {
    incomplete_components: IncompleteComponent[];
    configurations: ConfigurationReport[];
}) {
    const brokenConfigurations = configurations.filter(
        (configuration) =>
            configuration.errors.length || configuration.warnings.length,
    );
    const healthyCount = configurations.length - brokenConfigurations.length;

    return (
        <>
            <Head title="Catalog Health" />

            <AdminLayout
                title="Catalog Health"
                description="Components without specs and base builds with compatibility problems."
            >
                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-2">
                                <FileWarning className="h-5 w-5 text-amber-300" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Components Missing Data
                                </h2>
                                <p className="text-sm text-slate-400">
                                    These parts are skipped by compatibility
                                    checks until their specs are filled in.
                                </p>
                            </div>
                        </div>

                        {incomplete_components.length ? (
                            <div className="mt-5 space-y-2">
                                {incomplete_components.map((component) => (
                                    <Link
                                        key={component.id}
                                        href={component.edit_href}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b1321] px-4 py-3 transition hover:border-amber-400/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-white">
                                                {component.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {component.component_type
                                                    ? COMPONENT_TYPE_LABELS[
                                                          component.component_type as ComponentType
                                                      ]
                                                    : (component.category_name ??
                                                      'Uncategorized')}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                            missing {component.missing}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-5 flex items-center gap-2 rounded-2xl border border-[#00bd7d]/30 bg-[#00bd7d]/10 p-4 text-sm text-[#9cf5d8]">
                                <CheckCircle2 className="h-4 w-4" />
                                Every component has a type and specs.
                            </p>
                        )}
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2">
                                <XCircle className="h-5 w-5 text-red-300" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Base Builds
                                </h2>
                                <p className="text-sm text-slate-400">
                                    {healthyCount} of {configurations.length}{' '}
                                    configurations pass all checks.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-2">
                            {configurations.map((configuration) => {
                                const isClean =
                                    !configuration.errors.length &&
                                    !configuration.warnings.length;

                                return (
                                    <Link
                                        key={configuration.id}
                                        href={configuration.edit_href}
                                        className={`block rounded-xl border px-4 py-3 transition ${
                                            configuration.errors.length
                                                ? 'border-red-500/35 bg-red-500/[0.06] hover:border-red-500/60'
                                                : configuration.warnings.length
                                                  ? 'border-amber-400/35 bg-amber-400/[0.06] hover:border-amber-400/60'
                                                  : 'border-white/10 bg-[#0b1321] hover:border-[#00bd7d]/40'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-white">
                                                {configuration.name}
                                            </p>
                                            <span className="flex items-center gap-2 text-xs text-slate-400">
                                                {configuration.load_watts !=
                                                    null && (
                                                    <span className="flex items-center gap-1">
                                                        <Zap className="h-3 w-3 text-[#9cf5d8]" />
                                                        {
                                                            configuration.load_watts
                                                        }{' '}
                                                        W
                                                    </span>
                                                )}
                                                {isClean ? (
                                                    <CheckCircle2 className="h-4 w-4 text-[#00bd7d]" />
                                                ) : null}
                                            </span>
                                        </div>

                                        {[...configuration.errors, ...configuration.warnings].map(
                                            (violation, index) => (
                                                <p
                                                    key={index}
                                                    className={`mt-1.5 flex items-start gap-1.5 text-xs ${
                                                        violation.severity ===
                                                        'error'
                                                            ? 'text-red-300'
                                                            : 'text-amber-300'
                                                    }`}
                                                >
                                                    {violation.severity ===
                                                    'error' ? (
                                                        <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                                                    ) : (
                                                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                                                    )}
                                                    {violation.message}
                                                </p>
                                            ),
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </AdminLayout>
        </>
    );
}
