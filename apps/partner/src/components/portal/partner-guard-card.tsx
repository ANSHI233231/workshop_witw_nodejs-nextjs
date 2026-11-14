import type { ReactNode } from 'react';

import { CheckCircleIcon, LockIcon, PartnerRequestIcon } from './portal-icons';

export function PartnerGuardCard({
    title,
    text,
    action,
    locked = false,
    approved = false,
}: {
    readonly title: string;
    readonly text: string;
    readonly action?: ReactNode;
    readonly locked?: boolean;
    readonly approved?: boolean;
}) {
    return (
        <div className="pq-guard">
            {locked ? (
                <LockIcon className="icon state-icon" />
            ) : approved ? (
                <CheckCircleIcon className="icon state-icon" />
            ) : (
                <PartnerRequestIcon className="icon state-icon" />
            )}
            <h2>{title}</h2>
            <p>{text}</p>
            {action}
        </div>
    );
}
