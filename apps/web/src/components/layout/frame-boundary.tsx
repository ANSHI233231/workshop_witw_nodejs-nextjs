'use client';

import { Component, type ReactNode } from 'react';

type FrameBoundaryProps = { readonly fallback: ReactNode; readonly children: ReactNode };

export class FrameBoundary extends Component<FrameBoundaryProps, { readonly failed: boolean }> {
    override state = { failed: false };

    static getDerivedStateFromError(): { readonly failed: boolean } {
        return { failed: true };
    }

    override render(): ReactNode {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
