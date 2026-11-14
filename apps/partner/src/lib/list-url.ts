export type ListParams = Readonly<Record<string, string | number | undefined>>;

export const listUrl = (path: string, params: ListParams): string => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === '') continue;
        if (key === 'page' && Number(value) <= 1) continue;
        query.set(key, String(value));
    }
    const text = query.toString();
    return text ? `${path}?${text}` : path;
};
