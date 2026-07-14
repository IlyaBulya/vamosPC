/**
 * Mirror of app/Support/Specs/SpecSchema.php — keep both in sync.
 *
 * Drives the admin spec form fields and the spec chips in the
 * configurator option rows.
 */

export type ComponentType =
    | 'gpu'
    | 'cpu'
    | 'motherboard'
    | 'cooler'
    | 'ram'
    | 'storage'
    | 'psu'
    | 'case'
    | 'case_fan'
    | 'thermal_paste';

export type SpecFieldType =
    | 'integer'
    | 'string'
    | 'boolean'
    | 'enum'
    | 'enum_list';

export type SpecField = {
    key: string;
    label: string;
    type: SpecFieldType;
    unit?: string;
    options?: readonly (string | number)[];
};

export const RAM_TYPES = ['DDR4', 'DDR5'] as const;
export const MOBO_FORM_FACTORS = ['E-ATX', 'ATX', 'mATX', 'ITX'] as const;
export const PSU_FORM_FACTORS = ['ATX', 'SFX'] as const;
export const STORAGE_INTERFACES = ['m2_nvme', 'sata'] as const;
export const COOLER_TYPES = ['air', 'aio'] as const;
export const RADIATOR_SIZES = [120, 240, 280, 360, 420] as const;

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
    gpu: 'Graphics Card',
    cpu: 'Processor',
    motherboard: 'Motherboard',
    cooler: 'Cooling',
    ram: 'Memory',
    storage: 'Storage',
    psu: 'Power Supply',
    case: 'Case',
    case_fan: 'Case Fans',
    thermal_paste: 'Thermal Interface',
};

export const SPEC_SCHEMA: Record<ComponentType, SpecField[]> = {
    cpu: [
        { key: 'socket', label: 'Socket', type: 'string' },
        { key: 'tdp_watts', label: 'TDP', type: 'integer', unit: 'W' },
        {
            key: 'supported_ram_types',
            label: 'Supported RAM',
            type: 'enum_list',
            options: RAM_TYPES,
        },
        { key: 'has_igpu', label: 'Integrated graphics', type: 'boolean' },
    ],
    gpu: [
        { key: 'length_mm', label: 'Length', type: 'integer', unit: 'mm' },
        { key: 'tdp_watts', label: 'TDP', type: 'integer', unit: 'W' },
        {
            key: 'recommended_psu_watts',
            label: 'Recommended PSU',
            type: 'integer',
            unit: 'W',
        },
        { key: 'power_connectors', label: 'Power connectors', type: 'string' },
        { key: 'vram_gb', label: 'VRAM', type: 'integer', unit: 'GB' },
    ],
    motherboard: [
        { key: 'socket', label: 'Socket', type: 'string' },
        { key: 'chipset', label: 'Chipset', type: 'string' },
        {
            key: 'form_factor',
            label: 'Form factor',
            type: 'enum',
            options: MOBO_FORM_FACTORS,
        },
        { key: 'ram_type', label: 'RAM type', type: 'enum', options: RAM_TYPES },
        { key: 'ram_slots', label: 'RAM slots', type: 'integer' },
        { key: 'max_ram_gb', label: 'Max RAM', type: 'integer', unit: 'GB' },
        { key: 'm2_slots', label: 'M.2 slots', type: 'integer' },
        { key: 'sata_ports', label: 'SATA ports', type: 'integer' },
    ],
    cooler: [
        {
            key: 'cooler_type',
            label: 'Cooler type',
            type: 'enum',
            options: COOLER_TYPES,
        },
        { key: 'sockets', label: 'Supported sockets', type: 'enum_list' },
        { key: 'height_mm', label: 'Height', type: 'integer', unit: 'mm' },
        {
            key: 'radiator_mm',
            label: 'Radiator size',
            type: 'enum',
            options: RADIATOR_SIZES,
        },
        {
            key: 'tdp_rating_watts',
            label: 'TDP rating',
            type: 'integer',
            unit: 'W',
        },
    ],
    ram: [
        { key: 'ram_type', label: 'RAM type', type: 'enum', options: RAM_TYPES },
        { key: 'speed_mt', label: 'Speed', type: 'integer', unit: 'MT/s' },
        { key: 'modules', label: 'Modules', type: 'integer' },
        { key: 'capacity_gb', label: 'Capacity', type: 'integer', unit: 'GB' },
    ],
    storage: [
        {
            key: 'interface',
            label: 'Interface',
            type: 'enum',
            options: STORAGE_INTERFACES,
        },
        { key: 'capacity_gb', label: 'Capacity', type: 'integer', unit: 'GB' },
    ],
    psu: [
        { key: 'wattage', label: 'Wattage', type: 'integer', unit: 'W' },
        {
            key: 'form_factor',
            label: 'Form factor',
            type: 'enum',
            options: PSU_FORM_FACTORS,
        },
        { key: 'length_mm', label: 'Length', type: 'integer', unit: 'mm' },
        { key: 'pcie_connectors', label: 'PCIe connectors', type: 'string' },
    ],
    case: [
        {
            key: 'mobo_form_factors',
            label: 'Motherboard support',
            type: 'enum_list',
            options: MOBO_FORM_FACTORS,
        },
        {
            key: 'max_gpu_length_mm',
            label: 'Max GPU length',
            type: 'integer',
            unit: 'mm',
        },
        {
            key: 'max_cooler_height_mm',
            label: 'Max cooler height',
            type: 'integer',
            unit: 'mm',
        },
        {
            key: 'radiator_support',
            label: 'Radiator support',
            type: 'enum_list',
            options: RADIATOR_SIZES,
        },
        {
            key: 'psu_form_factor',
            label: 'PSU form factor',
            type: 'enum',
            options: PSU_FORM_FACTORS,
        },
    ],
    case_fan: [{ key: 'size_mm', label: 'Fan size', type: 'integer', unit: 'mm' }],
    thermal_paste: [],
};
