'use client';

import { useEffect, useState } from 'react';

import { CloseIcon } from '@/components/ui/icons';
import { useT } from '@/hooks/i18n/use-t';
import { ApiError } from '@/services/api-error';
import { getSharedSafari } from '@/services/shared-safari.service';
import type { ConsoleSafari, Member } from '@/types/shared-safari.types';

import { NO_VALUE, stamp } from './shared-safari-format';

export type MemberListKind = 'joined' | 'left';

export const memberTime = (member: Member, kind: MemberListKind): string =>
    kind === 'left' && member.leftAt ? stamp(member.leftAt) : stamp(member.joinedAt);

export function MembersDialog({
    safari,
    kind,
    onClose,
}: {
    readonly safari: ConsoleSafari;
    readonly kind: MemberListKind;
    readonly onClose: () => void;
}) {
    const t = useT();
    const [members, setMembers] = useState<readonly Member[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let current = true;
        getSharedSafari(safari.id)
            .then((detail) => {
                if (current) setMembers(kind === 'left' ? detail.left : detail.joined);
            })
            .catch((failure: unknown) => {
                if (!current) return;
                setError(
                    failure instanceof ApiError && failure.code !== ApiError.NETWORK_ERROR
                        ? t(failure.message)
                        : t('This list could not be loaded. Please try again.'),
                );
            });
        return () => {
            current = false;
        };
    }, [safari.id, kind, t]);

    const count = members ? members.length : kind === 'left' ? safari.leftCount : safari.joinedCount;
    const title =
        kind === 'left'
            ? t('Left ({count}) — {title}', { count, title: safari.title })
            : t('Joined ({count}) — {title}', { count, title: safari.title });
    const column = kind === 'left' ? t('Left on') : t('Joined on');
    const rows = members ?? [];

    return (
        <div className="overlay" onClick={onClose}>
            <div
                className="modal "
                role="dialog"
                aria-modal="true"
                aria-labelledby="jl-t"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-head">
                    <h2 className="modal-title" id="jl-t">
                        {title}
                    </h2>
                    <button type="button" className="btn-icon" aria-label={t('Close')} onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modal-body">
                    {error ? (
                        <div className="banner banner-danger" role="alert">
                            {error}
                        </div>
                    ) : (
                        <>
                            <div className="table-scroll ssc-only-desktop">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">{t('Member')}</th>
                                            <th scope="col">{column}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((member) => (
                                            <tr key={member.id}>
                                                <td>{member.name}</td>
                                                <td>{memberTime(member, kind)}</td>
                                            </tr>
                                        ))}
                                        {members !== null && rows.length === 0 && (
                                            <tr>
                                                <td colSpan={2}>
                                                    <span className="empty-value">{NO_VALUE}</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="ssc-list ssc-only-mobile">
                                {rows.map((member) => (
                                    <div key={member.id} className="ssc-card">
                                        <b>{member.name}</b>
                                        <span className="ss-cap">
                                            {column} {memberTime(member, kind)}
                                        </span>
                                    </div>
                                ))}
                                {members !== null && rows.length === 0 && (
                                    <div className="ssc-card">
                                        <span className="empty-value">{NO_VALUE}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
