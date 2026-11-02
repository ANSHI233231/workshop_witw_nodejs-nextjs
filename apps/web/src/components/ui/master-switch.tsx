'use client';

import { useT } from '@/hooks/i18n/use-t';

export function MasterSwitch({
    name,
    active,
    busy,
    onToggle,
}: {
    readonly name: string;
    readonly active: boolean;
    readonly busy: boolean;
    readonly onToggle: () => void;
}) {
    const t = useT();
    const label = active ? t('Deactivate') : t('Activate');
    return (
        <button
            type="button"
            className={`mt-switch${active ? ' is-on' : ''}`}
            role="switch"
            aria-checked={active}
            aria-label={`${label} ${name}`}
            data-tooltip={label}
            disabled={busy}
            onClick={onToggle}
        >
            <span className="mt-knob"></span>
        </button>
    );
}
