'use client';

import { useT } from '@/hooks/i18n/use-t';

export function MasterSwitch({
    name,
    active,
    busy,
    lockedReason,
    onToggle,
}: {
    readonly name: string;
    readonly active: boolean;
    readonly busy: boolean;
    readonly lockedReason?: string;
    readonly onToggle: () => void;
}) {
    const t = useT();
    const label = lockedReason ?? (active ? t('Deactivate') : t('Activate'));
    return (
        <button
            type="button"
            className={`mt-switch${active ? ' is-on' : ''}`}
            role="switch"
            aria-checked={active}
            aria-label={lockedReason === undefined ? `${label} ${name}` : `${name}: ${lockedReason}`}
            data-tooltip={label}
            disabled={busy || lockedReason !== undefined}
            onClick={onToggle}
        >
            <span className="mt-knob"></span>
        </button>
    );
}
