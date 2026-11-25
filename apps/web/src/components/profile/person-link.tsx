'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/class-names';
import type { Person } from '@/types/shared-safari.types';

export const userProfilePath = (userId: number): string => `/users/${userId}`;

export const partnerProfilePath = (partnerId: number): string => `/partners/${partnerId}`;

export const profilePathOf = (person: Person): string =>
    person.partner ? partnerProfilePath(person.partner.id) : userProfilePath(person.id);

export function PersonLink({
    person,
    className,
    children,
}: {
    readonly person: Person;
    readonly className?: string;
    readonly children: ReactNode;
}) {
    return (
        <Link className={cn('up-link', className)} href={profilePathOf(person)} onClick={(event) => event.stopPropagation()}>
            {children}
        </Link>
    );
}
