import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SPEC_SCHEMA, type ComponentType } from '@/lib/spec-schema';

export type SpecValues = Record<string, string | boolean | string[]>;

/**
 * Dynamic spec inputs for the given component type, driven by SPEC_SCHEMA.
 * All values are kept as strings/arrays in form state; the server casts
 * them via SpecSchema::filter().
 */
export default function SpecFields({
    componentType,
    values,
    onChange,
}: {
    componentType: ComponentType;
    values: SpecValues;
    onChange: (key: string, value: string | boolean | string[]) => void;
}) {
    const fields = SPEC_SCHEMA[componentType];

    if (!fields.length) {
        return null;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
                const value = values[field.key];

                if (field.type === 'boolean') {
                    return (
                        <div
                            key={field.key}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a121f] px-3 py-2.5"
                        >
                            <Checkbox
                                id={`spec-${field.key}`}
                                checked={value === true}
                                onCheckedChange={(checked) =>
                                    onChange(field.key, checked === true)
                                }
                            />
                            <Label
                                htmlFor={`spec-${field.key}`}
                                className="text-sm text-slate-200"
                            >
                                {field.label}
                            </Label>
                        </div>
                    );
                }

                if (field.type === 'enum') {
                    return (
                        <div key={field.key} className="grid gap-1.5">
                            <Label
                                htmlFor={`spec-${field.key}`}
                                className="text-xs text-slate-400"
                            >
                                {field.label}
                            </Label>
                            <select
                                id={`spec-${field.key}`}
                                value={typeof value === 'string' ? value : ''}
                                onChange={(event) =>
                                    onChange(field.key, event.target.value)
                                }
                                className="h-10 rounded-xl border border-white/15 bg-[#0b1321] px-3 text-sm text-slate-100"
                            >
                                <option value="">—</option>
                                {(field.options ?? []).map((option) => (
                                    <option key={option} value={String(option)}>
                                        {option}
                                        {field.unit ? ` ${field.unit}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                if (field.type === 'enum_list' && (field.options?.length ?? 0) > 0) {
                    const selected = Array.isArray(value) ? value : [];

                    return (
                        <div key={field.key} className="grid gap-1.5">
                            <p className="text-xs text-slate-400">
                                {field.label}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(field.options ?? []).map((option) => {
                                    const optionValue = String(option);
                                    const isChecked =
                                        selected.includes(optionValue);

                                    return (
                                        <button
                                            key={optionValue}
                                            type="button"
                                            onClick={() =>
                                                onChange(
                                                    field.key,
                                                    isChecked
                                                        ? selected.filter(
                                                              (item) =>
                                                                  item !==
                                                                  optionValue,
                                                          )
                                                        : [
                                                              ...selected,
                                                              optionValue,
                                                          ],
                                                )
                                            }
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                                isChecked
                                                    ? 'border-[#00bd7d]/70 bg-[#00bd7d]/15 text-[#9cf5d8]'
                                                    : 'border-white/15 text-slate-400 hover:border-white/30'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }

                // integer, string, and free-form enum_list (comma-separated)
                const isFreeList =
                    field.type === 'enum_list' && !(field.options?.length ?? 0);

                return (
                    <div key={field.key} className="grid gap-1.5">
                        <Label
                            htmlFor={`spec-${field.key}`}
                            className="text-xs text-slate-400"
                        >
                            {field.label}
                            {field.unit ? ` (${field.unit})` : ''}
                            {isFreeList ? ' (comma-separated)' : ''}
                        </Label>
                        <Input
                            id={`spec-${field.key}`}
                            type={field.type === 'integer' ? 'number' : 'text'}
                            min={field.type === 'integer' ? 0 : undefined}
                            value={
                                typeof value === 'string'
                                    ? value
                                    : Array.isArray(value)
                                      ? value.join(', ')
                                      : ''
                            }
                            onChange={(event) =>
                                onChange(field.key, event.target.value)
                            }
                            className="h-10 border-white/15 bg-[#0b1321] text-slate-100"
                        />
                    </div>
                );
            })}
        </div>
    );
}
