'use client';

import { useEffect, useState } from 'react';

import { Toast } from '@/components/ui/toast';
import { useT } from '@/hooks/i18n/use-t';

const SIGNED_UP_KEY = 'signedUpFirstName';

const firstNameOf = (name: string): string => name.trim().split(/\s+/)[0] ?? '';

export const rememberSignUp = (name: string): void => {
    try {
        window.sessionStorage.setItem(SIGNED_UP_KEY, firstNameOf(name));
    } catch {
        return;
    }
};

const takeSignUp = (): string | null => {
    try {
        const firstName = window.sessionStorage.getItem(SIGNED_UP_KEY);
        window.sessionStorage.removeItem(SIGNED_UP_KEY);
        return firstName;
    } catch {
        return null;
    }
};

export function SignedUpWelcome() {
    const t = useT();
    const [firstName, setFirstName] = useState<string | null>(null);

    useEffect(() => {
        const taken = takeSignUp();
        if (taken !== null) queueMicrotask(() => setFirstName(taken));
    }, []);

    if (firstName === null) return null;
    return (
        <Toast
            message={t('Welcome, {name}! Your account is created.', { name: firstName })}
            onClose={() => setFirstName(null)}
        />
    );
}
