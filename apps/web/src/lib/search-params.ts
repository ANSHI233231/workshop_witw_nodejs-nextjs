export type PageSearchParams = { [key: string]: string | string[] | undefined };

export const singleParam = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? (value[0] ?? '') : (value ?? '');

export const pageParam = (value: string | string[] | undefined): number => {
    const page = Number.parseInt(singleParam(value), 10);
    return Number.isInteger(page) && page > 1 ? page : 1;
};

export const searchParam = (value: string | string[] | undefined, maximum: number): string =>
    singleParam(value).trim().slice(0, maximum);

export const codeParam = <T extends number>(
    value: string | string[] | undefined,
    codes: readonly T[],
): T | undefined => {
    const number = Number(singleParam(value));
    return codes.find((code) => code === number);
};

export const idParam = (value: string | string[] | undefined): number | undefined => {
    const id = Number(singleParam(value));
    return Number.isInteger(id) && id > 0 ? id : undefined;
};
