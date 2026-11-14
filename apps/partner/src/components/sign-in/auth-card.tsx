import type { ReactNode } from 'react';

export function AuthPage({ children }: { readonly children: ReactNode }) {
    return <div className="pq-auth">{children}</div>;
}

export function AuthLogo() {
    return <img className="pq-auth-logo" src="/witw/logo.png" alt="Walk Into The Wild" />;
}
