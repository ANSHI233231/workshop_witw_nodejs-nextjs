'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type PageAnswer<T> = { readonly items: readonly T[]; readonly hasMore: boolean };

type PagedState<T> = {
    readonly items: readonly T[];
    readonly page: number;
    readonly hasMore: boolean;
    readonly loaded: boolean;
};

const EMPTY = { items: [], page: 0, hasMore: false, loaded: false } as const;

export function usePagedList<T extends { readonly id: number }>(
    load: (page: number) => Promise<PageAnswer<T>>,
    enabled: boolean,
    onError: (error: unknown) => void,
) {
    const [state, setState] = useState<PagedState<T>>(EMPTY);
    const [loadingMore, setLoadingMore] = useState(false);
    const generation = useRef(0);
    const busy = useRef(false);
    const errorHandler = useRef(onError);

    useEffect(() => {
        errorHandler.current = onError;
    });

    useEffect(() => {
        generation.current += 1;
        const mine = generation.current;
        busy.current = false;
        queueMicrotask(() => {
            if (mine !== generation.current) return;
            setState(EMPTY);
            setLoadingMore(false);
        });
        if (!enabled) return;
        load(1)
            .then((answer) => {
                if (mine !== generation.current) return;
                setState({ items: answer.items, page: 1, hasMore: answer.hasMore, loaded: true });
            })
            .catch((error: unknown) => {
                if (mine === generation.current) errorHandler.current(error);
            });
    }, [load, enabled]);

    const loadMore = useCallback(async () => {
        if (busy.current || !state.hasMore) return;
        busy.current = true;
        setLoadingMore(true);
        const mine = generation.current;
        try {
            const answer = await load(state.page + 1);
            if (mine !== generation.current) return;
            setState((current) => ({
                items: [...current.items, ...answer.items.filter((next) => !current.items.some((item) => item.id === next.id))],
                page: current.page + 1,
                hasMore: answer.hasMore,
                loaded: true,
            }));
        } catch (error) {
            if (mine === generation.current) errorHandler.current(error);
        } finally {
            busy.current = false;
            setLoadingMore(false);
        }
    }, [load, state.hasMore, state.page]);

    const refresh = useCallback(async () => {
        const mine = generation.current;
        const pages = Math.max(state.page, 1);
        try {
            let items: readonly T[] = [];
            let hasMore = false;
            for (let page = 1; page <= pages; page += 1) {
                const answer = await load(page);
                items = [...items, ...answer.items];
                hasMore = answer.hasMore;
                if (!answer.hasMore) break;
            }
            if (mine !== generation.current) return;
            setState((current) => ({ ...current, items, hasMore }));
        } catch (error) {
            if (mine === generation.current) errorHandler.current(error);
        }
    }, [load, state.page]);

    const update = useCallback((next: T) => {
        setState((current) => ({
            ...current,
            items: current.items.map((item) => (item.id === next.id ? next : item)),
        }));
    }, []);

    return { items: state.items, hasMore: state.hasMore, loaded: state.loaded, loadingMore, loadMore, refresh, update };
}
